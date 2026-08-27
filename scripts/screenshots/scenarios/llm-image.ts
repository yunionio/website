import type { Page } from 'playwright'
import { captureAppShot, captureShot, settle, waitForAppShell } from '../src/shot.ts'

export async function runLlmImage (page: Page): Promise<void> {
  console.log('Scenario: llm-image (推理镜像)')

  await page.goto('/llm-image', { waitUntil: 'domcontentloaded' })
  await page.locator('.page-list, .ant-table, .ant-spin, .ant-empty').first()
    .waitFor({ state: 'attached', timeout: 60_000 })
  await page.waitForLoadState('networkidle').catch(() => undefined)
  await settle(page, 500)
  await captureAppShot(page, 'image-list')

  const createBtn = page.getByRole('button', { name: /新建|创建|Create/i }).first()
  if (await createBtn.isVisible().catch(() => false)) {
    await createBtn.click()
    const dialog = page.locator('.ant-modal:visible').first()
    if (await dialog.isVisible({ timeout: 15_000 }).catch(() => false)) {
      await settle(page, 400)
      await waitForAppShell(page)
      await captureShot(page, 'image-create')
      await page.keyboard.press('Escape').catch(() => undefined)
      return
    }
  }

  console.warn('  ⚠ create dialog not opened; capturing list as image-create fallback')
  await captureAppShot(page, 'image-create')
}

export default runLlmImage
