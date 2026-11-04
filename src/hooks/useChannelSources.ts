import { useEffect, useState } from 'react'
import type { Channel, Source } from '../data/types'
import { mergeSources } from '../lib/player'
import { channelSourcesUrl } from '../lib/proxy'

function isPlayableSource(value: unknown): value is Source {
  if (!value || typeof value !== 'object' || !('type' in value) || !('url' in value)) return false
  return (value.type === 'hls' || value.type === 'video') && typeof value.url === 'string' && /^https?:\/\//.test(value.url)
    && (!('label' in value) || typeof value.label === 'string')
    && (!('priority' in value) || (typeof value.priority === 'number' && Number.isFinite(value.priority)))
}

// The playback component is keyed by channel and retry, so tokens are refreshed
// on every new playback session and late responses cannot change another channel.
export function useChannelSources(channel: Channel) {
  const [sources, setSources] = useState<Source[] | null>(null)
  const [unavailable, setUnavailable] = useState(false)
  useEffect(() => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 9000)
    let disposed = false
    fetch(channelSourcesUrl(channel), { signal: controller.signal, cache: 'no-store' })
      .then(async response => {
        if (!response.ok) throw new Error('Source resolution failed')
        const data = await response.json()
        if (!Array.isArray(data.sources)) throw new Error('Invalid sources')
        if (!disposed) {
          setSources(mergeSources(channel, data.sources.filter(isPlayableSource)))
          setUnavailable(!!data.unavailable)
        }
      })
      .catch(() => {
        if (!disposed) { setSources(mergeSources(channel)); setUnavailable(true) }
      })
      .finally(() => clearTimeout(timeout))
    return () => { disposed = true; clearTimeout(timeout); controller.abort() }
  }, [channel])
  return { sources, unavailable }
}
