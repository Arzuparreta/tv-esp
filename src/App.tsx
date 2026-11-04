import { useState, useMemo, useRef } from 'react'
import type { Channel, Category } from './data/types'
import { CATEGORY_LABELS, CATEGORY_ORDER } from './data/types'
import { channels } from './data/channels'
import { useFavorites } from './hooks/useFavorites'
import { CategoryTabs } from './components/CategoryTabs'
import { ChannelGrid } from './components/ChannelGrid'
import { SearchBar } from './components/SearchBar'
import { VideoPlayer } from './components/VideoPlayer'
import { Navigation } from './components/Navigation'
import { Icon } from './components/Icon'

type Filter = Category | 'favoritos' | 'todos'

export default function App() {
  const [activeFilter, setActiveFilter] = useState<Filter>('todos')
  const [search, setSearch] = useState('')
  const [searchMode, setSearchMode] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null)
  const playerOpener = useRef<HTMLButtonElement | null>(null)
  const play = (channel: Channel, trigger: HTMLButtonElement) => {
    playerOpener.current = trigger
    setActiveChannel(channel)
  }
  const { favorites, toggle, isFavorite } = useFavorites()

  const filteredChannels = useMemo(() => channels.filter(channel => {
    const matchesFilter = activeFilter === 'todos'
      || (activeFilter === 'favoritos' ? favorites.has(channel.id) : channel.category === activeFilter)
    return matchesFilter && channel.name.toLocaleLowerCase('es').includes(search.toLocaleLowerCase('es').trim())
  }), [activeFilter, search, favorites])

  const selectFilter = (filter: Filter) => {
    setActiveFilter(filter)
    setSearch('')
    setSearchMode(false)
    window.scrollTo({ top: 0 })
  }

  const openSearch = () => {
    setActiveFilter('todos')
    setSearchMode(true)
    window.scrollTo({ top: 0 })
  }

  const title = searchMode ? 'Buscar' : activeFilter === 'todos' ? 'En directo'
    : activeFilter === 'favoritos' ? 'Favoritos' : CATEGORY_LABELS[activeFilter]
  const grouped = activeFilter === 'todos' && !search.trim() && !searchMode

  return (
    <div className={`app-shell ${sidebarVisible ? '' : 'sidebar-hidden'}`}>
      <a className="skip-link" href="#channels">Ir a los canales</a>
      <Navigation active={activeFilter} searchMode={searchMode} favoriteCount={favorites.size}
        onSelect={selectFilter} onSearch={openSearch} />

      <main id="channels" className="main-content" tabIndex={-1}>
        <div className="toolbar">
          <button className="icon-button sidebar-toggle" onClick={() => setSidebarVisible(value => !value)}
            aria-label={sidebarVisible ? 'Ocultar barra lateral' : 'Mostrar barra lateral'}
            aria-expanded={sidebarVisible} aria-controls="app-navigation">
            <Icon name="sidebar" />
          </button>
          <span className="mobile-brand"><Icon name="tv" /> TV España</span>
          <div className="toolbar-search"><SearchBar value={search} onChange={setSearch} /></div>
        </div>

        <div className="page-content">
          <header className="page-heading">
            <h1>{title}</h1>
            <p aria-live="polite" aria-atomic="true">{filteredChannels.length} {filteredChannels.length === 1 ? 'canal' : 'canales'}</p>
          </header>

          {(searchMode || search.length > 0) && <div className="mobile-search"><SearchBar value={search} onChange={setSearch} autoFocus={searchMode} /></div>}

          {activeFilter !== 'favoritos' && !searchMode && <CategoryTabs active={activeFilter} onSelect={selectFilter} />}

          {filteredChannels.length === 0 ? (
            <div className="empty-state">
              <Icon name={activeFilter === 'favoritos' && !search ? 'heart' : 'search'} />
              <h2>{activeFilter === 'favoritos' && !search ? 'Tus canales, a mano' : 'No hay resultados'}</h2>
              <p>{activeFilter === 'favoritos' && !search
                ? 'Toca el corazón de un canal para guardarlo aquí.' : `Prueba con otro nombre${search ? ` distinto de «${search.trim()}»` : ''}.`}</p>
              <button className="text-button" onClick={() => search ? setSearch('') : selectFilter('todos')}>
                {search ? 'Borrar búsqueda' : 'Explorar canales'}
              </button>
            </div>
          ) : grouped ? CATEGORY_ORDER.map(category => (
            <section className="channel-section" key={category} aria-labelledby={`section-${category}`}>
              <div className="section-heading">
                <h2 id={`section-${category}`}>{CATEGORY_LABELS[category]}</h2>
                <button className="text-button" onClick={() => selectFilter(category)} aria-label={`Ver todos los canales de ${CATEGORY_LABELS[category]}`}>
                  Ver todos <Icon name="chevron" />
                </button>
              </div>
              <ChannelGrid channels={filteredChannels.filter(channel => channel.category === category)}
                isFavorite={isFavorite} onPlay={play} onToggleFavorite={toggle} />
            </section>
          )) : <ChannelGrid channels={filteredChannels} isFavorite={isFavorite}
            onPlay={play} onToggleFavorite={toggle} />}
        </div>
      </main>

      {activeChannel && <VideoPlayer returnFocusRef={playerOpener} channel={activeChannel} onClose={() => setActiveChannel(null)} onChannelChange={setActiveChannel} />}
    </div>
  )
}
