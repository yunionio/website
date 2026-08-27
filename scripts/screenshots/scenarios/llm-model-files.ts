import type { Page } from 'playwright'
import { captureAppShot, settle } from '../src/shot.ts'

export async function runLlmModelFiles (page: Page): Promise<void> {
  console.log('Scenario: llm-model-files (模型文件)')

  await page.goto('/llm-instantmodel', { waitUntil: 'domcontentloaded' })
  await page.locator('.page-list, .ant-table, .ant-spin, .ant-empty').first()
    .waitFor({ state: 'attached', timeout: 60_000 })
  await page.waitForLoadState('networkidle').catch(() => undefined)
  await settle(page, 500)
  await captureAppShot(page, 'model-files-list')
}

export default runLlmModelFiles
