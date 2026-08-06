import { chromium } from 'playwright'
import { browserDefaults, browserContextOptions } from './playwright.config.ts'
import { loadEnv } from './src/env.ts'
import { createAuthedContext } from './src/auth.ts'
import { captureAppShot, captureShot, dismissTopAlert, settle } from './src/shot.ts'

async function captureLogin (): Promise<void> {
  const browser = await chromium.launch({ headless: browserDefaults.headless })
  try {
    const ctx = await browser.newContext({
      viewport: { ...browserDefaults.viewport },
      deviceScaleFactor: browserDefaults.deviceScaleFactor,
      ignoreHTTPSErrors: true,
      locale: 'zh-CN',
    })
    const page = await ctx.newPage()
    page.setDefaultTimeout(60_000)
    await page.goto('https://127.0.0.1:13001/', { waitUntil: 'domcontentloaded', timeout: 60_000 })
    await settle(page, 8000)
    await captureShot(page, 'desktop-instance-login')
    await ctx.close()
  } finally {
    await browser.close()
  }
}

async function captureDetail (): Promise<void> {
  const env = loadEnv()
  const browser = await chromium.launch({ headless: browserDefaults.headless })
  try {
    const ctx = await createAuthedContext(browser, env)
    const page = await ctx.newPage()
    page.setDefaultTimeout(60_000)
    await page.goto('/app-desktop', { waitUntil: 'domcontentloaded' })
    await settle(page, 1000)
    await dismissTopAlert(page)
    const row = page.locator('.ant-table-tbody tr').filter({ hasText: /ubuntu-kde/i }).first()
    if (!(await row.isVisible().catch(() => false))) {
      console.warn('no ubuntu-kde instance row')
      return
    }
    const link = row.locator('a').first()
    if (await link.isVisible().catch(() => false)) await link.click()
    else await row.click()
    await page.locator('.ant-drawer:visible, .side-page:visible').first().waitFor({ state: 'visible', timeout: 15_000 })
    await settle(page, 1200)
    await captureAppShot(page, 'desktop-instance-detail')
    await ctx.close()
  } finally {
    await browser.close()
  }
}

async function main (): Promise<void> {
  await captureLogin()
  await captureDetail()
  console.log('ok')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
