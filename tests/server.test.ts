import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Server } from 'node:http'
import { EventEmitter } from 'node:events'
import { PassThrough } from 'node:stream'
import { createApp, rewriteManifest } from '../server/app.mjs'
import { createPlaylistLoader, getAtresSources, matchPlaylistSources, parseM3u } from '../server/sources.mjs'
import { createCompatibleStreamer, selectCompatibleFeed } from '../server/compatible.mjs'

const servers: Server[] = []
async function serve(options = {}) {
  const server = createApp(options).listen(0, '127.0.0.1')
  servers.push(server)
  await new Promise<void>(resolve => server.once('listening', resolve))
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Missing test port')
  return `http://127.0.0.1:${address.port}`
}
afterEach(async () => {
  await Promise.all(servers.splice(0).map(server => new Promise<void>((resolve, reject) => {
    server.closeAllConnections()
    server.close(error => error ? reject(error) : resolve())
  })))
})

const playlist = '#EXTM3U\n#EXTINF:-1 tvg-id="LaSexta.TV" tvg-name="La Sexta HD",La Sexta\nhttps://tuner.example/6/index.m3u8\n'
const channel = { id: 'lasexta', name: 'La Sexta', epgId: 'LaSexta.TV' }

describe('official source resolver', () => {
  it('prefers SSAI, retains alternatives, deduplicates legacy URLs and never requests a DRM bypass', async () => {
    const fetchImpl = vi.fn(async () => Response.json({ sourcesLive: [
      { type: 'application/vnd.apple.mpegurl', src: 'https://cdn.example/old.m3u8' },
      { type: 'application/hls+ssai', src: 'https://cdn.example/ssai.m3u8' },
      { type: 'application/hls+legacy', src: 'https://cdn.example/old.m3u8' },
      { type: 'application/dash+xml', src: 'https://cdn.example/drm.mpd' },
      { type: 'application/hls+4K', src: 'https://cdn.example/4k.m3u8' },
    ] }))
    const sources = await getAtresSources('lasexta', fetchImpl)
    expect(sources.map((source: { url: string }) => source.url)).toEqual([
      'https://cdn.example/ssai.m3u8', 'https://cdn.example/old.m3u8', 'https://cdn.example/4k.m3u8',
    ])
    expect(fetchImpl.mock.calls[0][0]).not.toContain('NODRM')
  })
  it('rejects prototype names as channel IDs', async () => {
    const fetchImpl = vi.fn()
    expect(await getAtresSources('toString', fetchImpl)).toEqual([])
    expect(fetchImpl).not.toHaveBeenCalled()
  })
  it('keeps configured sources if the official API fails', async () => {
    const fetchImpl = vi.fn(async (url: string) => url.startsWith('https://api.atresplayer.com')
      ? new Response('', { status: 503 }) : new Response(playlist))
    const origin = await serve({ fetchImpl, playlistLocations: ['https://tuner.example/channels.m3u'] })
    const res = await fetch(`${origin}/sources?ch=lasexta&epg=LaSexta.TV`)
    expect(res.headers.get('cache-control')).toBe('no-store')
    expect(await res.json()).toMatchObject({ unavailable: true, sources: [{ url: 'https://tuner.example/6/index.m3u8' }] })
  })
})

describe('configured M3U playlists', () => {
  it('matches exact IDs and normalized names, and ignores unsupported protocols and transports', () => {
    const body = '\uFEFF' + playlist.replace(/\n/g, '\r\n') + [
      '#EXTINF:-1,À Punt HD', 'relative.m3u8?token=abc',
      '#EXTINF:-1,Other', 'rtsp://example.com/live',
      '#EXTINF:-1,La Sexta', 'https://example.com/raw.ts',
      '#EXTINF:-1,La Sexta', 'file:///private.m3u8',
    ].join('\n')
    const entries = parseM3u(body, 'https://tuner.example/list/channels.m3u')
    expect(entries).toHaveLength(2)
    expect(matchPlaylistSources(entries, channel)).toHaveLength(1)
    expect(matchPlaylistSources(entries, { id: 'apunt', name: 'À Punt' })[0].url).toBe('https://tuner.example/list/relative.m3u8?token=abc')
    expect(matchPlaylistSources(entries, { id: 'sexta2', name: 'La Sexta 2' })).toHaveLength(0)
  })
  it('retains working lists when another fails, and shares cached/in-flight reads', async () => {
    const fetchImpl = vi.fn(async (url: string) => {
      if (url.includes('broken')) throw new Error('Offline')
      return new Response(playlist)
    })
    const load = createPlaylistLoader(['https://tuner.example/good.m3u', 'https://tuner.example/broken.m3u'], fetchImpl)
    const results = await Promise.all([load(channel), load(channel)])
    expect(results.every(result => result.sources.length === 1 && result.unavailable)).toBe(true)
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })
})

describe('HLS proxy', () => {
  it('resolves parent directories, protocol-relative URLs, query-only URLs and tag URIs', () => {
    const body = '#EXTM3U\n#EXT-X-KEY:METHOD=AES-128,URI="../key?token=1"\n#EXT-X-MAP:URI="//cdn.example/init.mp4"\n../video/index.m3u8?session=2\n?session=3\n#EXT-X-KEY:METHOD=SAMPLE-AES,URI="skd://license"'
    const result = rewriteManifest(body, 'https://up.example/a/b/master.m3u8', 'http://local/proxy')
    for (const url of ['https://up.example/a/key?token=1', 'https://cdn.example/init.mp4', 'https://up.example/a/video/index.m3u8?session=2', 'https://up.example/a/b/master.m3u8?session=3']) {
      expect(result).toContain(encodeURIComponent(url))
    }
    expect(result).toContain('URI="skd://license"')
  })
  it('uses the final upstream URL after redirects when rewriting relative paths', async () => {
    const response = new Response('#EXTM3U\nsegment.ts', { headers: { 'Content-Type': 'application/vnd.apple.mpegurl' } })
    Object.defineProperty(response, 'url', { value: 'https://cdn.example/final/index.m3u8' })
    const origin = await serve({ fetchImpl: async () => response })
    const result = await fetch(`${origin}/proxy?url=https://old.example/start.m3u8`)
    expect(await result.text()).toContain(encodeURIComponent('https://cdn.example/final/segment.ts'))
  })
  it('preserves byte-range requests and partial responses for native HLS', async () => {
    const fetchImpl = vi.fn(async () => new Response(new Uint8Array([1, 2, 3]), {
      status: 206, headers: { 'Content-Range': 'bytes 0-2/100', 'Accept-Ranges': 'bytes', 'Content-Length': '3' },
    }))
    const origin = await serve({ fetchImpl })
    const result = await fetch(`${origin}/proxy?url=https://cdn.example/segment.mp4`, { headers: { Range: 'bytes=0-2' } })
    expect(result.status).toBe(206)
    expect(result.headers.get('content-range')).toBe('bytes 0-2/100')
    expect([...new Uint8Array(await result.arrayBuffer())]).toEqual([1, 2, 3])
    expect(fetchImpl.mock.calls[0][1].headers.Range).toBe('bytes=0-2')
  })
  it('rejects non-HTTP targets and HTML disguised as a successful manifest', async () => {
    const origin = await serve({ fetchImpl: async () => new Response('<html>Access denied</html>') })
    expect((await fetch(`${origin}/proxy?url=file:///etc/passwd`)).status).toBe(400)
    expect((await fetch(`${origin}/proxy?url=https://cdn.example/blocked.m3u8`)).status).toBe(502)
  })
})

describe('HEVC compatibility', () => {
  it('selects the actual 720p Spanish rendition without downloading or upscaling 4K/360p', () => {
    const manifest = '#EXTM3U\n#EXT-X-MEDIA:TYPE=AUDIO,DEFAULT=YES,URI="spanish.m3u8"\n#EXT-X-STREAM-INF:RESOLUTION=640x360\nchannel-audio_spa=128000-video=405000.m3u8\n#EXT-X-STREAM-INF:RESOLUTION=3840x2160\nchannel-audio_spa=128000-video=12000000.m3u8\n#EXT-X-STREAM-INF:RESOLUTION=1280x720\nchannel-audio_spa=128000-video=1440000.m3u8'
    expect(selectCompatibleFeed(manifest, 'https://cdn.example/live/master.m3u8')).toEqual({ video: 'https://cdn.example/live/channel-audio_spa=128000-video=1440000.m3u8', audio: 'https://cdn.example/live/spanish.m3u8' })
  })
  it('limits concurrent conversions and stops the child when a viewer disconnects', async () => {
    const output = new PassThrough()
    const child = Object.assign(new EventEmitter(), { stdout: output, exitCode: null as number | null, kill: vi.fn() })
    child.kill.mockImplementation(() => {
      child.exitCode = 0
      output.end()
      queueMicrotask(() => child.emit('close', 0))
      return true
    })
    const spawnImpl = vi.fn(() => { setImmediate(() => output.write('ftyp-test-mp4')); return child })
    const fetchImpl = vi.fn(async (url: string) => url.startsWith('https://api.atresplayer.com') ? Response.json({ sourcesLive: [
      { type: 'application/hls+4K', src: 'https://atres-live.atresmedia.com/official/master.m3u8' },
    ] }) : new Response('#EXTM3U\n#EXT-X-STREAM-INF:RESOLUTION=1280x720\nchannel-audio_spa=128000-video=1440000.m3u8'))
    const compatible = createCompatibleStreamer({ fetchImpl, spawnImpl, available: true, maxStreams: 1 })
    const origin = await serve({ compatible })
    const response = await fetch(`${origin}/compatible?ch=lasexta`)
    expect(response.headers.get('content-type')).toContain('video/mp4')
    const reader = response.body!.getReader()
    expect((await reader.read()).value!.length).toBeGreaterThan(0)
    expect((await fetch(`${origin}/compatible?ch=antena3`)).status).toBe(503)
    await reader.cancel()
    await vi.waitFor(() => expect(child.kill).toHaveBeenCalledWith('SIGTERM'))
    expect(spawnImpl).toHaveBeenCalledOnce()
  })
  it('fails promptly when the optional converter is unavailable', async () => {
    const compatible = createCompatibleStreamer({ available: false })
    const origin = await serve({ compatible })
    expect((await fetch(`${origin}/compatible?ch=lasexta`)).status).toBe(503)
    expect((await fetch(`${origin}/compatible?ch=unknown`)).status).toBe(404)
  })
})
