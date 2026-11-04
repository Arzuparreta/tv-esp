import { useEffect, useRef } from 'react'
import type { Channel } from '../data/types'
import { ChannelLogo } from './ChannelLogo'
import { Icon } from './Icon'

interface Props {
  channels: Channel[]
  currentId: string
  onSelect: (channel: Channel) => void
}

export function ChannelSidebar({ channels, currentId, onSelect }: Props) {
  const currentRef = useRef<HTMLButtonElement>(null)
  useEffect(() => { currentRef.current?.scrollIntoView({ block: 'nearest' }) }, [currentId])
  return <nav className="player-channel-list" id="player-channels" aria-label="Cambiar de canal">
    <h3>Canales</h3>
    {channels.map(channel => <button key={channel.id} ref={channel.id === currentId ? currentRef : undefined}
      onClick={() => onSelect(channel)} aria-current={channel.id === currentId ? 'true' : undefined}>
      <span className="list-logo"><ChannelLogo channel={channel} /></span>
      <span>{channel.name}</span>
      {channel.id === currentId && <Icon name="play" filled />}
    </button>)}
  </nav>
}
