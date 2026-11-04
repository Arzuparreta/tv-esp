import { CATEGORY_LABELS, CATEGORY_ORDER, type Category } from '../data/types'
import { Icon, type IconName } from './Icon'

const categoryIcons: Record<Category, IconName> = {
  principales: 'tv', informativos: 'news', deportes: 'sport', tematicos: 'films', infantiles: 'kids', autonomicos: 'region',
}

interface Props {
  active: Category | 'todos' | 'favoritos'
  searchMode: boolean
  favoriteCount: number
  onSelect: (filter: Category | 'todos' | 'favoritos') => void
  onSearch: () => void
}

export function Navigation({ active, searchMode, favoriteCount, onSelect, onSearch }: Props) {
  return <>
    <aside className="app-sidebar" id="app-navigation">
      <a className="brand" href="/" onClick={event => { event.preventDefault(); onSelect('todos') }}><Icon name="tv" /> TV España</a>
      <nav aria-label="Navegación principal">
        <button className={`nav-item ${active === 'todos' && !searchMode ? 'selected' : ''}`}
          aria-current={active === 'todos' && !searchMode ? 'page' : undefined} onClick={() => onSelect('todos')}>
          <Icon name="tv" /> En directo
        </button>
        <button className={`nav-item ${active === 'favoritos' ? 'selected' : ''}`}
          aria-current={active === 'favoritos' ? 'page' : undefined} onClick={() => onSelect('favoritos')}>
          <Icon name="heart" /> Favoritos {favoriteCount > 0 && <span className="nav-count" aria-hidden="true">{favoriteCount}</span>}
        </button>
        <p className="nav-heading">Explorar</p>
        {CATEGORY_ORDER.map(category => <button key={category} className={`nav-item ${active === category ? 'selected' : ''}`}
          aria-current={active === category ? 'page' : undefined} onClick={() => onSelect(category)}>
          <Icon name={categoryIcons[category]} /> {CATEGORY_LABELS[category]}
        </button>)}
      </nav>
      <a className="source-link" href="https://github.com/LaQuay/TDTChannels" target="_blank" rel="noopener noreferrer">Fuentes de TDTChannels <Icon name="external" /></a>
    </aside>
    <nav className="mobile-navigation" aria-label="Navegación principal">
      <button aria-current={active !== 'favoritos' && !searchMode ? 'page' : undefined} onClick={() => onSelect('todos')}>
        <Icon name="tv" /><span>En directo</span>
      </button>
      <button aria-current={active === 'favoritos' ? 'page' : undefined} onClick={() => onSelect('favoritos')}>
        <Icon name="heart" filled={active === 'favoritos'} /><span>Favoritos</span>
      </button>
      <button aria-current={searchMode ? 'page' : undefined} onClick={onSearch}>
        <Icon name="search" /><span>Buscar</span>
      </button>
    </nav>
  </>
}
