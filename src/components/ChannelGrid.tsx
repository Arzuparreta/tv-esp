import type { Channel } from '../data/types'
import { ChannelCard } from './ChannelCard'

interface Props {
  channels: Channel[]
  isFavorite: (id: string) => boolean
  onPlay: (channel: Channel, trigger: HTMLButtonElement) => void
  onToggleFavorite: (id: string) => void
}

export function ChannelGrid({ channels, isFavorite, onPlay, onToggleFavorite }: Props) {
  return <div className="channel-grid">
    {channels.map(channel => <ChannelCard key={channel.id} channel={channel} isFavorite={isFavorite(channel.id)}
      onPlay={onPlay} onToggleFavorite={onToggleFavorite} />)}
  </div>
}
