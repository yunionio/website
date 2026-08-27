import type { Page } from 'playwright'
import { captureAppShot, captureShot, settle, waitForAppShell } from '../src/shot.ts'

async function waitPageList (page: Page): Promise<void> {
  await page.locator('.page-list, .ant-table, .ant-spin, .ant-empty').first()
    .waitFor({ state: 'attached', timeout: 60_000 })
  await page.waitForLoadState('networkidle').catch(() => undefined)
  await settle(page, 500)
}

export async function runLlmDeployment (page: Page): Promise<void> {
  console.log('Scenario: llm-deployment (推理部署)')

  await page.goto('/llm-deployment', { waitUntil: 'domcontentloaded' })
  await waitPageList(page)
  await captureAppShot(page, 'deployment-list')

  await page.goto('/llm-deployment/create', { waitUntil: 'domcontentloaded' })
  await page.locator('form, .ant-form, .page-body').first().waitFor({ state: 'visible', timeout: 60_000 })
  await page.waitForLoadState('networkidle').catch(() => undefined)
  await captureAppShot(page, 'deployment-create')

  await page.goto('/llm-deployment', { waitUntil: 'domcontentloaded' })
  await waitPageList(page)

  // Open first row sidepage for detail shot (VXE table or ant-table)
  const row = page.locator('.vxe-body--row, .ant-table-row, .ant-table-tbody tr').filter({ hasNot: page.locator('.ant-table-placeholder') }).first()
  const nameLink = page.locator('.vxe-body--row a, .ant-table-row a').filter({ hasText: /\S/ }).first()
  const clickTarget = (await nameLink.isVisible().catch(() => false)) ? nameLink : row
  if (await clickTarget.isVisible().catch(() => false)) {
    await clickTarget.click()
    const side = page.locator('.ant-drawer:visible, .side-page:visible, [class*="side-page"]').first()
    if (await side.isVisible({ timeout: 15_000 }).catch(() => false)) {
      await settle(page, 600)
      await waitForAppShell(page)
      await captureShot(page, 'deployment-detail')
      await page.keyboard.press('Escape').catch(() => undefined)
    } else {
      console.warn('  ⚠ sidepage not opened; capturing list as deployment-detail fallback')
      await captureAppShot(page, 'deployment-detail')
    }
  } else {
    console.warn('  ⚠ no deployment row; capturing list as deployment-detail fallback')
    await captureAppShot(page, 'deployment-detail')
  }
}

export default runLlmDeployment
