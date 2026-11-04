import { useState } from 'react'
import { getYouTubeEmbedUrl } from '../lib/player'

interface Props {
  url: string
  title: string
  onError: () => void
}

export function YouTubePlayer({ url, title, onError }: Props) {
  const [isLoading, setIsLoading] = useState(true)
  const embedUrl = getYouTubeEmbedUrl(url)

  return (
    <div className="video-surface" aria-busy={isLoading}>
      <iframe
        src={embedUrl}
        title={title}
        className="embedded-player"
        allowFullScreen
        allow="autoplay; encrypted-media; picture-in-picture; accelerometer; gyroscope"
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoading(false)}
        onError={() => { setIsLoading(false); onError() }}
      />
      {isLoading && (
        <div className="player-loading" role="status" aria-label="Cargando canal">
          <span className="spinner" />
        </div>
      )}
    </div>
  )
}
