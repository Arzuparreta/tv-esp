import { describe, it, expect } from 'vitest'
import { channels } from '../src/data/channels'
import { CATEGORY_ORDER } from '../src/data/types'
import type { Channel, SourceType } from '../src/data/types'

describe('Channel registry', () => {
  it('has at least 30 channels', () => {
    expect(channels.length).toBeGreaterThanOrEqual(30)
  })

  it('every channel has a unique id', () => {
    const ids = channels.map(c => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every channel has name, logo, category, and at least one source', () => {
    for (const ch of channels) {
      expect(ch.name, `${ch.id} missing name`).toBeTruthy()
      expect(ch.logo, `${ch.id} missing logo`).toBeTruthy()
      expect(CATEGORY_ORDER, `${ch.id} has invalid category`).toContain(ch.category)
      expect(ch.sources.length, `${ch.id} has no sources`).toBeGreaterThanOrEqual(1)
    }
  })

  it('every source has a valid type and non-empty url', () => {
    const validTypes: SourceType[] = ['hls', 'iframe', 'youtube', 'web', 'atres']
    for (const ch of channels) {
      for (const src of ch.sources) {
        expect(validTypes, `${ch.id} source type "${src.type}" invalid`).toContain(src.type)
        expect(src.url, `${ch.id} source url empty`).toBeTruthy()
      }
    }
  })

  it('HLS sources have valid m3u8 URLs', () => {
    for (const ch of channels) {
      for (const src of ch.sources) {
        if (src.type === 'hls') {
          expect(src.url, `${ch.id} HLS url not https`).toMatch(/^https?:\/\//)
          expect(src.url, `${ch.id} HLS url missing m3u8`).toContain('.m3u8')
        }
      }
    }
  })

  it('atres sources reference valid channel slugs', () => {
    const validSlugs = ['antena3', 'lasexta', 'neox', 'nova', 'mega', 'atreseries']
    for (const ch of channels) {
      for (const src of ch.sources) {
        if (src.type === 'atres') {
          expect(validSlugs, `${ch.id} atres slug "${src.url}" invalid`).toContain(src.url)
        }
      }
    }
  })

  it('web sources have valid URLs', () => {
    for (const ch of channels) {
      for (const src of ch.sources) {
        if (src.type === 'web') {
          expect(src.url, `${ch.id} web url not https`).toMatch(/^https:\/\//)
        }
      }
    }
  })

  it('principales category has the 6 main channels', () => {
    const principales = channels.filter(c => c.category === 'principales')
    const names = principales.map(c => c.id)
    expect(names).toContain('la1')
    expect(names).toContain('la2')
    expect(names).toContain('antena3')
    expect(names).toContain('lasexta')
    expect(names).toContain('cuatro')
    expect(names).toContain('telecinco')
  })

  it('all categories have at least one channel', () => {
    for (const cat of CATEGORY_ORDER) {
      const count = channels.filter(c => c.category === cat).length
      expect(count, `category "${cat}" is empty`).toBeGreaterThanOrEqual(1)
    }
  })
})
