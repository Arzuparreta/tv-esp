import { useState } from 'react'

interface Props {
  url: string
  title: string
  onError: () => void
}

export function IframePlayer({ url, title, onError }: Props) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className="video-surface" aria-busy={isLoading}>
      <iframe
        src={url}
        title={title}
        className="embedded-player"
        allowFullScreen
        allow="autoplay; encrypted-media; picture-in-picture"
        referrerPolicy="no-referrer"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
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
