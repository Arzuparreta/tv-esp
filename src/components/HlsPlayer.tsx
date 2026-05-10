import { useHls } from '../hooks/useHls'
import { proxyUrl, atresplayerUrl } from '../lib/proxy'

interface Props {
  url: string
  sourceType?: 'hls' | 'atres'
  onError: () => void
}

export function HlsPlayer({ url, sourceType = 'hls', onError }: Props) {
  const resolvedUrl = sourceType === 'atres'
    ? atresplayerUrl(url)
    : proxyUrl(url)

  const { videoRef, isLoading, error } = useHls({
    url: resolvedUrl,
    autoplay: true,
    onError,
  })

  return (
    <div className="relative w-full h-full bg-black">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        autoPlay
        controls={false}
      />
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
