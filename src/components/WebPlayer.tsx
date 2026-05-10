import { useEffect, useState } from 'react'

interface Props {
  url: string
  channelName: string
  channelLogo: string
}

export function WebPlayer({ url, channelName, channelLogo }: Props) {
  const [opened, setOpened] = useState(false)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    setOpened(false)
  }, [url])

  const handleOpen = () => {
    window.open(url, '_blank', 'noopener,noreferrer')
    setOpened(true)
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6 bg-black/95 px-8">
      {/* Channel logo */}
      <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center p-3">
        {imgError ? (
          <span className="text-3xl font-bold text-white/20">{channelName.charAt(0)}</span>
        ) : (
          <img
            src={channelLogo}
            alt={channelName}
            className="max-w-full max-h-full object-contain"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
          />
        )}
      </div>

      <div className="text-center space-y-2 max-w-sm">
        <h2 className="text-xl font-semibold text-white">{channelName}</h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          Este canal no permite reproduccion integrada.
          {' '}Se abrira en su reproductor oficial.
        </p>
      </div>

      <button
        onClick={handleOpen}
        className="flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-accent text-white
          font-semibold text-sm hover:bg-accent/80 active:scale-95
          transition-all duration-200 cursor-pointer shadow-lg shadow-accent/25"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polygon points="5,3 19,12 5,21" fill="currentColor" stroke="none" />
        </svg>
        {opened ? 'Abrir de nuevo' : 'Ver en directo'}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
          <path d="M15 3h6v6M10 14L21 3" />
        </svg>
      </button>

      {opened && (
        <p className="text-xs text-text-muted animate-fade-in">
          Se ha abierto en una nueva pestana
        </p>
      )}
    </div>
  )
}
