import type { CSSProperties, ReactNode } from 'react'

const paths = {
  tv: <><rect x="3" y="4" width="18" height="13" rx="3" /><path d="M8 21h8M12 17v4" /></>,
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />,
  search: <><circle cx="10.5" cy="10.5" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
  sidebar: <><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M9 4v16M5.8 8h.4m-.4 4h.4m-.4 4h.4" /></>,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  chevron: <path d="m9 5 7 7-7 7" />,
  back: <path d="m15 5-7 7 7 7" />,
  news: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 8h5v5H7zM16 8h1m-1 4h1M7 16h10" /></>,
  sport: <><circle cx="12" cy="12" r="9" /><path d="m9 9 6 0 2 5-5 3-5-3 2-5ZM9 9 7 5m8 4 2-4m0 9 4 1m-9 2v4m-5-7-4 1" /></>,
  films: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 4v16M17 4v16M3 9h4m-4 6h4m10-6h4m-4 6h4" /></>,
  kids: <><circle cx="12" cy="12" r="9" /><path d="M8 9h.01M16 9h.01M8 14a4.5 4.5 0 0 0 8 0" /></>,
  region: <path d="m9 4-6 3v14l6-3 6 3 6-3V4l-6 3-6-3ZM9 4v14M15 7v14" />,
  play: <path d="m9 5 11 7-11 7V5Z" />,
  external: <><path d="M14 3h7v7m0-7L10 14M10 4H6a3 3 0 0 0-3 3v11a3 3 0 0 0 3 3h11a3 3 0 0 0 3-3v-4" /></>,
  fullscreen: <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" />,
  minimize: <path d="M3 8h5V3m8 0v5h5M8 21v-5H3m18 0h-5v5" />,
  list: <path d="M9 6h12M9 12h12M9 18h12M3 6h.01M3 12h.01M3 18h.01" />,
} satisfies Record<string, ReactNode>

export type IconName = keyof typeof paths

export function Icon({ name, filled = false, style }: { name: IconName; filled?: boolean; style?: CSSProperties }) {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}>
    {paths[name]}
  </svg>
}
