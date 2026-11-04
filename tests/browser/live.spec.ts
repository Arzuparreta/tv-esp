import { expect, test } from '@playwright/test'

test.skip(process.env.TV_ESP_LIVE_TESTS !== '1', 'Opt-in checks of actual live broadcasts and FFmpeg')

for (const name of ['Antena 3', 'La Sexta']) {
  test(`${name} decodes real video inside tv-esp and releases it on close`, async ({ page }) => {
    test.setTimeout(45000)
    await page.goto('/')
    await page.getByRole('button', { name: `Ver ${name} en directo`, exact: true }).click()
    const video = page.locator('video')
    try { await expect.poll(() => video.evaluateAll(elements => {
      const current = elements[0] as HTMLVideoElement | undefined
      return !!current && current.currentTime > 2 && current.videoWidth > 0 && current.getVideoPlaybackQuality().totalVideoFrames > 0
    }), { timeout: 35000 }).toBe(true) } catch (error) {
      console.log('Playback diagnostic', name, await video.evaluateAll(elements => elements.map(element => {
        const current = element as HTMLVideoElement
        return { time: current.currentTime, paused: current.paused, ready: current.readyState, width: current.videoWidth, error: current.error?.code, buffered: current.buffered.length ? current.buffered.end(0) : 0 }
      })))
      throw error
    }
    console.log(name, await video.evaluate(element => {
      const current = element as HTMLVideoElement
      return { time: current.currentTime, width: current.videoWidth, height: current.videoHeight, frames: current.getVideoPlaybackQuality().totalVideoFrames }
    }))
    const audioTracks = await video.evaluate(element => {
      const stream = (element as HTMLVideoElement & { captureStream: () => MediaStream }).captureStream()
      const count = stream.getAudioTracks().length
      stream.getTracks().forEach(track => track.stop())
      return count
    })
    expect(audioTracks, 'The broadcast must include decoded audio as well as video').toBeGreaterThan(0)
    await page.getByRole('button', { name: 'Volver a los canales', exact: true }).click()
    await expect(video).toHaveCount(0)
  })
}
