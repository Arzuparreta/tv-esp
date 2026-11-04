import { Icon } from './Icon'

interface Props {
  channelName: string
  fullscreenAvailable: boolean
  isFullscreen: boolean
  showSidebar: boolean
  onBack: () => void
  onFullscreen: () => void
  onToggleSidebar: () => void
}

export function PlayerControls({ channelName, fullscreenAvailable, isFullscreen, showSidebar, onBack, onFullscreen, onToggleSidebar }: Props) {
  return <header className="player-toolbar">
    <button onClick={onBack} className="icon-button" aria-label="Volver a los canales" autoFocus><Icon name="close" /></button>
    <h2>{channelName}</h2>
    <button onClick={onToggleSidebar} className="icon-button" aria-label={showSidebar ? 'Ocultar lista de canales' : 'Mostrar lista de canales'}
      aria-expanded={showSidebar} aria-controls="player-channels"><Icon name="list" /></button>
    {fullscreenAvailable && <button onClick={onFullscreen} className="icon-button" aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}>
      <Icon name={isFullscreen ? 'minimize' : 'fullscreen'} />
    </button>}
  </header>
}
