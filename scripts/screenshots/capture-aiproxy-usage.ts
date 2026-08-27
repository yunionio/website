/**
 * Capture AI gateway usage overview + analysis screenshots (past 7 days).
 * Usage: yarn exec tsx capture-aiproxy-usage.ts
 */
import { chromium } from 'playwright'
import { browserDefaults } from './playwright.config.ts'
import { loadEnv } from './src/env.ts'
import { createAuthedContext } from './src/auth.ts'
import { captureAppShot, dismissTopAlert, settle } from './src/shot.ts'

async function selectPast7Days (page: import('playwright').Page): Promise<void> {
  const btn = page.getByRole('button', { name: /过去7天|近\s*7\s*天/ }).first()
  if (await btn.isVisible().catch(() => false)) {
    await btn.click()
  } else {
    await page.getByText('过去7天', { exact: true }).first().click()
  }
  await settle(page, 800)
  await page.waitForLoadState('networkidle').catch(() => undefined)
  // Wait for in-page loading toast / spinners to settle
  await page.getByText('数据加载中').first()
    .waitFor({ state: 'hidden', timeout: 60_000 })
    .catch(() => undefined)
  await page.locator('.ant-spin-spinning').first()
    .waitFor({ state: 'hidden', timeout: 60_000 })
    .catch(() => undefined)
  await settle(page, 1500)
}

async function main (): Promise<void> {
  const env = loadEnv()
  const browser = await chromium.launch({ headless: browserDefaults.headless })
  try {
    const ctx = await createAuthedContext(browser, env)
    const page = await ctx.newPage()
    page.setDefaultTimeout(60_000)

    await page.goto('/ai-proxy-usage', { waitUntil: 'domcontentloaded' })
    await page.locator('.aiproxy-usage-page, .page-body').first()
      .waitFor({ state: 'attached', timeout: 60_000 })
    await page.waitForLoadState('networkidle').catch(() => undefined)
    await settle(page, 1000)
    await dismissTopAlert(page)

    await selectPast7Days(page)

    // Overview: keep page scrolled near top so range + API Key 用量 are visible
    await page.evaluate(() => window.scrollTo(0, 0)).catch(() => undefined)
    await settle(page, 300)
    const apiKeyUsage = page.getByText('API Key 用量').first()
    if (await apiKeyUsage.isVisible().catch(() => false)) {
      await apiKeyUsage.scrollIntoViewIfNeeded().catch(() => undefined)
      await settle(page, 400)
      // scroll back a bit so time range chips stay in viewport if possible
      await page.evaluate(() => window.scrollBy(0, -120)).catch(() => undefined)
      await settle(page, 200)
    }
    await captureAppShot(page, 'aiproxy-usage-overview')

    // Analysis tab
    const analysisTab = page.locator('.ant-tabs-tab, [role="tab"], .page-header .ant-radio-button-wrapper')
      .filter({ hasText: /^分析$/ })
      .first()
    if (await analysisTab.isVisible().catch(() => false)) {
      await analysisTab.click()
    } else {
      await page.getByText('分析', { exact: true }).first().click()
    }
    await settle(page, 1500)
    await page.waitForLoadState('networkidle').catch(() => undefined)
    // re-assert range in case tab switch resets (unlikely)
    await selectPast7Days(page)

    const composition = page.getByText(/API Key 构成|构成分析/).first()
    if (await composition.isVisible().catch(() => false)) {
      await composition.scrollIntoViewIfNeeded().catch(() => undefined)
      await settle(page, 400)
      await page.evaluate(() => window.scrollBy(0, -80)).catch(() => undefined)
      await settle(page, 200)
    }
    await captureAppShot(page, 'aiproxy-usage-analysis')

    // Events / 请求明细 tab
    const eventsTab = page.locator('.ant-tabs-tab, [role="tab"], .page-header .ant-radio-button-wrapper')
      .filter({ hasText: /^请求明细$/ })
      .first()
    if (await eventsTab.isVisible().catch(() => false)) {
      await eventsTab.click()
    } else {
      await page.getByText('请求明细', { exact: true }).first().click()
    }
    await settle(page, 1500)
    await page.waitForLoadState('networkidle').catch(() => undefined)
    await selectPast7Days(page)
    await page.locator('.ant-table, .vxe-table, .page-list').first()
      .waitFor({ state: 'attached', timeout: 30_000 })
      .catch(() => undefined)
    await page.getByText('数据加载中').first()
      .waitFor({ state: 'hidden', timeout: 60_000 })
      .catch(() => undefined)
    await settle(page, 1500)
    await page.evaluate(() => window.scrollTo(0, 0)).catch(() => undefined)
    await settle(page, 300)
    await captureAppShot(page, 'aiproxy-usage-events')

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
