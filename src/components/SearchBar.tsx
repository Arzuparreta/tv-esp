import { useRef } from 'react'
import { Icon } from './Icon'

interface Props {
  value: string
  onChange: (value: string) => void
  autoFocus?: boolean
}

export function SearchBar({ value, onChange, autoFocus }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  return <div className="search-field" role="search">
    <Icon name="search" />
    <input ref={inputRef} type="search" aria-label="Buscar canales" value={value}
      onChange={event => onChange(event.target.value)} placeholder="Buscar canales" autoFocus={autoFocus}
      autoComplete="off" spellCheck={false} onKeyDown={event => {
        if (event.key === 'Escape') { onChange(''); inputRef.current?.blur() }
      }} />
    {value && <button className="icon-button" onClick={() => { onChange(''); inputRef.current?.focus() }} aria-label="Borrar búsqueda">
      <Icon name="close" />
    </button>}
  </div>
}
