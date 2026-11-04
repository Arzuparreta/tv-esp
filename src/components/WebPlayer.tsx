import { Icon } from './Icon'

interface Props {
  url: string
  channelName: string
  channelLogo: string
}

export function WebPlayer({ url, channelName, channelLogo }: Props) {
  return <div className="playback-message">
    <img className="web-channel-logo" src={channelLogo} alt="" />
    <h2>{channelName}</h2>
    <p>Este directo se ve en la web oficial del canal.</p>
    <a href={url} target="_blank" rel="noopener noreferrer" className="primary-button">
      Abrir directo <Icon name="external" />
    </a>
  </div>
}
