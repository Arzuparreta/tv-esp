interface Props {
  channelName: string
  channelLogo: string
  isFullscreen: boolean
  showSidebar: boolean
  onBack: () => void
  onFullscreen: () => void
  onToggleSidebar: () => void
  onOpenWeb?: () => void
  webUrl?: string
}

export function PlayerControls({
  channelName,
  channelLogo,
  isFullscreen,
  showSidebar,
  onBack,
  onFullscreen,
  onToggleSidebar,
  onOpenWeb,
  webUrl,
}: Props) {
  return (
    <>
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4
        bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-3 flex-1 min-w-0">
            <img
              src={channelLogo}
              alt=""
              className="w-8 h-8 rounded-lg object-contain"
              referrerPolicy="no-referrer"
              onError={e => (e.currentTarget.style.display = 'none')}
            />
            <span className="text-white font-semibold text-lg truncate">{channelName}</span>
          </div>

          <div className="flex items-center gap-2">
            {webUrl && onOpenWeb && (
              <button
                onClick={onOpenWeb}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                title="Abrir web oficial"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="white" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                  <path d="M15 3h6v6M10 14L21 3" />
                </svg>
              </button>
            )}

            <button
              onClick={onToggleSidebar}
              className={`p-2 rounded-xl transition-colors cursor-pointer
                ${showSidebar ? 'bg-white/20' : 'hover:bg-white/10'}`}
              title="Lista de canales"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </button>

            <button
              onClick={onFullscreen}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              {isFullscreen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="white" strokeWidth="2" strokeLinecap="round">
                  <path d="M8 3v3a2 2 0 01-2 2H3M21 8h-3a2 2 0 01-2-2V3M3 16h3a2 2 0 012 2v3M16 21v-3a2 2 0 012-2h3" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="white" strokeWidth="2" strokeLinecap="round">
                  <path d="M8 3H5a2 2 0 00-2 2v3M21 8V5a2 2 0 00-2-2h-3M3 16v3a2 2 0 002 2h3M16 21h3a2 2 0 002-2v-3" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom gradient (just visual, no controls here for clean look) */}
      <div className="absolute bottom-0 left-0 right-0 h-20 z-10
        bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
    </>
  )
}
