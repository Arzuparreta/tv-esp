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
    <div className="relative w-full h-full bg-black">
      <iframe
        src={embedUrl}
        title={title}
        className="w-full h-full border-0"
        allowFullScreen
        allow="autoplay; encrypted-media; picture-in-picture; accelerometer; gyroscope"
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoading(false)}
        onError={() => { setIsLoading(false); onError() }}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
