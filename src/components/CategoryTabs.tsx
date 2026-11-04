import { CATEGORY_LABELS, CATEGORY_ORDER, type Category } from '../data/types'

interface Props {
  active: Category | 'favoritos' | 'todos'
  onSelect: (cat: Category | 'todos') => void
}

export function CategoryTabs({ active, onSelect }: Props) {
  const tabs = [{ key: 'todos' as const, label: 'Todos' }, ...CATEGORY_ORDER.map(key => ({ key, label: CATEGORY_LABELS[key] }))]
  return <nav className="category-tabs" aria-label="Categorías">
    {tabs.map(tab => <button key={tab.key} aria-pressed={active === tab.key}
      onClick={event => { onSelect(tab.key); event.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest' }) }}>
      {tab.label}
    </button>)}
  </nav>
}
