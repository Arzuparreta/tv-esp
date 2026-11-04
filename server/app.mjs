import express from 'express'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { ATRES_CHANNELS, createPlaylistLoader, getAtresSources, isHttpUrl } from './sources.mjs'
import { createCompatibleStreamer } from './compatible.mjs'

export function rewriteManifest(body, manifestUrl, proxyBase) {
  const proxied = uri => {
    const absolute = new URL(uri, manifestUrl).href
    return isHttpUrl(absolute) ? `${proxyBase}?url=${encodeURIComponent(absolute)}` : uri
  }
  return body.split('\n').map(line => {
    const trimmed = line.trim()
    if (!trimmed) return line
    if (trimmed.startsWith('#')) return line.replace(/URI="([^"]+)"/g, (_match, uri) => `URI="${proxied(uri)}"`)
    return proxied(trimmed)
  }).join('\n')
}

export function createApp({ fetchImpl = fetch, playlistLocations = [], compatible = createCompatibleStreamer({ fetchImpl }) } = {}) {
  const app = express()
  const loadPlaylists = createPlaylistLoader(playlistLocations, fetchImpl)
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type')
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges')
    if (req.method === 'OPTIONS') return res.sendStatus(204)
    next()
  })
  app.get('/health', (_req, res) => res.json({ ok: true }))

  app.get('/sources', async (req, res) => {
    const id = req.query.ch
    if (typeof id !== 'string' || !/^[a-z0-9-]{1,80}$/.test(id)) return res.status(400).json({ error: 'Invalid channel' })
    const name = typeof req.query.name === 'string' ? req.query.name.slice(0, 120) : ''
    const epgId = typeof req.query.epg === 'string' ? req.query.epg.slice(0, 120) : ''
    const [atres, playlists] = await Promise.allSettled([
      getAtresSources(id, fetchImpl), loadPlaylists({ id, name, epgId }),
    ])
    const sources = [
      ...(atres.status === 'fulfilled' ? atres.value : []),
      ...(playlists.status === 'fulfilled' ? playlists.value.sources : []),
    ]
    const seen = new Set()
    if (compatible.available && sources.some(source => source.videoCodec === 'hevc')) {
      sources.push({ type: 'video', url: `${req.protocol}://${req.get('host')}/compatible?ch=${id}`, label: 'Atresplayer · vídeo compatible', priority: -0.5 })
    }
    res.setHeader('Cache-Control', 'no-store')
    res.json({
      sources: sources.filter(source => !seen.has(source.url) && seen.add(source.url)),
      unavailable: atres.status === 'rejected' || playlists.status === 'rejected' || playlists.value.unavailable,
    })
  })

  app.get('/compatible', async (req, res) => {
    const slug = req.query.ch
    if (typeof slug !== 'string' || !Object.hasOwn(ATRES_CHANNELS, slug)) return res.status(404).json({ error: 'Unknown channel' })
    await compatible.stream(slug, req, res)
  })

  // Compatibility for existing clients. New clients try every returned source.
  app.get('/atresplayer', async (req, res) => {
    const slug = req.query.ch
    if (typeof slug !== 'string') return res.status(400).json({ error: 'Missing ?ch= parameter' })
    if (!Object.hasOwn(ATRES_CHANNELS, slug)) return res.status(404).json({ error: 'Unknown channel' })
    try {
      const sources = await getAtresSources(slug, fetchImpl)
      if (!sources.length) return res.status(404).json({ error: 'No HLS source found' })
      res.setHeader('Cache-Control', 'no-store')
      res.redirect(302, `/proxy?url=${encodeURIComponent(sources[0].url)}`)
    } catch { res.status(502).json({ error: 'Atresplayer unavailable' }) }
  })

  app.get('/proxy', async (req, res) => {
    const targetUrl = req.query.url
    if (typeof targetUrl !== 'string' || !isHttpUrl(targetUrl)) return res.status(400).json({ error: 'Invalid URL' })
    const parsed = new URL(targetUrl)
    const proxyBase = `${req.protocol}://${req.get('host')}/proxy`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    res.on('close', () => controller.abort())
    try {
      const upstream = await fetchImpl(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          Referer: parsed.origin + '/', Origin: parsed.origin,
          ...(req.headers.range ? { Range: req.headers.range } : {}),
        },
        signal: controller.signal,
      })
      if (!upstream.ok) {
        await upstream.body?.cancel()
        return res.status(upstream.status).json({ error: `Upstream returned ${upstream.status}` })
      }
      const contentType = upstream.headers.get('content-type') || ''
      const manifestUrl = upstream.url || targetUrl
      if (/\.m3u8$/i.test(new URL(manifestUrl).pathname) || /mpegurl|m3u8/i.test(contentType)) {
        const body = await upstream.text()
        if (!body.trimStart().startsWith('#EXTM3U')) return res.status(502).json({ error: 'Invalid HLS manifest' })
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl')
        res.setHeader('Cache-Control', 'no-store')
        return res.send(rewriteManifest(body, manifestUrl, proxyBase))
      }
      res.status(upstream.status)
      res.setHeader('Content-Type', contentType || 'application/octet-stream')
      for (const header of ['content-length', 'content-range', 'accept-ranges']) {
        const value = upstream.headers.get(header)
        if (value) res.setHeader(header, value)
      }
      if (!upstream.body) return res.status(502).end()
      await pipeline(Readable.fromWeb(upstream.body), res)
    } catch {
      if (!res.headersSent && !res.destroyed) res.status(502).json({ error: 'Proxy fetch failed' })
    } finally { clearTimeout(timeout) }
  })
  return app
}
