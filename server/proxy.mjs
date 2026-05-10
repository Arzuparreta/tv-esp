import express from 'express'
import { URL } from 'node:url'

const app = express()
const PORT = 3555

// ── CORS on every response ──────────────────────────────────────────
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', '*')
  if (_req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

// ── Health check ────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ ok: true }))

// ── Atresplayer API ─────────────────────────────────────────────────
// Maps channel slug -> Atresplayer channel ID
const ATRES_CHANNELS = {
  antena3:    '5a6a165a7ed1a834493ebf6a',
  lasexta:    '5a6a172c7ed1a834493ebf6b',
  neox:       '5a6a17da7ed1a834493ebf6d',
  nova:       '5a6a180b7ed1a834493ebf6e',
  mega:       '5a6a18357ed1a834493ebf6f',
  atreseries: '5a6a189a7ed1a834493ebf70',
}

// Returns a fresh tokenized HLS URL for an Atresmedia channel
// GET /atresplayer?ch=antena3 -> redirects to proxied m3u8
app.get('/atresplayer', async (req, res) => {
  const slug = req.query.ch
  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'Missing ?ch= parameter', available: Object.keys(ATRES_CHANNELS) })
  }
  const channelId = ATRES_CHANNELS[slug]
  if (!channelId) {
    return res.status(404).json({ error: 'Unknown channel', available: Object.keys(ATRES_CHANNELS) })
  }

  try {
    const apiUrl = `https://api.atresplayer.com/player/v1/live/${channelId}?NODRM=true`
    const apiRes = await fetch(apiUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(10000),
    })
    const data = await apiRes.json()

    if (data.error) {
      return res.status(403).json({ error: data.error, detail: data.error_description })
    }

    // Find the HLS source from sourcesLive
    const hlsSource = data.sourcesLive?.find(s => s.type === 'application/vnd.apple.mpegurl')
    if (!hlsSource?.src) {
      return res.status(404).json({ error: 'No HLS source found' })
    }

    // Proxy the tokenized m3u8 through our own proxy
    const proxyBase = `${req.protocol}://${req.get('host')}/proxy`
    const proxiedUrl = `${proxyBase}?url=${encodeURIComponent(hlsSource.src)}`
    return res.redirect(302, proxiedUrl)

  } catch (err) {
    res.status(502).json({ error: 'Atresplayer API failed', detail: String(err) })
  }
})

// ── HLS proxy endpoint ─────────────────────────────────────────────
// Usage: /proxy?url=<encoded-m3u8-or-segment-url>
app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url
  if (!targetUrl || typeof targetUrl !== 'string') {
    return res.status(400).json({ error: 'Missing ?url= parameter' })
  }

  let parsed
  try {
    parsed = new URL(targetUrl)
  } catch {
    return res.status(400).json({ error: 'Invalid URL' })
  }

  const proxyBase = `${req.protocol}://${req.get('host')}/proxy`

  try {
    const upstream = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Referer': parsed.origin + '/',
        'Origin': parsed.origin,
      },
      signal: AbortSignal.timeout(15000),
    })

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: `Upstream returned ${upstream.status}`,
      })
    }

    const contentType = upstream.headers.get('content-type') || ''

    // If it's an m3u8 manifest, rewrite URLs inside it
    if (
      targetUrl.includes('.m3u8') ||
      contentType.includes('mpegurl') ||
      contentType.includes('m3u8')
    ) {
      const body = await upstream.text()
      const rewritten = rewriteManifest(body, targetUrl, proxyBase)
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl')
      return res.send(rewritten)
    }

    // Otherwise stream the binary response (video segments, keys, etc.)
    res.setHeader('Content-Type', contentType || 'application/octet-stream')
    const clen = upstream.headers.get('content-length')
    if (clen) res.setHeader('Content-Length', clen)

    const reader = upstream.body?.getReader()
    if (!reader) return res.status(502).end()

    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        res.write(value)
      }
      res.end()
    }
    pump().catch(() => res.end())

  } catch (err) {
    if (!res.headersSent) {
      res.status(502).json({ error: 'Proxy fetch failed', detail: String(err) })
    }
  }
})

// ── Rewrite m3u8 manifests ──────────────────────────────────────────
function rewriteManifest(body, manifestUrl, proxyBase) {
  const baseUrl = manifestUrl.substring(0, manifestUrl.lastIndexOf('/') + 1)

  return body
    .split('\n')
    .map(line => {
      const trimmed = line.trim()

      // Skip empty lines and comments (but process URI= inside comments like EXT-X-KEY)
      if (trimmed === '') return line
      if (trimmed.startsWith('#')) {
        // Rewrite URI="..." in tags like #EXT-X-KEY or #EXT-X-MAP
        return line.replace(/URI="([^"]+)"/g, (_match, uri) => {
          const absolute = resolveUrl(uri, baseUrl)
          return `URI="${proxyBase}?url=${encodeURIComponent(absolute)}"`
        })
      }

      // Regular URL line (segment or variant playlist)
      const absolute = resolveUrl(trimmed, baseUrl)
      return `${proxyBase}?url=${encodeURIComponent(absolute)}`
    })
    .join('\n')
}

function resolveUrl(url, base) {
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/')) {
    const parsed = new URL(base)
    return `${parsed.protocol}//${parsed.host}${url}`
  }
  return base + url
}

// ── Start ───────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`HLS proxy running on http://0.0.0.0:${PORT}`)
  console.log(`Test: http://localhost:${PORT}/health`)
})
