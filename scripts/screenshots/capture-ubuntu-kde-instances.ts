import { chromium } from 'playwright'
import { browserDefaults } from './playwright.config.ts'
import { loadEnv } from './src/env.ts'
import { createAuthedContext } from './src/auth.ts'
import {
  captureAppShot,
  captureShot,
  dismissTopAlert,
  settle,
} from './src/shot.ts'

const APP = process.env.SCREENSHOT_DESKTOP_APP || 'ubuntu-kde'

async function main (): Promise<void> {
  const env = loadEnv()
  const browser = await chromium.launch({ headless: browserDefaults.headless })
  try {
    const ctx = await createAuthedContext(browser, env)
    const page = await ctx.newPage()
    page.setDefaultTimeout(60_000)

    // List LLMs and pick running ubuntu-kde
    const res = await page.request.get('/api/v2/llms?limit=50&details=true&llm_type=desktop')
    const data = await res.json()
    const list = (data.data || data || []) as Array<Record<string, unknown>>
    console.log('instances:', list.map(i => `${i.name} status=${i.status} app=${i.app_name}`).join('\n'))

    const running = list.find(i =>
      i.status === 'running' &&
      (String(i.app_name || '').includes(APP) || String(i.name || '').includes(APP)),
    ) || list.find(i => i.status === 'running' && String(i.name || '').includes(APP))

    if (!running) {
      throw new Error(`No running ${APP} instance found`)
    }
    const llmId = String(running.id)
    const name = String(running.name)
    console.log(`using ${name} (${llmId})`)

    // --- instance list (clean list without create_fail preferred) ---
    await page.goto('/app-desktop', { waitUntil: 'domcontentloaded' })
    await page.locator('.page-list, .ant-table, .ant-spin, .ant-empty').first()
      .waitFor({ state: 'attached', timeout: 60_000 })
    await settle(page, 1000)
    await dismissTopAlert(page)

    // Search by name to hide unrelated/failed rows if search works
    const search = page.locator('input[placeholder*="搜索"], input[placeholder*="名称"]').first()
    if (await search.isVisible().catch(() => false)) {
      await search.fill(APP)
      await search.press('Enter')
      await settle(page, 1200)
      await page.waitForLoadState('networkidle').catch(() => undefined)
      await settle(page, 500)
    }
    await captureAppShot(page, 'desktop-instance-list')

    // Clear search for create page navigation cleanliness
    if (await search.isVisible().catch(() => false)) {
      await search.fill('')
      await search.press('Enter').catch(() => undefined)
      await settle(page, 400)
    }

    // --- create form with ubuntu-kde selected ---
    await page.goto('/app-desktop/create', { waitUntil: 'domcontentloaded' })
    await page.locator('form, .ant-form').first().waitFor({ state: 'visible', timeout: 60_000 })
    await settle(page, 800)
    await dismissTopAlert(page)
    const placeholder = page.getByText('请选择桌面模板').first()
    if (await placeholder.isVisible().catch(() => false)) {
      await placeholder.click()
      await settle(page, 400)
      const opt = page.locator('.ant-select-dropdown:visible').getByText(new RegExp(APP, 'i')).first()
      if (await opt.isVisible().catch(() => false)) await opt.click()
      await settle(page, 300)
    }
    await captureAppShot(page, 'desktop-instance-create')

    // --- detail ---
    await page.goto('/app-desktop', { waitUntil: 'domcontentloaded' })
    await settle(page, 1000)
    await dismissTopAlert(page)
    if (await search.isVisible().catch(() => false)) {
      await search.fill(name)
      await search.press('Enter')
      await settle(page, 1000)
    }
    const nameCell = page.getByText(name, { exact: true }).first()
    await nameCell.waitFor({ state: 'visible', timeout: 20_000 })
    await nameCell.click()
    await page.locator('.ant-drawer:visible, .side-page:visible').first()
      .waitFor({ state: 'visible', timeout: 15_000 })
    await settle(page, 1200)
    await captureAppShot(page, 'desktop-instance-detail')

    // --- login page ---
    const loginRes = await page.request.get(`/api/v2/llms/${llmId}/login-info`)
    if (!loginRes.ok()) {
      throw new Error(`login-info failed: ${loginRes.status()} ${await loginRes.text()}`)
    }
    const login = await loginRes.json() as { login_url?: string, username?: string, password?: string }
    if (!login.login_url) throw new Error('empty login_url')
    console.log('login_url', login.login_url)

    let target = login.login_url
    if (login.username && login.password) {
      try {
        const u = new URL(login.login_url)
        u.username = login.username
        u.password = login.password
        target = u.toString()
      } catch { /* keep */ }
    }

    const loginPage = await ctx.newPage()
    loginPage.setDefaultTimeout(120_000)
    try {
      await loginPage.goto(target, { waitUntil: 'domcontentloaded', timeout: 120_000 })
      await loginPage.waitForLoadState('networkidle').catch(() => undefined)
      await loginPage.locator('body').waitFor({ state: 'visible', timeout: 60_000 })
      await settle(loginPage, 5000)
      await captureShot(loginPage, 'desktop-instance-login')
    } finally {
      await loginPage.close().catch(() => undefined)
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
