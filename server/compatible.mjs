import { spawn, spawnSync } from 'node:child_process'
import { pipeline } from 'node:stream/promises'
import { getAtresSources } from './sources.mjs'

export function selectCompatibleFeed(manifest, manifestUrl) {
  const variants = []
  const audioTracks = []
  let height = 0
  for (const line of manifest.split('\n').map(line => line.trim())) {
    if (line.startsWith('#EXT-X-MEDIA:') && line.includes('TYPE=AUDIO')) {
      const uri = line.match(/URI="([^"]+)"/)?.[1]
      if (uri && line.includes('DEFAULT=YES')) audioTracks.push(new URL(uri, manifestUrl).href)
    } else if (line.startsWith('#EXT-X-STREAM-INF:')) height = Number(line.match(/RESOLUTION=\d+x(\d+)/)?.[1] || 0)
    else if (line && !line.startsWith('#')) {
      // Select the actual 720p rendition. Its audio is in a separate playlist,
      // even though the variant filename also contains "audio_spa".
      if (height > 0 && height <= 720 && /audio_spa=[^/]+-video=/.test(line)) variants.push({ height, url: new URL(line, manifestUrl).href })
      height = 0
    }
  }
  const video = variants.sort((a, b) => b.height - a.height)[0]?.url
  return video ? { video, audio: audioTracks[0] } : { video: manifestUrl }
}

// Some official feeds are HEVC-only. Convert their codec for browsers without
// HEVC support; this never decrypts a stream or changes its authorization.
export function createCompatibleStreamer({ fetchImpl = fetch, ffmpegPath = process.env.TV_ESP_FFMPEG || 'ffmpeg', maxStreams = 2, spawnImpl = spawn,
  available = ffmpegPath !== '0' && spawnSync(ffmpegPath, ['-version'], { stdio: 'ignore', timeout: 2000 }).status === 0,
} = {}) {
  let active = 0
  return {
    available,
    async stream(slug, req, res) {
      if (!available) return res.status(503).json({ error: 'Compatible playback requires ffmpeg' })
      if (active >= maxStreams) return res.status(503).json({ error: 'Compatible players busy' })
      active++
      let child
      let startupTimer
      let killTimer
      let timedOut = false
      const stop = () => {
        clearTimeout(startupTimer)
        if (child && child.exitCode === null) {
          child.kill('SIGTERM')
          killTimer = setTimeout(() => child.kill('SIGKILL'), 2000)
          killTimer.unref()
        }
      }
      res.once('close', stop)
      try {
        const sources = await getAtresSources(slug, fetchImpl)
        const source = sources.find(source => source.videoCodec === 'hevc')
        if (!source || !new URL(source.url).hostname.endsWith('.atresmedia.com')) return res.status(404).json({ error: 'No compatible official feed' })
        const master = await fetchImpl(source.url, { signal: AbortSignal.timeout(4000) })
        if (!master.ok) return res.status(502).json({ error: 'Official feed unavailable' })
        const manifest = await master.text()
        if (!manifest.trimStart().startsWith('#EXTM3U')) return res.status(502).json({ error: 'Invalid official feed' })
        const input = selectCompatibleFeed(manifest, master.url || source.url)
        if (req.destroyed || res.destroyed) return
        child = spawnImpl(ffmpegPath, [
          '-hide_banner', '-loglevel', 'error', '-nostdin', '-rw_timeout', '10000000',
          '-threads', '2', '-filter_threads', '1', '-i', input.video,
          ...(input.audio ? ['-threads', '2', '-rw_timeout', '10000000', '-isync', '0', '-i', input.audio] : []),
          '-map', '0:v:0', '-map', input.audio ? '1:a:0' : '0:a:0?',
          '-c:v', 'libx264', '-preset', 'veryfast', '-tune', 'zerolatency', '-threads', '2',
          '-vf', 'scale=w=1280:h=720:force_original_aspect_ratio=decrease:force_divisible_by=2',
          '-pix_fmt', 'yuv420p', '-r', '25', '-g', '50', '-c:a', 'aac', '-b:a', '128k',
          '-movflags', 'frag_keyframe+empty_moov+default_base_moof', '-f', 'mp4', 'pipe:1',
        ], { stdio: ['ignore', 'pipe', 'ignore'] })
        const completion = new Promise((resolve, reject) => {
          child.once('error', reject)
          child.once('close', code => {
            clearTimeout(killTimer)
            if (code !== 0 && !res.destroyed) console.warn(`[compatible] ${slug}: converter exited (${code ?? 'signal'})`)
            code === 0 ? resolve() : reject(new Error('Conversion stopped'))
          })
        })
        // Observe failures immediately, including failures before pipeline awaits.
        completion.catch(() => {})
        startupTimer = setTimeout(() => { timedOut = true; console.warn(`[compatible] ${slug}: startup timeout`); stop() }, 12000)
        child.stdout.once('data', () => clearTimeout(startupTimer))
        res.setHeader('Content-Type', 'video/mp4')
        res.setHeader('Cache-Control', 'no-store')
        await pipeline(child.stdout, res)
        await completion
      } catch {
        if (!res.destroyed && !timedOut) console.warn(`[compatible] ${slug}: playback failed before completion`)
        if (!res.headersSent && !res.destroyed) res.status(502).json({ error: 'Compatible playback failed' })
      } finally {
        active--
        stop()
        res.removeListener('close', stop)
      }
    },
  }
}
