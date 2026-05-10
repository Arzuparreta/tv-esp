import { useEffect } from 'react'

type KeyMap = Record<string, (e: KeyboardEvent) => void>

export function useKeyboard(keyMap: KeyMap, active = true) {
  useEffect(() => {
    if (!active) return
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      const fn = keyMap[e.key] || keyMap[e.code]
      if (fn) {
        e.preventDefault()
        fn(e)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [keyMap, active])
}
