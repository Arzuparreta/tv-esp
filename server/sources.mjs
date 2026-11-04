import { readFile } from 'node:fs/promises'

export const ATRES_CHANNELS = {
  antena3: '5a6a165a7ed1a834493ebf6a',
  lasexta: '5a6a172c7ed1a834493ebf6b',
  neox: '5a6a17da7ed1a834493ebf6d',
  nova: '5a6a180b7ed1a834493ebf6e',
  mega: '5a6a18357ed1a834493ebf6f',
  atreseries: '5a6a189a7ed1a834493ebf70',
}

// Prefer the official ad-supported feed. The older CDN currently returns 492.
const ATRES_HLS_TYPES = [
  'application/hls+ssai',
  'application/vnd.apple.mpegurl',
  'application/x-mpegurl',
  'application/hls+legacy',
  'application/hls+legacyv3',
  'application/hls+4K',
]

export function isHttpUrl(value) {
  try { return ['http:', 'https:'].includes(new URL(value).protocol) } catch { return false }
}

export async function getAtresSources(slug, fetchImpl = fetch) {
  const id = Object.hasOwn(ATRES_CHANNELS, slug) && ATRES_CHANNELS[slug]
  if (!id) return []
  const response = await fetchImpl(`https://api.atresplayer.com/player/v1/live/${id}`, {
    signal: AbortSignal.timeout(7000), headers: { Accept: 'application/json' },
  })
  if (!response.ok) throw new Error(`Atresplayer HTTP ${response.status}`)
  const data = await response.json()
  if (data.error) throw new Error('Atresplayer unavailable')
  const seen = new Set()
  return ATRES_HLS_TYPES.flatMap(type => (data.sourcesLive ?? [])
    .filter(source => source.type === type && isHttpUrl(source.src))
    .filter(source => !seen.has(source.src) && seen.add(source.src))
    .map(source => ({ type: 'hls', url: source.src, label: type === 'application/hls+ssai' ? 'Atresplayer' : 'Atresplayer · alternativa',
      ...(type === 'application/hls+4K' ? { videoCodec: 'hevc' } : {}),
    })))
}

const normalize = value => value.normalize('NFD').replace(/\p{Diacritic}/gu, '')
  .toLowerCase().replace(/\s+(?:fhd|uhd|hd)$/i, '').replace(/[^a-z0-9]/g, '')

// M3U is a channel index, not a video format. Only HLS entries can use hls.js.
export function parseM3u(body, baseUrl) {
  const entries = []
  let metadata = null
  for (const rawLine of body.replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const line = rawLine.trim()
    if (line.startsWith('#EXTINF:')) {
      const attributes = Object.fromEntries([...line.matchAll(/([\w-]+)="([^"]*)"/g)].map(match => [match[1], match[2]]))
      const title = line.replace(/"[^"]*"/g, '').split(',').slice(1).join(',').trim()
      metadata = { id: attributes['tvg-id'] ?? '', name: attributes['tvg-name'] || title }
    } else if (line && !line.startsWith('#') && metadata) {
      try {
        const url = new URL(line, baseUrl)
        if (isHttpUrl(url.href) && /\.m3u8$/i.test(url.pathname)) entries.push({ ...metadata, url: url.href })
      } catch { /* A malformed entry must not discard the rest of the playlist. */ }
      metadata = null
    }
  }
  return entries
}

export function matchPlaylistSources(entries, { id, epgId, name }, label = 'Lista configurada') {
  const matches = new Set([id, epgId, name].filter(Boolean).map(normalize))
  return entries.filter(entry => matches.has(normalize(entry.id)) || matches.has(normalize(entry.name)))
    .map(entry => ({ type: 'hls', url: entry.url, label, priority: -1 }))
}

const MAX_PLAYLIST_BYTES = 2 * 1024 * 1024
async function readPlaylist(location, fetchImpl) {
  if (!isHttpUrl(location)) return readFile(location, 'utf8')
  const response = await fetchImpl(location, { signal: AbortSignal.timeout(4000) })
  if (!response.ok) throw new Error(`Playlist HTTP ${response.status}`)
  let size = 0
  const chunks = []
  for await (const chunk of response.body) {
    size += chunk.byteLength
    if (size > MAX_PLAYLIST_BYTES) throw new Error('Playlist too large')
    chunks.push(Buffer.from(chunk))
  }
  return Buffer.concat(chunks).toString('utf8')
}

export function createPlaylistLoader(locations, fetchImpl = fetch) {
  const cache = new Map()
  return async channel => {
    const results = await Promise.allSettled(locations.map(async (location, index) => {
      let item = cache.get(location)
      if (!item || item.expires < Date.now()) {
        // Cache in-flight reads too; channel changes must not refetch every list.
        item = { expires: Date.now() + 60000, promise: readPlaylist(location, fetchImpl).then(body => {
          if (Buffer.byteLength(body) > MAX_PLAYLIST_BYTES || !body.trimStart().startsWith('#EXTM3U')) throw new Error('Invalid playlist')
          return parseM3u(body, isHttpUrl(location) ? location : undefined)
        }) }
        cache.set(location, item)
      }
      return matchPlaylistSources(await item.promise, channel, `Lista ${index + 1}`)
    }))
    return {
      sources: results.flatMap(result => result.status === 'fulfilled' ? result.value : []),
      unavailable: results.some(result => result.status === 'rejected'),
    }
  }
}
