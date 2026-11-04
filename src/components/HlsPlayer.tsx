import { useHls } from '../hooks/useHls'
import { proxyUrl, atresplayerUrl } from '../lib/proxy'

interface Props {
  url: string
  sourceType?: 'hls' | 'atres'
  onError: () => void
}

export function HlsPlayer({ url, sourceType = 'hls', onError }: Props) {
  const resolvedUrl = sourceType === 'atres' ? atresplayerUrl(url) : proxyUrl(url)
  const { videoRef, isLoading, error } = useHls({ url: resolvedUrl, autoplay: true, onError })
  return <div className="video-surface">
    <video ref={videoRef} playsInline autoPlay controls aria-label="Reproductor de televisión en directo" />
    {isLoading && !error && <div className="player-loading" role="status" aria-label="Cargando canal"><span className="spinner" /></div>}
  </div>
}
