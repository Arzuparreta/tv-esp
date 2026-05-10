import { useState } from 'react'
import type { Channel } from '../data/types'

interface Props {
  channels: Channel[]
  currentId: string
  onSelect: (channel: Channel) => void
  onClose: () => void
}

export function ChannelSidebar({ channels, currentId, onSelect, onClose }: Props) {
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set())

  return (
    <div className="absolute top-0 right-0 bottom-0 z-30 w-72
      animate-slide-in-right glass-static bg-black/70 backdrop-blur-2xl
      border-l border-white/10 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <span className="text-sm font-semibold text-white">Canales</span>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Channel list */}
      <div className="flex-1 overflow-y-auto">
        {channels.map(ch => (
          <button
            key={ch.id}
            onClick={() => onSelect(ch)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left
              transition-colors cursor-pointer
              ${ch.id === currentId
                ? 'bg-accent/20 border-l-2 border-accent'
                : 'hover:bg-white/5 border-l-2 border-transparent'
              }`}
          >
            <div className="w-8 h-8 shrink-0 flex items-center justify-center">
              {imgErrors.has(ch.id) ? (
                <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-xs font-bold text-white/40">
                  {ch.name.charAt(0)}
                </div>
              ) : (
                <img
                  src={ch.logo}
                  alt=""
                  className="max-w-8 max-h-8 object-contain rounded"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={() => setImgErrors(prev => new Set(prev).add(ch.id))}
                />
              )}
            </div>
            <span className={`text-sm truncate ${ch.id === currentId ? 'text-white font-medium' : 'text-text-secondary'}`}>
              {ch.name}
            </span>
            {ch.id === currentId && (
              <span className="ml-auto w-2 h-2 rounded-full bg-accent shrink-0 animate-pulse" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
