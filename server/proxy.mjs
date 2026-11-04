import { createApp } from './app.mjs'

// JSON array of local M3U paths or URLs supplied by the server owner.
const playlistLocations = JSON.parse(process.env.TV_ESP_PLAYLISTS || '[]')
if (!Array.isArray(playlistLocations) || playlistLocations.some(value => typeof value !== 'string')) {
  throw new Error('TV_ESP_PLAYLISTS must be a JSON array of M3U paths or URLs')
}
const port = Number(process.env.PORT || 3555)
createApp({ playlistLocations }).listen(port, '0.0.0.0', () => {
  console.log(`HLS proxy running on http://0.0.0.0:${port}`)
})
