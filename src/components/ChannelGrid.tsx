import type { Channel } from '../data/types'
import { ChannelCard } from './ChannelCard'

interface Props {
  channels: Channel[]
  isFavorite: (id: string) => boolean
  onPlay: (channel: Channel) => void
  onToggleFavorite: (id: string) => void
}

export function ChannelGrid({ channels, isFavorite, onPlay, onToggleFavorite }: Props) {
  if (channels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-text-muted">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.5" className="mb-4 opacity-50">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
        <p className="text-lg">No se encontraron canales</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {channels.map(ch => (
        <ChannelCard
          key={ch.id}
          channel={ch}
          isFavorite={isFavorite(ch.id)}
          onPlay={onPlay}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  )
}
