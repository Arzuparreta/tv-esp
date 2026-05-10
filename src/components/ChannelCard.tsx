import { useState } from 'react'
import type { Channel } from '../data/types'

interface Props {
  channel: Channel
  isFavorite: boolean
  onPlay: (channel: Channel) => void
  onToggleFavorite: (id: string) => void
}

export function ChannelCard({ channel, isFavorite, onPlay, onToggleFavorite }: Props) {
  const [imgError, setImgError] = useState(false)

  return (
    <div
      className="glass glow-hover group relative rounded-2xl p-4 cursor-pointer
        transform transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
      onClick={() => onPlay(channel)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onPlay(channel)}
    >
      {/* Favorite button */}
      <button
        onClick={e => { e.stopPropagation(); onToggleFavorite(channel.id) }}
        className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100
          transition-opacity duration-200 p-1.5 rounded-full hover:bg-white/10"
        aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill={isFavorite ? '#f59e0b' : 'none'}
          stroke={isFavorite ? '#f59e0b' : 'rgba(255,255,255,0.4)'} strokeWidth="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </button>

      {/* Channel logo */}
      <div className="flex items-center justify-center h-20 mb-3">
        {imgError ? (
          <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center text-2xl font-bold text-white/30">
            {channel.name.charAt(0)}
          </div>
        ) : (
          <img
            src={channel.logo}
            alt={channel.name}
            className="max-h-16 max-w-[80%] object-contain rounded-lg
              transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
          />
        )}
      </div>

      {/* Channel name */}
      <p className="text-center text-sm font-medium text-text-primary truncate">
        {channel.name}
      </p>

      {/* Source type indicator */}
      <div className="flex justify-center mt-2 gap-1">
        {(() => {
          const t = channel.sources[0]?.type
          if (t === 'hls' || t === 'atres') return (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 font-medium">HD</span>
          )
          if (t === 'youtube') return (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 font-medium">YT</span>
          )
          if (t === 'web' || t === 'iframe') return (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-medium">WEB</span>
          )
          return null
        })()}
      </div>
    </div>
  )
}
