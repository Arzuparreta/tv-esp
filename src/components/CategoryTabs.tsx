import { CATEGORY_LABELS, CATEGORY_ORDER, type Category } from '../data/types'

interface Props {
  active: Category | 'favoritos' | 'todos'
  onSelect: (cat: Category | 'favoritos' | 'todos') => void
  hasFavorites: boolean
}

export function CategoryTabs({ active, onSelect, hasFavorites }: Props) {
  const tabs: { key: Category | 'favoritos' | 'todos'; label: string }[] = [
    ...(hasFavorites ? [{ key: 'favoritos' as const, label: 'Favoritos' }] : []),
    { key: 'todos' as const, label: 'Todos' },
    ...CATEGORY_ORDER.map(k => ({ key: k, label: CATEGORY_LABELS[k] })),
  ]

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none px-1">
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onSelect(t.key)}
          className={`pill shrink-0 rounded-full px-5 py-2 text-sm font-medium whitespace-nowrap cursor-pointer
            ${active === t.key
              ? 'pill-active'
              : 'bg-white/5 text-text-secondary hover:bg-white/10 hover:text-white'
            }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
