import { useEffect, useRef, useCallback, useState } from 'react'
import Hls from 'hls.js'

interface UseHlsOptions {
  url: string
  autoplay?: boolean
  onError?: () => void
}

export function useHls({ url, autoplay = true, onError }: UseHlsOptions) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [supported] = useState(() => Hls.isSupported() || !!document.createElement('video').canPlayType('application/vnd.apple.mpegurl'))
  const [isLoading, setIsLoading] = useState(supported)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  // HlsPlayer is keyed by source URL, so each source starts with fresh loading state.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (!supported) { onError?.(); return }

    let hls: Hls | undefined
    let recoveryTimer: ReturnType<typeof setTimeout> | undefined
    let networkRecoveries = 0
    let mediaRecoveries = 0
    let disposed = false
    let failed = false
    const fail = () => {
      if (disposed || failed) return
      failed = true
      clearTimeout(recoveryTimer)
      setError('No se ha podido conectar con el canal')
      setIsLoading(false)
      onError?.()
    }
    const loaded = () => { if (!disposed) setIsLoading(false) }
    const waiting = () => { if (!disposed) setIsLoading(true) }
    const play = () => { if (autoplay) video.play().catch(() => { /* Native controls allow playback when autoplay is blocked. */ }) }
    video.addEventListener('loadeddata', loaded)
    video.addEventListener('playing', loaded)
    video.addEventListener('waiting', waiting)

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.addEventListener('error', fail)
      video.src = url
      play()
    } else {
      hls = new Hls({ enableWorker: true, maxBufferLength: 30, maxMaxBufferLength: 60, startLevel: -1 })
      hls.loadSource(url)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => { loaded(); play() })
      hls.on(Hls.Events.FRAG_LOADED, () => { clearTimeout(recoveryTimer); loaded() })
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal || disposed) return
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR && networkRecoveries++ === 0) {
          hls?.startLoad()
          recoveryTimer = setTimeout(fail, 5000)
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR && mediaRecoveries++ === 0) {
          hls?.recoverMediaError()
        } else fail()
      })
    }

    return () => {
      disposed = true
      clearTimeout(recoveryTimer)
      video.removeEventListener('loadeddata', loaded)
      video.removeEventListener('playing', loaded)
      video.removeEventListener('waiting', waiting)
      video.removeEventListener('error', fail)
      hls?.destroy()
      video.pause()
      video.removeAttribute('src')
      video.load()
    }
  }, [url, autoplay, onError, supported, attempt])

  const retry = useCallback(() => {
    setError(null)
    setIsLoading(supported)
    setAttempt(value => value + 1)
  }, [supported])

  return { videoRef, isLoading, error: supported ? error : 'Tu navegador no soporta HLS', retry }
}
