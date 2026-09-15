import fs from 'node:fs'
import path from 'node:path'
import type { Browser, BrowserContext, Page } from 'playwright'
import { browserContextOptions } from '../playwright.config.ts'
import { AUTH_STATE_PATH, type ScreenshotEnv } from './env.ts'
import { settle } from './shot.ts'

async function isLoggedIn (page: Page): Promise<boolean> {
  const url = page.url()
  if (url.includes('/auth/login')) return false
  // Navbar user area or dashboard shell
  const shell = page.locator('.navbar, .sidebar, .ant-layout-sider, [class*="Navbar"]').first()
  try {
    await shell.waitFor({ state: 'visible', timeout: 5_000 })
    return true
  } catch {
    return !page.url().includes('/auth/login')
  }
}

async function captchaVisible (page: Page): Promise<boolean> {
  const captcha = page.locator('.captcha-form-item, img[src*="captcha"], input[placeholder*="验证码"]')
  return captcha.first().isVisible().catch(() => false)
}

/** UI form login (preferred when no captcha). */
export async function loginViaUi (page: Page, env: ScreenshotEnv): Promise<void> {
  await page.goto('/auth/login', { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle').catch(() => undefined)

  // Switch to account mode if mobile tab is default
  const accountTab = page.locator('a.login-mode', { hasText: /账号|账户|登录|Account|Login/i }).first()
  if (await accountTab.isVisible().catch(() => false)) {
    await accountTab.click()
    await settle(page, 200)
  }

  // Historical user chooser → pick "其他账号" / show username input
  const otherAccount = page.getByText(/其他账号|使用其他|Other account/i).first()
  if (await otherAccount.isVisible().catch(() => false)) {
    await otherAccount.click()
    await settle(page, 200)
  }

  const username = page.locator('input[placeholder*="用户名"], input[placeholder*="Username"], .ant-form-item input').first()
  await username.waitFor({ state: 'visible', timeout: 30_000 })
  await username.fill(env.username)

  const password = page.locator('input[type="password"]').first()
  await password.fill(env.password)

  if (env.domain) {
    const domainSelect = page.locator('.ant-select').filter({ hasText: /域|Domain/i }).first()
    if (await domainSelect.isVisible().catch(() => false)) {
      await domainSelect.click()
      await page.locator('.ant-select-dropdown:visible .ant-select-item-option', { hasText: env.domain }).click()
    } else {
      // Domain may appear only after 409; also try typing into select search
      const domainInput = page.locator('input[placeholder*="域"], input[placeholder*="Domain"]').first()
      if (await domainInput.isVisible().catch(() => false)) {
        await domainInput.fill(env.domain)
      }
    }
  }

  if (await captchaVisible(page)) {
    throw new Error('CAPTCHA_REQUIRED')
  }

  await page.locator('button[type="submit"], button.ant-btn-primary').filter({ hasText: /登录|Login|Sign/i }).first().click()

  await page.waitForURL(url => !url.pathname.includes('/auth/login'), { timeout: 60_000 })
  await page.waitForLoadState('networkidle').catch(() => undefined)
  await settle(page, 800)
}

/**
 * apigateway stores captcha in a gorilla session cookie named "captcha".
 * Once that cookie exists, login requires a matching 4-digit code.
 * With no captcha session, the backend skips captcha validation
 * (see cloudpods-ee captcha.ValidateCaptcha).
 */
async function clearCaptchaSession (page: Page): Promise<void> {
  // Drop all cookies before API login — visiting /auth/login plants captcha
  // session; leftover cookies cause "wrong captcha length!".
  await page.context().clearCookies()
}

async function regionsRequireCaptcha (page: Page, env: ScreenshotEnv): Promise<boolean> {
  try {
    const response = await page.request.get(`${env.baseURL}/api/v1/auth/regions`, {
      failOnStatusCode: false,
    })
    if (!response.ok()) return false
    const data = await response.json()
    // dashboard stores this as state.auth.regions.captcha
    return data?.captcha === true || data?.data?.captcha === true
  } catch {
    return false
  }
}

/**
 * API login fallback (bypasses captcha UI).
 * Password is Base64-encoded like dashboard LoginChallenge.vue (default path).
 *
 * Important: clear captcha session cookies first. Visiting /auth/login fetches
 * /v1/auth/captcha and plants a session; login without a 4-digit code then fails
 * with "wrong captcha length!". With no captcha session, the backend skips checks.
 */
export async function loginViaApi (page: Page, env: ScreenshotEnv): Promise<void> {
  await clearCaptchaSession(page)

  const password = Buffer.from(env.password, 'utf8').toString('base64')
  const payload: Record<string, string> = {
    username: env.username,
    password,
  }
  if (env.domain) payload.domain = env.domain

  const response = await page.request.post(`${env.baseURL}/api/v1/auth/login`, {
    data: payload,
    failOnStatusCode: false,
  })

  if (!response.ok()) {
    const body = await response.text().catch(() => '')
    throw new Error(`API login failed (${response.status()}): ${body.slice(0, 300)}`)
  }

  await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
  await page.waitForURL(url => !url.pathname.includes('/auth/login'), { timeout: 60_000 })
  await page.waitForLoadState('networkidle').catch(() => undefined)
  await settle(page, 800)

  if (!(await isLoggedIn(page))) {
    throw new Error('API login succeeded but dashboard still redirects to login')
  }
}

export async function ensureLoggedIn (page: Page, env: ScreenshotEnv): Promise<void> {
  await page.goto('/dashboard', { waitUntil: 'domcontentloaded' }).catch(() => undefined)
  if (await isLoggedIn(page)) return

  const mode = env.loginMode
  if (mode === 'api') {
    await loginViaApi(page, env)
    return
  }

  if (mode === 'ui') {
    await loginViaUi(page, env)
    return
  }

  // auto: if regions report captcha, skip UI form (it plants captcha session)
  if (await regionsRequireCaptcha(page, env)) {
    console.log('  captcha enabled on server → API login (clear captcha session)')
    await loginViaApi(page, env)
    return
  }

  try {
    await loginViaUi(page, env)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('CAPTCHA_REQUIRED')) {
      console.log('  captcha detected → API login (clear captcha session)')
      await loginViaApi(page, env)
      return
    }
    console.log(`  UI login failed (${msg}) → trying API login`)
    await loginViaApi(page, env)
  }
}

export async function createAuthedContext (
  browser: Browser,
  env: ScreenshotEnv,
  forceRelogin = false,
): Promise<BrowserContext> {
  fs.mkdirSync(path.dirname(AUTH_STATE_PATH), { recursive: true })

  if (!forceRelogin && fs.existsSync(AUTH_STATE_PATH)) {
    const context = await browser.newContext({
      ...browserContextOptions(env.baseURL),
      storageState: AUTH_STATE_PATH,
    })
    const page = await context.newPage()
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
    if (await isLoggedIn(page)) {
      await page.close()
      return context
    }
    await context.close()
    console.log('  stored auth expired → re-login')
  }

  const context = await browser.newContext(browserContextOptions(env.baseURL))
  const page = await context.newPage()
  await ensureLoggedIn(page, env)
  await context.storageState({ path: AUTH_STATE_PATH })
  await page.close()
  return context
}
