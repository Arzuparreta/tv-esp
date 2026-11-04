import { expect, test } from '@playwright/test'

test('failed feeds reach the official site and retry resolves fresh sources', async ({ page }) => {
  let resolutions = 0
  await page.route('**:3555/**', route => {
    if (new URL(route.request().url()).pathname === '/sources') {
      resolutions++
      return route.fulfill({ json: { sources: [
        { type: 'hls', url: `https://tv.example/first-${resolutions}.m3u8` },
        { type: 'hls', url: `https://tv.example/second-${resolutions}.m3u8` },
      ] } })
    }
    return route.fulfill({ status: 404 })
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Ver Cuatro en directo', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('link', { name: 'Abrir directo', exact: true })).toHaveAttribute('href', 'https://www.mediasetinfinity.es/directo/cuatro/', { timeout: 25000 })
  const initialResolutions = resolutions
  await dialog.getByRole('button', { name: 'Reintentar fuentes' }).click()
  await expect.poll(() => resolutions).toBeGreaterThan(initialResolutions)
  await expect(dialog.getByRole('link', { name: 'Abrir directo', exact: true })).toBeVisible({ timeout: 25000 })
})

test('manual source changes work even when an embedded page cannot report its failure', async ({ page }) => {
  await page.route('**:3555/**', route => route.fulfill({ json: { sources: [] } }))
  await page.route('https://www.youtube.com/**', route => route.fulfill({ contentType: 'text/html', body: '<p>Unavailable</p>' }))
  await page.goto('/')
  await page.getByRole('button', { name: 'Ver IB3 en directo', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.locator('iframe')).toBeVisible()
  await dialog.getByRole('button', { name: 'Probar otra fuente' }).click()
  await expect(dialog.getByRole('link', { name: 'Abrir directo', exact: true })).toHaveAttribute('href', 'https://ib3.org/directe')
})

test('an unresponsive source expires and a late response cannot replace the next channel', async ({ page }) => {
  await page.clock.install()
  await page.route('**:3555/**', route => {
    const url = new URL(route.request().url())
    if (url.pathname === '/sources') return route.fulfill({ json: { sources: [] } })
    // A CDN can hang without ever producing an HLS fatal error.
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Ver La 1 en directo', exact: true }).click()
  await expect(page.locator('video')).toBeVisible()
  // Both bundled HLS sources must expire before reaching the official site.
  const initialVideo = page.locator('video')
  const firstSrc = await initialVideo.getAttribute('src')
  await page.clock.fastForward(16000)
  await expect(initialVideo).not.toHaveAttribute('src', firstSrc!)
  await page.clock.fastForward(16000)
  await expect(page.getByRole('link', { name: 'Abrir directo', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Canal siguiente', exact: true }).click()
  await expect(page.getByRole('dialog')).toHaveAttribute('aria-label', 'Reproduciendo La 2')
  await expect(page.locator('video')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Web oficial', exact: true })).toHaveAttribute('href', 'https://www.rtve.es/play/videos/directo/la-2/')
})
