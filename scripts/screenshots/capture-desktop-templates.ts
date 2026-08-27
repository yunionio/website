/**
 * Recapture desktop-template screenshots only (list / import / create / update).
 * Usage: yarn exec tsx capture-desktop-templates.ts
 */
import { chromium } from 'playwright'
import { browserDefaults } from './playwright.config.ts'
import { loadEnv } from './src/env.ts'
import { createAuthedContext } from './src/auth.ts'
import {
  captureAppShot,
  captureShot,
  dismissTopAlert,
  formDialog,
  settle,
  waitForAppShell,
  waitForListReady,
  waitForSkuForm,
} from './src/shot.ts'

const DESKTOP_APP = process.env.SCREENSHOT_DESKTOP_APP || 'ubuntu-kde'

function cardByName (page: import('playwright').Page, name: string) {
  return page.locator('.catalog-card, .community-image-card, .ant-card').filter({ hasText: new RegExp(name, 'i') }).first()
}

async function openEditDialog (page: import('playwright').Page): Promise<boolean> {
  const modify = page
    .locator('.catalog-card-actions, .catalog-card-footer')
    .locator('a, button, .ant-btn')
    .filter({ hasText: /修改|编辑|Modify|Edit/i })
    .first()

  if (await modify.isVisible().catch(() => false)) {
    await modify.click()
  } else {
    const fallback = page.locator('a, button, .ant-btn').filter({ hasText: /^修改$|^编辑$/ }).first()
    if (!(await fallback.isVisible().catch(() => false))) return false
    await fallback.click()
  }

  const dialog = formDialog(page)
  try {
    await dialog.waitFor({ state: 'visible', timeout: 20_000 })
    await waitForSkuForm(page)
    return true
  } catch {
    return false
  }
}

async function openImportDrawer (page: import('playwright').Page): Promise<{ opened: boolean, imported: boolean }> {
  const card = cardByName(page, DESKTOP_APP)
  if (!(await card.isVisible({ timeout: 20_000 }).catch(() => false))) {
    console.warn(`  ⚠ community card not found: ${DESKTOP_APP}`)
    return { opened: false, imported: false }
  }
  await card.scrollIntoViewIfNeeded().catch(() => undefined)
  await card.click()
  const drawer = page.locator('.catalog-drawer-wrap .ant-drawer:visible, .ant-drawer:visible').first()
  try {
    await drawer.waitFor({ state: 'visible', timeout: 15_000 })
    await settle(page, 500)
  } catch {
    return { opened: false, imported: false }
  }
  const importedTag = drawer.locator('.ant-tag').filter({ hasText: /已导入|Imported/i }).first()
  const imported = await importedTag.isVisible().catch(() => false)
  return { opened: true, imported }
}

async function main (): Promise<void> {
  const env = loadEnv()
  const browser = await chromium.launch({ headless: browserDefaults.headless })
  try {
    const ctx = await createAuthedContext(browser, env)
    const page = await ctx.newPage()
    page.setDefaultTimeout(60_000)

    // community import page
    await page.goto('/app-desktop-sku/import-from-community', { waitUntil: 'domcontentloaded' })
    await page.locator('.catalog-grid-page-body, .community-image-card, .catalog-card, .ant-empty, .ant-spin')
      .first()
      .waitFor({ state: 'attached', timeout: 60_000 })
    await page.waitForLoadState('networkidle').catch(() => undefined)
    await settle(page, 800)
    await dismissTopAlert(page)

    const communityCard = cardByName(page, DESKTOP_APP)
    if (await communityCard.isVisible().catch(() => false)) {
      await communityCard.scrollIntoViewIfNeeded().catch(() => undefined)
      await settle(page, 300)
    }
    await captureAppShot(page, 'desktop-sku-import-community')

    const { opened, imported } = await openImportDrawer(page)
    if (opened) {
      console.log(`  · drawer opened, imported=${imported}`)
      await captureAppShot(page, 'desktop-sku-import-drawer')
      await page.keyboard.press('Escape').catch(() => undefined)
      await settle(page, 400)
    } else {
      console.warn('  ⚠ import drawer not opened')
    }

    // template list
    await page.goto('/app-desktop-sku', { waitUntil: 'domcontentloaded' })
    await waitForListReady(page)
    await settle(page, 600)
    await dismissTopAlert(page)
    await captureAppShot(page, 'desktop-sku-list')

    // create form
    await page.goto('/app-desktop-sku/create', { waitUntil: 'domcontentloaded' })
    await waitForSkuForm(page)
    await settle(page, 500)
    await dismissTopAlert(page)
    await captureAppShot(page, 'desktop-sku-create')

    // update dialog
    await page.goto('/app-desktop-sku', { waitUntil: 'domcontentloaded' })
    await waitForListReady(page)
    await dismissTopAlert(page)
    const edited = await openEditDialog(page)
    if (edited) {
      await waitForAppShell(page)
      await settle(page, 500)
      await captureShot(page, 'desktop-sku-update')
      await page.keyboard.press('Escape').catch(() => undefined)
    } else {
      console.warn('  ⚠ edit dialog not opened; fallback to create form')
      await page.goto('/app-desktop-sku/create', { waitUntil: 'domcontentloaded' })
      await waitForSkuForm(page)
      await captureAppShot(page, 'desktop-sku-update')
    }

    await ctx.close()
    console.log('done')
  } finally {
    await browser.close()
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
