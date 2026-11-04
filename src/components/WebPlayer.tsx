import { Icon } from './Icon'

interface Props {
  url: string
  channelName: string
  channelLogo: string
  onRetry: () => void
  failed: boolean
}

export function WebPlayer({ url, channelName, channelLogo, onRetry, failed }: Props) {
  return <div className="playback-message">
    <img className="web-channel-logo" src={channelLogo} alt="" />
    <h2>{channelName}</h2>
    <p>{failed ? 'Las fuentes disponibles no han podido reproducirse. Puedes reintentarlo o abrir el directo oficial.' : 'Este directo se ve en la web oficial del canal. Puede requerir registro gratuito y estar limitado a España.'}</p>
    <div className="message-actions">
    <a href={url} target="_blank" rel="noopener noreferrer" className="primary-button">
      Abrir directo <Icon name="external" />
    </a>
    <button className="secondary-button" onClick={onRetry}>Reintentar fuentes</button>
    </div>
  </div>
}
