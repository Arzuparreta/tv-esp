import { useState, useCallback } from 'react'

const STORAGE_KEY = 'tv-esp-favorites'

function loadFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const stored: unknown = raw ? JSON.parse(raw) : []
    if (Array.isArray(stored)) return new Set(stored.filter((id): id is string => typeof id === 'string'))
  } catch { /* ignore */ }
  return new Set()
}

function saveFavorites(ids: Set<string>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids])) } catch { /* Favorites remain usable when storage is unavailable. */ }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(loadFavorites)

  const toggle = useCallback((id: string) => {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      saveFavorites(next)
      return next
    })
  }, [])

  const isFavorite = useCallback((id: string) => favorites.has(id), [favorites])

  return { favorites, toggle, isFavorite }
}
