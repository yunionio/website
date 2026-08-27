import type { Page } from 'playwright'
import { captureAppShot, captureShot, settle, waitForAppShell } from '../src/shot.ts'

async function waitPageList (page: Page): Promise<void> {
  await page.locator('.page-list, .ant-table, .ant-spin, .ant-empty').first()
    .waitFor({ state: 'attached', timeout: 60_000 })
  await page.waitForLoadState('networkidle').catch(() => undefined)
  await settle(page, 500)
}

export async function runLlmBenchmark (page: Page): Promise<void> {
  console.log('Scenario: llm-benchmark (基准测试)')

  await page.goto('/llm-benchmark', { waitUntil: 'domcontentloaded' })
  await waitPageList(page)
  await captureAppShot(page, 'benchmark-list')

  await page.goto('/llm-benchmark/create', { waitUntil: 'domcontentloaded' })
  await page.locator('form, .ant-form, .ant-form-model, .page-body').first()
    .waitFor({ state: 'visible', timeout: 60_000 })
  await page.waitForLoadState('networkidle').catch(() => undefined)
  await captureAppShot(page, 'benchmark-create')

  await page.goto('/llm-benchmark', { waitUntil: 'domcontentloaded' })
  await waitPageList(page)

  const row = page.locator('.ant-table-row, .ant-table-tbody tr').filter({ hasNot: page.locator('.ant-table-placeholder') }).first()
  if (await row.isVisible().catch(() => false)) {
    await row.click()
    const side = page.locator('.ant-drawer:visible, .side-page:visible, .ant-modal:visible').first()
    if (await side.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await settle(page, 500)
      await waitForAppShell(page)
      await captureShot(page, 'benchmark-detail')
      await page.keyboard.press('Escape').catch(() => undefined)
      return
    }
  }

  console.warn('  ⚠ no benchmark detail; capturing list as benchmark-detail fallback')
  await captureAppShot(page, 'benchmark-detail')
}

export default runLlmBenchmark
