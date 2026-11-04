import { expect, test } from '@playwright/test'

async function openNavigation(page: import('@playwright/test').Page, label: string) {
  await page.getByRole('navigation', { name: 'Navegación principal' }).filter({ visible: true }).getByRole('button', { name: label, exact: true }).click()
}

test('favorites are usable by touch, persist, and stay reachable when empty', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Añadir La 1 a favoritos', exact: true }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.reload()
  await openNavigation(page, 'Favoritos')
  await expect(page.getByRole('article')).toHaveCount(1)
  await expect(page.getByRole('button', { name: 'Quitar La 1 de favoritos' })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Quitar La 1 de favoritos' }).click()
  await expect(page.getByRole('heading', { name: 'Tus canales, a mano' })).toBeVisible()
  await page.getByRole('button', { name: 'Explorar canales', exact: true }).click()
  await expect(page.getByRole('article')).toHaveCount(50)
})

test('search, clear, and category navigation preserve the expected channel list', async ({ page, isMobile }) => {
  await page.goto('/')
  if (isMobile && (await page.viewportSize())!.width < 760) await openNavigation(page, 'Buscar')
  const search = page.getByRole('searchbox', { name: 'Buscar canales' }).filter({ visible: true })
  await search.fill('  ANTENA  ')
  await expect(page.getByRole('article')).toHaveCount(1)
  await expect(page.getByRole('button', { name: 'Ver Antena 3 en directo' })).toBeVisible()
  await search.fill('No existe este canal')
  await expect(page.getByRole('heading', { name: 'No hay resultados' })).toBeVisible()
  await page.getByRole('button', { name: 'Borrar búsqueda', exact: true }).first().click()
  await expect(page.getByRole('article')).toHaveCount(50)
  await openNavigation(page, 'En directo')
  await page.getByRole('button', { name: 'Ver todos los canales de Deportes' }).click()
  await expect(page.getByRole('heading', { name: 'Deportes', exact: true })).toBeVisible()
  await expect(page.getByRole('article')).toHaveCount(5)
})

test('player traps focus, changes channels, and restores focus and scroll on close', async ({ page }) => {
  // Keep this UI test independent of third-party broadcasts.
  await page.route('**:3555/**', route => route.abort())
  await page.goto('/')
  const opener = page.getByRole('button', { name: 'Ver Cuatro en directo', exact: true })
  await opener.scrollIntoViewIfNeeded()
  const scrollBefore = await page.evaluate(() => window.scrollY)
  const viewportBefore = page.viewportSize()!
  await opener.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('link', { name: 'Abrir directo' })).toHaveAttribute('href', 'https://www.mitele.es/directo/cuatro')
  await expect(dialog.getByRole('link', { name: 'Abrir directo' })).toHaveAttribute('rel', 'noopener noreferrer')
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden')
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Tab')
    expect(await page.evaluate(() => !!document.activeElement?.closest('dialog'))).toBe(true)
  }
  await dialog.getByRole('button', { name: 'Canal siguiente', exact: true }).click()
  await expect(dialog).toHaveAttribute('aria-label', 'Reproduciendo Telecinco')
  for (const size of [{ width: 390, height: 844 }, { width: 844, height: 390 }, { width: 834, height: 1194 }, { width: 1194, height: 834 }]) {
    await page.setViewportSize(size)
    const bounds = (await dialog.boundingBox())!
    expect(bounds.x).toBeGreaterThanOrEqual(0)
    expect(bounds.y).toBeGreaterThanOrEqual(0)
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(size.width)
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(size.height)
    await expect(dialog.getByRole('button', { name: 'Canal siguiente', exact: true })).toBeInViewport()
  }
  await page.setViewportSize(viewportBefore)
  await dialog.getByRole('button', { name: 'Ocultar lista de canales' }).click()
  await expect(dialog.getByRole('navigation', { name: 'Cambiar de canal' })).toHaveCount(0)
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(opener).toBeFocused()
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollBefore)
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
})

test('layout has no horizontal overflow and keeps touch targets and logos intact', async ({ page }) => {
  await page.goto('/')
  for (const size of [{ width: 320, height: 740 }, { width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 834, height: 1194 }, { width: 1194, height: 834 }, { width: 1440, height: 1000 }]) {
    await page.setViewportSize(size)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${size.width}px overflows`).toBe(true)
    const favorite = page.getByRole('button', { name: 'Añadir La 1 a favoritos', exact: true })
    const bounds = (await favorite.boundingBox())!
    expect(bounds.width).toBeGreaterThanOrEqual(44)
    expect(bounds.height).toBeGreaterThanOrEqual(44)
    expect(bounds.x).toBeGreaterThanOrEqual(0)
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(size.width)
  }
  const logos = page.locator('.channel-artwork img')
  // Decode lazy logos without relying on viewport intersection timing.
  expect(await logos.evaluateAll(images => Promise.all(images.map(async image => {
    try { (image as HTMLImageElement).loading = 'eager'; await (image as HTMLImageElement).decode(); return (image as HTMLImageElement).naturalWidth > 0 } catch { return false }
  })))).not.toContain(false)
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' })
  await expect(page.locator('html')).toHaveCSS('background-color', 'rgb(20, 20, 22)')
  await page.emulateMedia({ colorScheme: 'light' })
  await expect(page.locator('html')).toHaveCSS('background-color', 'rgb(255, 255, 255)')
})

test('mobile category strip can reach its last category', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const categories = page.getByRole('navigation', { name: 'Categorías' })
  await categories.getByRole('button', { name: 'Autonómicos', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Autonómicos', exact: true })).toBeVisible()
  await expect(page.getByRole('article')).toHaveCount(14)
  expect(await categories.getByRole('button', { name: 'Autonómicos', exact: true }).evaluate(element => {
    const rect = element.getBoundingClientRect()
    return rect.left >= 0 && rect.right <= innerWidth
  })).toBe(true)
})

test('fullscreen uses the player surface and can return to its sheet', async ({ page }) => {
  await page.goto('/')
  test.skip(!await page.evaluate(() => document.fullscreenEnabled), 'This browser uses native video fullscreen instead of element fullscreen.')
  await page.getByRole('button', { name: 'Ver Cuatro en directo', exact: true }).click()
  await page.getByRole('button', { name: 'Pantalla completa', exact: true }).click()
  await expect.poll(() => page.evaluate(() => document.fullscreenElement?.className)).toBe('player-frame')
  await page.getByRole('button', { name: 'Salir de pantalla completa', exact: true }).click()
  await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBeNull()
  await page.getByRole('button', { name: 'Volver a los canales' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('HLS exposes native playback controls and closing releases the player', async ({ page }) => {
  await page.route('**:3555/**', () => { /* Keep loading deterministic while checking the player UI. */ })
  await page.goto('/')
  await page.getByRole('button', { name: 'Ver La 1 en directo', exact: true }).click()
  await expect(page.locator('video')).toHaveAttribute('controls', '')
  await expect(page.locator('video')).toHaveAttribute('playsinline', '')
  await page.getByRole('button', { name: 'Volver a los canales' }).click()
  await expect(page.locator('video')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Ver La 1 en directo', exact: true })).toBeFocused()
})
