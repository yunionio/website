import fs from 'node:fs'
import path from 'node:path'
import type { Locator, Page } from 'playwright'
import { resolveShotPath } from '../manifest.ts'

const shotOptions = {
  type: 'png' as const,
  // Capture at deviceScaleFactor (2x) instead of 1 CSS pixel per screenshot pixel.
  scale: 'device' as const,
  animations: 'disabled' as const,
  caret: 'hide' as const,
}

export async function settle (page: Page, ms = 400): Promise<void> {
  await page.waitForTimeout(ms)
}

/**
 * Dismiss the yellow "当前配置的控制台地址为…" TopAlert so doc screenshots stay clean.
 * Close persists via localStorage `topAlert` (same as clicking the alert X).
 */
export async function dismissTopAlert (page: Page): Promise<void> {
  for (let i = 0; i < 3; i++) {
    const close = page.locator('.global-top-alert .ant-alert-close-icon, .top-alert .ant-alert-close-icon').first()
    if (!(await close.isVisible().catch(() => false))) break
    await close.click().catch(() => undefined)
    await settle(page, 200)
  }
  // Fallback: hide if still present (e.g. close icon not interactable)
  await page.addStyleTag({
    content: '.global-top-alert, .top-alert .ant-alert { display: none !important; }',
  }).catch(() => undefined)
}

/** Prefer element screenshot; fall back to viewport. */
export async function captureShot (
  page: Page,
  shotId: string,
  target?: Locator,
): Promise<string> {
  await dismissTopAlert(page)
  const outPath = resolveShotPath(shotId)
  fs.mkdirSync(path.dirname(outPath), { recursive: true })

  if (target) {
    // Avoid strict-mode violations when a compound locator matches multiple nodes.
    const shot = target.first()
    await shot.waitFor({ state: 'visible', timeout: 30_000 })
    await shot.scrollIntoViewIfNeeded()
    await settle(page, 300)
    await shot.screenshot({ path: outPath, ...shotOptions })
  } else {
    await settle(page, 300)
    await page.screenshot({ path: outPath, fullPage: false, ...shotOptions })
  }

  console.log(`  ✓ ${shotId} → ${outPath}`)
  return outPath
}

export async function waitForListReady (page: Page): Promise<Locator> {
  const body = page.locator('.llm-sku-list-page-body, .llm-sku-card-list, .llm-sku-list').first()
  await body.waitFor({ state: 'visible', timeout: 60_000 })
  // Cards or empty/loading state
  await page
    .locator('.catalog-card, .llm-sku-list, .ant-empty, .ant-spin-spinning')
    .first()
    .waitFor({ state: 'attached', timeout: 60_000 })
    .catch(() => undefined)
  await page.waitForLoadState('networkidle').catch(() => undefined)
  await settle(page, 500)
  return body
}

export async function waitForSkuForm (page: Page): Promise<Locator> {
  const form = page.locator('.llm-sku-create-form').first()
  await form.waitFor({ state: 'visible', timeout: 60_000 })
  await page.waitForLoadState('networkidle').catch(() => undefined)
  await settle(page, 500)
  return form
}

/**
 * Shell that includes the left L2 menu (`.level-2-wrap`) + main page.
 * Prefer this for doc screenshots so navigation context is visible.
 */
export async function waitForAppShell (page: Page): Promise<Locator> {
  const shell = page.locator('.app-content').first()
  await shell.waitFor({ state: 'visible', timeout: 60_000 })

  // Expand L2 menu if collapsed
  const collapsed = page.locator('.level-2-wrap.w-0')
  if (await collapsed.count()) {
    const toggle = page.locator('.level-2-menu-collapse').first()
    if (await toggle.isVisible().catch(() => false)) {
      await toggle.click()
      await settle(page, 300)
    }
  }

  await page.locator('.level-2-wrap, .level-2-menu').first()
    .waitFor({ state: 'visible', timeout: 15_000 })
    .catch(() => undefined)

  await settle(page, 200)
  return shell
}

/** Viewport shot with left nav — use after list/form is ready. */
export async function captureAppShot (page: Page, shotId: string): Promise<string> {
  await waitForAppShell(page)
  return captureShot(page, shotId) // full viewport: navbar + L2 menu + content
}

/** Main content area (page body), avoiding full-app chrome like #app. */
export function mainContent (page: Page): Locator {
  return page.locator('.llm-sku-list-page-body, .page-body').first()
}

export function formDialog (page: Page): Locator {
  return page.locator('.ant-modal:visible, .ant-drawer:visible').filter({
    has: page.locator('.llm-sku-create-form'),
  }).first()
}
