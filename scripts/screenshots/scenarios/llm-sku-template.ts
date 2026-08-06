import type { Page } from 'playwright'
import {
  captureAppShot,
  captureShot,
  formDialog,
  settle,
  waitForAppShell,
  waitForListReady,
  waitForSkuForm,
} from '../src/shot.ts'

async function openEditDialog (page: Page): Promise<boolean> {
  // Card footer Actions: first singleAction is「修改」
  const modify = page
    .locator('.catalog-card-actions, .catalog-card-footer')
    .locator('a, button, .ant-btn')
    .filter({ hasText: /修改|编辑|Modify|Edit/i })
    .first()

  if (await modify.isVisible().catch(() => false)) {
    await modify.click()
  } else {
    const fallback = page.locator('a, button, .ant-btn').filter({ hasText: /^修改$|^编辑$/ }).first()
    if (!(await fallback.isVisible().catch(() => false))) {
      return false
    }
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

async function captureMountedModelField (page: Page, shotId: string): Promise<void> {
  const form = await waitForSkuForm(page)
  // Label is aice.model → commonly "模型"
  const modelItem = form.locator('.ant-form-item').filter({
    has: page.locator('.ant-form-item-label', { hasText: /模型|Model/i }),
  }).first()

  if (await modelItem.isVisible().catch(() => false)) {
    await modelItem.scrollIntoViewIfNeeded()
    await settle(page, 300)
  } else {
    await form.evaluate(el => { el.scrollTop = el.scrollHeight })
    await settle(page, 300)
  }

  // Keep left nav in frame (not a cropped form field)
  await captureAppShot(page, shotId)
}

async function captureShowMountedModels (page: Page): Promise<void> {
  // Prefer scrolling a card with mounted models into view, then full-app shot
  const mounted = page.locator('.meta-row, .llm-sku-card-list').locator('text=/模型|推理模型/').first()
  if (await mounted.isVisible().catch(() => false)) {
    await mounted.scrollIntoViewIfNeeded().catch(() => undefined)
    await settle(page, 300)
    await captureAppShot(page, 'sku-show-instant-model')
    return
  }

  // Open sidepage from first card title (keep shell behind drawer)
  const cardTitle = page.locator('.catalog-card, .ant-card').locator('a, .side-page-trigger, span').first()
  if (await cardTitle.isVisible().catch(() => false)) {
    await cardTitle.click()
    const side = page.locator('.ant-drawer:visible, .side-page:visible, .ant-modal:visible').first()
    if (await side.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await settle(page, 500)
      await captureAppShot(page, 'sku-show-instant-model')
      await page.keyboard.press('Escape').catch(() => undefined)
      return
    }
  }

  await captureAppShot(page, 'sku-show-instant-model')
}

export async function runLlmSkuTemplate (page: Page): Promise<void> {
  console.log('Scenario: llm-sku-template (推理模板)')

  // 1) list — viewport includes left L2 menu
  await page.goto('/llm-sku', { waitUntil: 'domcontentloaded' })
  await waitForListReady(page)
  await captureAppShot(page, 'sku-list')

  // 2) create page
  await page.goto('/llm-sku/create', { waitUntil: 'domcontentloaded' })
  await waitForSkuForm(page)
  await captureAppShot(page, 'sku-create')

  // 3) mounted model field on create form (still with left nav)
  await captureMountedModelField(page, 'sku-instant-model')

  // 4) back to list → edit existing template
  await page.goto('/llm-sku', { waitUntil: 'domcontentloaded' })
  await waitForListReady(page)

  const edited = await openEditDialog(page)
  if (edited) {
    await waitForAppShell(page)
    // Dialog open on top of shell — capture full viewport so left nav remains
    await captureShot(page, 'sku-update')
    await page.keyboard.press('Escape').catch(() => undefined)
    await settle(page, 300)
  } else {
    console.warn('  ⚠ no editable template found; capturing create form as sku-update fallback')
    await page.goto('/llm-sku/create', { waitUntil: 'domcontentloaded' })
    await waitForSkuForm(page)
    await captureAppShot(page, 'sku-update')
    await page.goto('/llm-sku', { waitUntil: 'domcontentloaded' })
    await waitForListReady(page)
  }

  // 5) show mounted models on list/detail
  await page.goto('/llm-sku', { waitUntil: 'domcontentloaded' })
  await waitForListReady(page)
  await captureShowMountedModels(page)
}

export default runLlmSkuTemplate
