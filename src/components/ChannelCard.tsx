import type { Channel } from '../data/types'
import { ChannelLogo } from './ChannelLogo'
import { Icon } from './Icon'

interface Props {
  channel: Channel
  isFavorite: boolean
  onPlay: (channel: Channel, trigger: HTMLButtonElement) => void
  onToggleFavorite: (id: string) => void
}

export function ChannelCard({ channel, isFavorite, onPlay, onToggleFavorite }: Props) {
  const external = channel.sources.every(source => source.type === 'web')
  return <article className="channel-card">
    <button className="channel-play" onClick={event => onPlay(channel, event.currentTarget)} aria-label={`Ver ${channel.name} en directo`}>
      <span className="channel-artwork"><ChannelLogo channel={channel} /><span className="play-indicator"><Icon name="play" filled /></span></span>
      <span className="channel-name">{channel.name}</span>
      {external && <span className="channel-caption">En su web oficial <Icon name="external" /></span>}
    </button>
    <button className={`icon-button favorite-button ${isFavorite ? 'is-favorite' : ''}`} onClick={() => onToggleFavorite(channel.id)}
      aria-label={`${isFavorite ? 'Quitar' : 'Añadir'} ${channel.name} ${isFavorite ? 'de' : 'a'} favoritos`} aria-pressed={isFavorite}>
      <Icon name="heart" filled={isFavorite} />
    </button>
  </article>
}
