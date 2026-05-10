import { describe, it, expect } from 'vitest'
import { getSortedSources, getNextSource, getYouTubeEmbedUrl } from '../src/lib/player'
import type { Channel } from '../src/data/types'

const mockChannel: Channel = {
  id: 'test',
  name: 'Test',
  logo: 'https://example.com/logo.png',
  category: 'principales',
  sources: [
    { type: 'web', url: 'https://example.com/web' },
    { type: 'hls', url: 'https://example.com/stream.m3u8' },
    { type: 'iframe', url: 'https://example.com/embed' },
    { type: 'youtube', url: 'https://www.youtube.com/channel/UCxxx/live' },
    { type: 'atres', url: 'antena3' },
  ],
}

describe('getSortedSources', () => {
  it('sorts by priority: atres > hls > iframe > youtube > web', () => {
    const sorted = getSortedSources(mockChannel)
    expect(sorted[0].type).toBe('atres')
    expect(sorted[1].type).toBe('hls')
    expect(sorted[2].type).toBe('iframe')
    expect(sorted[3].type).toBe('youtube')
    expect(sorted[4].type).toBe('web')
  })
})

describe('getNextSource', () => {
  it('returns highest priority source when nothing has failed', () => {
    const src = getNextSource(mockChannel, new Set())
    expect(src?.type).toBe('atres')
  })

  it('skips failed sources', () => {
    const failed = new Set(['antena3'])
    const src = getNextSource(mockChannel, failed)
    expect(src?.type).toBe('hls')
  })

  it('returns null when all sources have failed', () => {
    const failed = new Set(mockChannel.sources.map(s => s.url))
    const src = getNextSource(mockChannel, failed)
    expect(src).toBeNull()
  })

  it('falls back through the full chain', () => {
    const failed = new Set<string>()

    const s1 = getNextSource(mockChannel, failed)
    expect(s1?.type).toBe('atres')
    failed.add(s1!.url)

    const s2 = getNextSource(mockChannel, failed)
    expect(s2?.type).toBe('hls')
    failed.add(s2!.url)

    const s3 = getNextSource(mockChannel, failed)
    expect(s3?.type).toBe('iframe')
    failed.add(s3!.url)

    const s4 = getNextSource(mockChannel, failed)
    expect(s4?.type).toBe('youtube')
    failed.add(s4!.url)

    const s5 = getNextSource(mockChannel, failed)
    expect(s5?.type).toBe('web')
  })
})

describe('getYouTubeEmbedUrl', () => {
  it('converts channel live URL to embed', () => {
    const url = 'https://www.youtube.com/channel/UCxyz123/live'
    const embed = getYouTubeEmbedUrl(url)
    expect(embed).toBe('https://www.youtube.com/embed/live_stream?channel=UCxyz123&autoplay=1&mute=0')
  })

  it('converts video URL to embed', () => {
    const url = 'https://www.youtube.com/live/abc123'
    const embed = getYouTubeEmbedUrl(url)
    expect(embed).toBe('https://www.youtube.com/embed/abc123?autoplay=1&mute=0')
  })
})
