import { useEffect, useRef, useCallback, useState } from 'react'
import Hls from 'hls.js'

interface UseHlsOptions {
  url: string
  autoplay?: boolean
  onError?: () => void
}

interface UseHlsReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>
  isLoading: boolean
  error: string | null
  retry: () => void
}

export function useHls({ url, autoplay = true, onError }: UseHlsOptions): UseHlsReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const hlsRef = useRef<Hls | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const destroy = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }
  }, [])

  const attach = useCallback(() => {
    const video = videoRef.current
    if (!video || !url) return

    destroy()
    setIsLoading(true)
    setError(null)

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS
      video.src = url
      if (autoplay) video.play().catch(() => {})
      video.addEventListener('loadeddata', () => setIsLoading(false), { once: true })
      video.addEventListener('error', () => {
        setError('Error de reproducción')
        setIsLoading(false)
        onError?.()
      }, { once: true })
      return
    }

    if (!Hls.isSupported()) {
      setError('Tu navegador no soporta HLS')
      setIsLoading(false)
      return
    }

    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: false,
      maxBufferLength: 30,
      maxMaxBufferLength: 60,
      startLevel: -1,
      fragLoadingMaxRetry: 3,
      manifestLoadingMaxRetry: 3,
      levelLoadingMaxRetry: 3,
    })

    hlsRef.current = hls
    hls.loadSource(url)
    hls.attachMedia(video)

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      setIsLoading(false)
      if (autoplay) video.play().catch(() => {})
    })

    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            // Try to recover once, then give up
            hls.startLoad()
            setTimeout(() => {
              if (hlsRef.current === hls) {
                setError('Error de red')
                setIsLoading(false)
                onError?.()
              }
            }, 5000)
            break
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls.recoverMediaError()
            break
          default:
            setError('Error de reproducción')
            setIsLoading(false)
            onError?.()
            break
        }
      }
    })
  }, [url, autoplay, onError, destroy])

  useEffect(() => {
    attach()
    return destroy
  }, [attach, destroy])

  return { videoRef, isLoading, error, retry: attach }
}
