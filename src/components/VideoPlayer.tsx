import { useState, useCallback, useRef, useEffect, lazy, Suspense } from 'react'
import type { RefObject } from 'react'
import type { Channel } from '../data/types'
import { channels as allChannels } from '../data/channels'
import { getNextSource } from '../lib/player'
import { useKeyboard } from '../hooks/useKeyboard'
import { IframePlayer } from './IframePlayer'
import { YouTubePlayer } from './YouTubePlayer'
import { WebPlayer } from './WebPlayer'
import { PlayerControls } from './PlayerControls'
import { ChannelSidebar } from './ChannelSidebar'
import { Icon } from './Icon'

const HlsPlayer = lazy(() => import('./HlsPlayer').then(module => ({ default: module.HlsPlayer })))

interface Props {
  channel: Channel
  returnFocusRef: RefObject<HTMLButtonElement | null>
  onClose: () => void
  onChannelChange: (channel: Channel) => void
}

function ChannelPlayback({ channel }: { channel: Channel }) {
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set())
  const currentSource = getNextSource(channel, failedUrls)
  const handleSourceError = useCallback(() => {
    if (currentSource) setFailedUrls(previous => new Set(previous).add(currentSource.url))
  }, [currentSource])

  if (!currentSource) return <div className="playback-message" role="status">
    <Icon name="tv" />
    <h2>No se puede reproducir {channel.name}</h2>
    <p>Prueba de nuevo o abre el directo en su web oficial.</p>
    <div className="message-actions">
      <button className="primary-button" onClick={() => setFailedUrls(new Set())}>Reintentar</button>
      {channel.web && <a className="secondary-button" href={channel.web} target="_blank" rel="noopener noreferrer">Abrir web oficial <Icon name="external" /></a>}
    </div>
  </div>

  switch (currentSource.type) {
    case 'atres':
    case 'hls':
      return <Suspense fallback={<div className="player-loading" role="status" aria-label="Cargando canal"><span className="spinner" /></div>}>
        <HlsPlayer key={currentSource.url} url={currentSource.url} sourceType={currentSource.type} onError={handleSourceError} />
      </Suspense>
    case 'iframe':
      return <IframePlayer key={currentSource.url} url={currentSource.url} title={channel.name} onError={handleSourceError} />
    case 'youtube':
      return <YouTubePlayer key={currentSource.url} url={currentSource.url} title={channel.name} onError={handleSourceError} />
    case 'web':
      return <WebPlayer url={currentSource.url} channelName={channel.name} channelLogo={channel.logo} />
  }
}

export function VideoPlayer({ channel, returnFocusRef, onClose, onChannelChange }: Props) {
  const [showSidebar, setShowSidebar] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    const opener = returnFocusRef.current
    const scrollPosition = { left: window.scrollX, top: window.scrollY }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog?.showModal()
    return () => {
      dialog?.close()
      document.body.style.overflow = previousOverflow
      window.scrollTo(scrollPosition)
      opener?.focus({ preventScroll: true })
    }
  }, [returnFocusRef])

  const toggleFullscreen = useCallback(async () => {
    const frame = frameRef.current
    if (!frame) return
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => {})
    } else if (document.fullscreenEnabled && frame.requestFullscreen) {
      await frame.requestFullscreen().catch(() => {})
    } else {
      const video = frame.querySelector('video') as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null
      video?.webkitEnterFullscreen?.()
    }
  }, [])

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const navigateChannel = useCallback((direction: 1 | -1) => {
    const index = allChannels.findIndex(item => item.id === channel.id)
    onChannelChange(allChannels[(index + direction + allChannels.length) % allChannels.length])
  }, [channel.id, onChannelChange])

  useKeyboard({ f: toggleFullscreen, F: toggleFullscreen,
    m: () => setShowSidebar(value => !value), M: () => setShowSidebar(value => !value),
    ArrowRight: () => navigateChannel(1), ArrowLeft: () => navigateChannel(-1),
  })

  const fullscreenAvailable = document.fullscreenEnabled || (channel.sources.some(source => source.type === 'hls' || source.type === 'atres')
    && 'webkitEnterFullscreen' in HTMLVideoElement.prototype)

  return <dialog ref={dialogRef} className="player-dialog" aria-label={`Reproduciendo ${channel.name}`}
    onCancel={event => { event.preventDefault(); onClose() }}>
    <div className="player-frame" ref={frameRef}>
      <PlayerControls channelName={channel.name} fullscreenAvailable={fullscreenAvailable} isFullscreen={isFullscreen} showSidebar={showSidebar}
        onBack={onClose} onFullscreen={toggleFullscreen} onToggleSidebar={() => setShowSidebar(value => !value)} />
      <div className={`player-content ${showSidebar ? 'with-channel-list' : ''}`}>
        <div className="player-stage"><ChannelPlayback key={channel.id} channel={channel} /></div>
        {showSidebar && <ChannelSidebar channels={allChannels} currentId={channel.id} onSelect={onChannelChange} />}
      </div>
      <div className="player-bottom-bar">
        <span className="live-label"><span /> En directo</span>
        <div className="channel-stepper">
          <button className="icon-button" onClick={() => navigateChannel(-1)} aria-label="Canal anterior"><Icon name="back" /></button>
          <button className="icon-button" onClick={() => navigateChannel(1)} aria-label="Canal siguiente"><Icon name="chevron" /></button>
        </div>
      </div>
    </div>
  </dialog>
}
