import { describe, it, expect } from 'vitest'

const PROXY = 'http://localhost:3555'

async function proxyIsRunning(): Promise<boolean> {
  try {
    const res = await fetch(`${PROXY}/health`, { signal: AbortSignal.timeout(2000) })
    return res.ok
  } catch {
    return false
  }
}

describe('HLS Proxy (requires running proxy on :3555)', () => {
  it('health check responds', async () => {
    if (!(await proxyIsRunning())) return // skip if proxy not running

    const res = await fetch(`${PROXY}/health`)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.ok).toBe(true)
  })

  it('proxies RTVE La 1 m3u8', async () => {
    if (!(await proxyIsRunning())) return

    const url = encodeURIComponent('https://ztnr.rtve.es/ztnr/1688877.m3u8')
    const res = await fetch(`${PROXY}/proxy?url=${url}`)
    expect(res.status).toBe(200)
    const body = await res.text()
    expect(body).toContain('#EXTM3U')
    // Verify URL rewriting: segment URLs should point back through the proxy
    expect(body).toContain(`${PROXY}/proxy?url=`)
  })

  it('Atresplayer API returns valid m3u8 for Antena 3', async () => {
    if (!(await proxyIsRunning())) return

    const res = await fetch(`${PROXY}/atresplayer?ch=antena3`, { redirect: 'follow' })
    expect(res.status).toBe(200)
    const body = await res.text()
    expect(body).toContain('#EXTM3U')
    expect(body).toContain('antena3')
  })

  it('Atresplayer API returns valid m3u8 for La Sexta', async () => {
    if (!(await proxyIsRunning())) return

    const res = await fetch(`${PROXY}/atresplayer?ch=lasexta`, { redirect: 'follow' })
    expect(res.status).toBe(200)
    const body = await res.text()
    expect(body).toContain('#EXTM3U')
    expect(body).toContain('lasexta')
  })

  it('Atresplayer API returns 404 for unknown channel', async () => {
    if (!(await proxyIsRunning())) return

    const res = await fetch(`${PROXY}/atresplayer?ch=nonexistent`, { redirect: 'follow' })
    expect(res.status).toBe(404)
  })

  it('proxy returns 400 without url parameter', async () => {
    if (!(await proxyIsRunning())) return

    const res = await fetch(`${PROXY}/proxy`)
    expect(res.status).toBe(400)
  })

  it('all 6 Atresmedia channels resolve', async () => {
    if (!(await proxyIsRunning())) return

    const slugs = ['antena3', 'lasexta', 'neox', 'nova', 'mega', 'atreseries']
    for (const slug of slugs) {
      const res = await fetch(`${PROXY}/atresplayer?ch=${slug}`, { redirect: 'follow' })
      expect(res.status, `${slug} failed with ${res.status}`).toBe(200)
      const body = await res.text()
      expect(body, `${slug} did not return m3u8`).toContain('#EXTM3U')
    }
  })
})
