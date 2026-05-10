import type { Channel, Source, SourceType } from '../data/types'

/** Priority order: atres API > native HLS > iframe > youtube > web (opens external) */
const TYPE_PRIORITY: Record<SourceType, number> = {
  atres: 0,
  hls: 1,
  iframe: 2,
  youtube: 3,
  web: 4,
}

export function getSortedSources(channel: Channel): Source[] {
  return [...channel.sources].sort(
    (a, b) => TYPE_PRIORITY[a.type] - TYPE_PRIORITY[b.type]
  )
}

export function getNextSource(
  channel: Channel,
  failedUrls: Set<string>
): Source | null {
  const sorted = getSortedSources(channel)
  return sorted.find(s => !failedUrls.has(s.url)) ?? null
}

export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/channel\/([^/]+)\/live/,
    /youtube\.com\/live\/([^?&]+)/,
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?&]+)/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

/**
 * YouTube channel URLs like /channel/UCxxx/live need a special embed.
 * We use the channel embed which auto-plays the current live stream.
 */
export function getYouTubeEmbedUrl(url: string): string {
  const channelMatch = url.match(/youtube\.com\/channel\/([^/]+)/)
  if (channelMatch) {
    return `https://www.youtube.com/embed/live_stream?channel=${channelMatch[1]}&autoplay=1&mute=0`
  }
  const videoId = extractYouTubeId(url)
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0`
  }
  return url
}
