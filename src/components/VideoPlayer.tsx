import { useState, useCallback, useRef, useEffect, lazy, Suspense } from 'react'
import type { Channel, Source } from '../data/types'
import { channels as allChannels } from '../data/channels'
import { getNextSource } from '../lib/player'
import { useKeyboard } from '../hooks/useKeyboard'
import { IframePlayer } from './IframePlayer'
import { YouTubePlayer } from './YouTubePlayer'
import { WebPlayer } from './WebPlayer'
import { PlayerControls } from './PlayerControls'
import { ChannelSidebar } from './ChannelSidebar'

const HlsPlayer = lazy(() => import('./HlsPlayer').then(m => ({ default: m.HlsPlayer })))

interface Props {
  channel: Channel
  onClose: () => void
  onChannelChange: (channel: Channel) => void
}

export function VideoPlayer({ channel, onClose, onChannelChange }: Props) {
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set())
  const [currentSource, setCurrentSource] = useState<Source | null>(null)
  const [showControls, setShowControls] = useState(true)
  const [showSidebar, setShowSidebar] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Resolve current source whenever channel or failures change
  useEffect(() => {
    const src = getNextSource(channel, failedUrls)
    setCurrentSource(src)
    if (!src) {
      setErrorMessage('No se pudo cargar ninguna fuente para este canal')
    } else {
      setErrorMessage(null)
    }
  }, [channel, failedUrls])

  // Reset failures when channel changes
  useEffect(() => {
    setFailedUrls(new Set())
  }, [channel.id])

  const handleSourceError = useCallback(() => {
    if (!currentSource) return
    setFailedUrls(prev => new Set(prev).add(currentSource.url))
  }, [currentSource])

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    setShowControls(true)
    clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => setShowControls(false), 4000)
  }, [])

  useEffect(() => {
    resetHideTimer()
    return () => clearTimeout(hideTimerRef.current)
  }, [resetHideTimer])

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!wrapperRef.current) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      wrapperRef.current.requestFullscreen()
    }
  }, [])

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  // Channel navigation
  const navigateChannel = useCallback((direction: 1 | -1) => {
    const idx = allChannels.findIndex(c => c.id === channel.id)
    if (idx === -1) return
    const next = (idx + direction + allChannels.length) % allChannels.length
    onChannelChange(allChannels[next])
  }, [channel.id, onChannelChange])

  // Keyboard shortcuts
  useKeyboard({
    Escape: () => showSidebar ? setShowSidebar(false) : onClose(),
    f: toggleFullscreen,
    F: toggleFullscreen,
    ArrowRight: () => navigateChannel(1),
    ArrowLeft: () => navigateChannel(-1),
    ArrowUp: () => navigateChannel(-1),
    ArrowDown: () => navigateChannel(1),
  })

  const renderPlayer = () => {
    if (errorMessage || !currentSource) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-black">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <p className="text-text-secondary text-center px-8">
            {errorMessage || 'Error al reproducir'}
          </p>
          {channel.web && (
            <a
              href={channel.web}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-medium
                hover:bg-accent/80 transition-colors"
            >
              Ver en web oficial
            </a>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-text-muted hover:text-white transition-colors cursor-pointer"
          >
            Volver a canales
          </button>
        </div>
      )
    }

    const fallback = (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )

    switch (currentSource.type) {
      case 'atres':
      case 'hls':
        return (
          <Suspense fallback={fallback}>
            <HlsPlayer url={currentSource.url} sourceType={currentSource.type === 'atres' ? 'atres' : 'hls'} onError={handleSourceError} />
          </Suspense>
        )
      case 'iframe':
        return <IframePlayer url={currentSource.url} title={channel.name} onError={handleSourceError} />
      case 'youtube':
        return <YouTubePlayer url={currentSource.url} title={channel.name} onError={handleSourceError} />
      case 'web':
        return <WebPlayer url={currentSource.url} channelName={channel.name} channelLogo={channel.logo} />
    }
  }

  return (
    <div
      ref={wrapperRef}
      className="fixed inset-0 z-50 bg-black animate-slide-up player-wrapper"
      onMouseMove={resetHideTimer}
      onClick={resetHideTimer}
    >
      {/* Player */}
      {renderPlayer()}

      {/* Controls overlay */}
      <div className={`player-controls ${showControls ? 'visible' : ''}`}>
        <PlayerControls
          channelName={channel.name}
          channelLogo={channel.logo}
          isFullscreen={isFullscreen}
          showSidebar={showSidebar}
          onBack={onClose}
          onFullscreen={toggleFullscreen}
          onToggleSidebar={() => setShowSidebar(s => !s)}
          onOpenWeb={channel.web ? () => window.open(channel.web, '_blank') : undefined}
          webUrl={channel.web}
        />
      </div>

      {/* Channel sidebar */}
      {showSidebar && (
        <ChannelSidebar
          channels={allChannels}
          currentId={channel.id}
          onSelect={(ch) => { onChannelChange(ch); setShowSidebar(false) }}
          onClose={() => setShowSidebar(false)}
        />
      )}
    </div>
  )
}
