import { useState, useMemo, useCallback } from 'react'
import type { Channel, Category } from './data/types'
import { channels } from './data/channels'
import { useFavorites } from './hooks/useFavorites'
import { CategoryTabs } from './components/CategoryTabs'
import { ChannelGrid } from './components/ChannelGrid'
import { SearchBar } from './components/SearchBar'
import { VideoPlayer } from './components/VideoPlayer'

type Filter = Category | 'favoritos' | 'todos'

export default function App() {
  const [activeFilter, setActiveFilter] = useState<Filter>('todos')
  const [search, setSearch] = useState('')
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null)
  const { favorites, toggle, isFavorite } = useFavorites()

  const filteredChannels = useMemo(() => {
    let list = channels

    if (activeFilter === 'favoritos') {
      list = list.filter(c => favorites.has(c.id))
    } else if (activeFilter !== 'todos') {
      list = list.filter(c => c.category === activeFilter)
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim()
      list = list.filter(c => c.name.toLowerCase().includes(q))
    }

    return list
  }, [activeFilter, search, favorites])

  const handlePlay = useCallback((channel: Channel) => {
    setActiveChannel(channel)
  }, [])

  const handleClose = useCallback(() => {
    setActiveChannel(null)
  }, [])

  const handleChannelChange = useCallback((channel: Channel) => {
    setActiveChannel(channel)
  }, [])

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Ambient gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden>
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-600/[0.07] blur-[120px]" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-purple-600/[0.05] blur-[100px]" />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full bg-blue-600/[0.04] blur-[100px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 glass-static border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M8 21h8M12 17v4" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                TV <span className="text-accent">Espana</span>
              </h1>
            </div>
            <div className="w-64 hidden sm:block">
              <SearchBar value={search} onChange={setSearch} />
            </div>
          </div>

          {/* Mobile search */}
          <div className="sm:hidden mb-3">
            <SearchBar value={search} onChange={setSearch} />
          </div>

          <CategoryTabs
            active={activeFilter}
            onSelect={setActiveFilter}
            hasFavorites={favorites.size > 0}
          />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        <ChannelGrid
          channels={filteredChannels}
          isFavorite={isFavorite}
          onPlay={handlePlay}
          onToggleFavorite={toggle}
        />
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-text-muted border-t border-white/5">
        Todos los canales son publicos y gratuitos. Fuentes oficiales via{' '}
        <a href="https://github.com/LaQuay/TDTChannels" target="_blank" rel="noopener noreferrer"
          className="text-accent/70 hover:text-accent transition-colors">
          TDTChannels
        </a>
      </footer>

      {/* Video Player Overlay */}
      {activeChannel && (
        <VideoPlayer
          channel={activeChannel}
          onClose={handleClose}
          onChannelChange={handleChannelChange}
        />
      )}
    </div>
  )
}
