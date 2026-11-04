import { useEffect, useEffectEvent, useRef, useCallback, useState } from 'react'
import Hls from 'hls.js'
import { watchPlayback } from '../lib/playbackWatchdog'

interface UseHlsOptions {
  url: string
  autoplay?: boolean
  direct?: boolean
  onError?: () => void
}

export function useHls({ url, autoplay = true, direct = false, onError }: UseHlsOptions) {
  const reportError = useEffectEvent(() => onError?.())
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [supported] = useState(() => direct || Hls.isSupported() || !!document.createElement('video').canPlayType('application/vnd.apple.mpegurl'))
  const [isLoading, setIsLoading] = useState(supported)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  // HlsPlayer is keyed by source URL, so each source starts with fresh loading state.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (!supported) { reportError(); return }

    let hls: Hls | undefined
    let networkRecoveries = 0
    let mediaRecoveries = 0
    let disposed = false
    let failed = false
    const fail = () => {
      if (disposed || failed) return
      failed = true
      watchdog.dispose()
      hls?.stopLoad()
      setError('No se ha podido conectar con el canal')
      setIsLoading(false)
      reportError()
    }
    const watchdog = watchPlayback(video, {
      onTimeout: fail,
      onReady: () => { if (!disposed && !failed) setIsLoading(false) },
      onLoading: () => { if (!disposed && !failed) setIsLoading(true) },
    })
    const play = () => {
      if (autoplay) video.play().catch((error: DOMException) => {
        if (disposed || failed) return
        if (error.name === 'NotAllowedError') watchdog.autoplayBlocked()
        else if (error.name !== 'AbortError') fail()
      })
      else watchdog.autoplayBlocked()
    }

    if (direct || video.canPlayType('application/vnd.apple.mpegurl')) {
      video.addEventListener('error', fail)
      video.src = url
      play()
    } else {
      hls = new Hls({ enableWorker: true, maxBufferLength: 30, maxMaxBufferLength: 60, startLevel: -1 })
      hls.loadSource(url)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, play)
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal || disposed) return
        const status = data.response?.code
        if (status && status >= 400 && status < 500) { fail(); return }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR && networkRecoveries++ === 0) {
          hls?.startLoad()
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR && mediaRecoveries++ === 0) {
          hls?.recoverMediaError()
        } else fail()
      })
    }

    return () => {
      disposed = true
      watchdog.dispose()
      video.removeEventListener('error', fail)
      hls?.destroy()
      video.pause()
      video.removeAttribute('src')
      video.load()
    }
  }, [url, autoplay, direct, supported, attempt])

  const retry = useCallback(() => {
    setError(null)
    setIsLoading(supported)
    setAttempt(value => value + 1)
  }, [supported])

  return { videoRef, isLoading, error: supported ? error : 'Tu navegador no soporta HLS', retry }
}
