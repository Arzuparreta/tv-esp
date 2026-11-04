import { useState } from 'react'
import type { Channel } from '../data/types'

export function ChannelLogo({ channel }: { channel: Channel }) {
  const [failed, setFailed] = useState(false)
  return failed ? <span className="logo-fallback" aria-hidden="true">{channel.name}</span>
    : <img src={channel.logo} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
}
