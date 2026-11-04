import { beforeAll, describe, it, expect } from 'vitest'

const PROXY = process.env.TV_ESP_PROXY || 'http://localhost:3555'

// External broadcasters change independently of commits. Enable these checks
// explicitly; deterministic resolver/proxy regressions run in test:unit and CI.
describe.skipIf(process.env.TV_ESP_LIVE_TESTS !== '1')('live broadcasters through the local proxy', () => {
  beforeAll(async () => {
    const response = await fetch(`${PROXY}/health`, { signal: AbortSignal.timeout(2000) })
    expect(response.ok, 'Start the proxy before running live checks').toBe(true)
  })

  it('proxies RTVE La 1 and rewrites its child playlists', async () => {
    const url = encodeURIComponent('https://rtvelivestream.rtve.es/rtvesec/la1/la1_main_dvr.m3u8')
    const response = await fetch(`${PROXY}/proxy?url=${url}`)
    expect(response.status).toBe(200)
    expect(await response.text()).toContain(`${PROXY}/proxy?url=`)
  }, 20000)

  it.each(['antena3', 'lasexta', 'neox', 'nova', 'mega', 'atreseries'])('%s resolves all official HLS alternatives and its SSAI master', async slug => {
    const resolution = await fetch(`${PROXY}/sources?ch=${slug}`)
    expect(resolution.status).toBe(200)
    const { sources } = await resolution.json()
    const hls = sources.filter((source: { type: string }) => source.type === 'hls')
    expect(hls.length).toBeGreaterThan(1)
    expect(hls[0].label).toBe('Atresplayer')
    const response = await fetch(`${PROXY}/proxy?url=${encodeURIComponent(hls[0].url)}`, { signal: AbortSignal.timeout(15000) })
    expect(response.status).toBe(200)
    expect(await response.text()).toContain('#EXTM3U')
  }, 25000)

  it.each(['antena3', 'lasexta'])('%s serves a real compatible MP4 stream', async slug => {
    const controller = new AbortController()
    try {
      const response = await fetch(`${PROXY}/compatible?ch=${slug}`, { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(25000)]) })
      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toContain('video/mp4')
      const reader = response.body!.getReader()
      const firstChunk = await reader.read()
      expect(Buffer.from(firstChunk.value!).toString('ascii')).toContain('ftyp')
      await reader.cancel()
    } finally { controller.abort() }
  }, 30000)

  it('rejects unknown channels and missing proxy URLs', async () => {
    expect((await fetch(`${PROXY}/atresplayer?ch=nonexistent`)).status).toBe(404)
    expect((await fetch(`${PROXY}/proxy`)).status).toBe(400)
  })
})
