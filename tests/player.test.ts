import { describe, it, expect } from 'vitest'
import { getSortedSources, getNextSource, getYouTubeEmbedUrl, mergeSources, sourceKey } from '../src/lib/player'
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
  it('honors configured feeds and the official player preference before generic alternatives', () => {
    const sources = [
      { type: 'hls' as const, url: 'https://api.example/old.m3u8' },
      { type: 'iframe' as const, url: 'https://official.example/embed', priority: 0 },
      { type: 'video' as const, url: 'http://local/compatible', priority: -0.5 },
      { type: 'hls' as const, url: 'https://tuner.example/live.m3u8', priority: -1 },
    ]
    expect(getSortedSources({ ...mockChannel, sources }).map(source => source.url)).toEqual([
      sources[3].url, sources[2].url, sources[1].url, sources[0].url,
    ])
  })
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
  it('can fall back from an iframe to the same official URL as an external page', () => {
    const channel = { ...mockChannel, sources: [
      { type: 'iframe' as const, url: 'https://example.com/live' },
      { type: 'web' as const, url: 'https://example.com/live' },
    ] }
    expect(getNextSource(channel, new Set(['iframe:https://example.com/live']))?.type).toBe('web')
  })
  it('returns highest priority source when nothing has failed', () => {
    const src = getNextSource(mockChannel, new Set())
    expect(src?.type).toBe('atres')
  })

  it('skips failed sources', () => {
    const failed = new Set(['atres:antena3'])
    const src = getNextSource(mockChannel, failed)
    expect(src?.type).toBe('hls')
  })

  it('returns null when all sources have failed', () => {
    const failed = new Set(mockChannel.sources.map(sourceKey))
    const src = getNextSource(mockChannel, failed)
    expect(src).toBeNull()
  })

  it('falls back through the full chain', () => {
    const failed = new Set<string>()

    const s1 = getNextSource(mockChannel, failed)
    expect(s1?.type).toBe('atres')
    failed.add(sourceKey(s1!))

    const s2 = getNextSource(mockChannel, failed)
    expect(s2?.type).toBe('hls')
    failed.add(sourceKey(s2!))

    const s3 = getNextSource(mockChannel, failed)
    expect(s3?.type).toBe('iframe')
    failed.add(sourceKey(s3!))

    const s4 = getNextSource(mockChannel, failed)
    expect(s4?.type).toBe('youtube')
    failed.add(sourceKey(s4!))

    const s5 = getNextSource(mockChannel, failed)
    expect(s5?.type).toBe('web')
  })
})

describe('mergeSources', () => {
  it('keeps all distinct dynamic feeds ahead of static sources and always adds the official site', () => {
    const channel = { ...mockChannel, web: 'https://example.com/official' }
    const resolved = [{ type: 'hls' as const, url: 'https://example.com/resolved.m3u8' }]
    const sources = mergeSources(channel, [...resolved, ...resolved])
    expect(sources[0]).toEqual(resolved[0])
    expect(sources.filter(source => source.url === resolved[0].url)).toHaveLength(1)
    expect(sources.some(source => source.type === 'atres')).toBe(false)
    expect(sources.at(-1)).toMatchObject({ type: 'web', url: channel.web })
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
