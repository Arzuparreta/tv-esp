export type Category =
  | 'principales'
  | 'informativos'
  | 'deportes'
  | 'infantiles'
  | 'tematicos'
  | 'autonomicos'

export const CATEGORY_LABELS: Record<Category, string> = {
  principales: 'Principales',
  informativos: 'Informativos',
  deportes: 'Deportes',
  infantiles: 'Infantiles',
  tematicos: 'Temáticos',
  autonomicos: 'Autonómicos',
}

export const CATEGORY_ORDER: Category[] = [
  'principales',
  'informativos',
  'deportes',
  'tematicos',
  'infantiles',
  'autonomicos',
]

export type SourceType = 'hls' | 'video' | 'iframe' | 'youtube' | 'web' | 'atres'

export interface Source {
  type: SourceType
  url: string
  label?: string
  priority?: number
}

export interface Channel {
  id: string
  name: string
  logo: string
  category: Category
  sources: Source[]
  epgId?: string
  web?: string
}
