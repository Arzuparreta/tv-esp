import type { Channel } from '../data/types'

const PROXY_PORT = 3555

function getProxyOrigin(): string {
  const { hostname } = window.location
  return `http://${hostname}:${PROXY_PORT}`
}

export function proxyUrl(url: string): string {
  return `${getProxyOrigin()}/proxy?url=${encodeURIComponent(url)}`
}

export function atresplayerUrl(channel: string): string {
  return `${getProxyOrigin()}/atresplayer?ch=${channel}`
}

export function channelSourcesUrl(channel: Channel): string {
  const params = new URLSearchParams({ ch: channel.id, name: channel.name })
  if (channel.epgId) params.set('epg', channel.epgId)
  return `${getProxyOrigin()}/sources?${params}`
}
