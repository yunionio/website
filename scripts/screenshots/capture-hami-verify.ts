#!/usr/bin/env tsx
/**
 * Capture hami-verify-nvidia-smi: deployment → 实例 → instance → 终端 → nvidia-smi
 */
import { chromium } from 'playwright'
import { browserDefaults } from './playwright.config.ts'
import { loadEnv } from './src/env.ts'
import { createAuthedContext } from './src/auth.ts'
import { captureShot, settle } from './src/shot.ts'

async function main (): Promise<void> {
  const env = loadEnv()
  const browser = await chromium.launch({ headless: browserDefaults.headless })
  try {
    const context = await createAuthedContext(browser, env)
    const page = await context.newPage()
    page.setDefaultTimeout(browserDefaults.timeoutMs)

    await page.goto('/llm-deployment', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)
    await page.locator('.vxe-body--row .list-body-cell-wrap a, .vxe-body--row a').first().click()
    await page.locator('.side-page-header-tabs').first().waitFor({ state: 'visible', timeout: 20_000 })
    await page.locator('.ant-tabs-tab').filter({ hasText: /实例/ }).first().click()
    await settle(page, 1500)

    // Open instance sidepage (nested)
    const instLink = page.locator('.side-page-root .vxe-body--row a, .side-page-root .list-body-cell-wrap a').first()
    await instLink.waitFor({ state: 'visible', timeout: 20_000 })
    await instLink.click()
    await settle(page, 1500)

    const terminalBtn = page.getByText(/^终端$/, { exact: true }).first()
    // Prefer actions in the second/nested side page
    const nestedTerminal = page.locator('.second-side-page, .side-page-root').getByText(/^终端$/).first()
    const btn = (await nestedTerminal.isVisible().catch(() => false)) ? nestedTerminal : terminalBtn
    console.log('terminal visible?', await btn.isVisible().catch(() => false))

    const popupPromise = context.waitForEvent('page', { timeout: 25_000 }).catch(() => null)
    await btn.click()
    const menuItem = page.locator('.ant-dropdown:visible .ant-dropdown-menu-item, .ant-dropdown:visible li, .ant-dropdown-menu:visible li').first()
    if (await menuItem.isVisible({ timeout: 4_000 }).catch(() => false)) {
      console.log('click container menu item', await menuItem.innerText().catch(() => ''))
      await menuItem.click()
    }

    const popup = await popupPromise
    const consolePage = popup || page
    if (popup) {
      console.log('popup url', popup.url())
      await popup.waitForLoadState('domcontentloaded').catch(() => undefined)
    } else {
      console.log('no popup, url', page.url())
    }
    await settle(consolePage, 4000)

    // Focus terminal and run nvidia-smi
    const helpers = [
      consolePage.locator('.xterm-helper-textarea'),
      consolePage.locator('.xterm'),
      consolePage.locator('textarea'),
      consolePage.frameLocator('iframe').locator('.xterm-helper-textarea'),
      consolePage.frameLocator('iframe').locator('body'),
    ]
    let focused = false
    for (const loc of helpers) {
      if (await loc.first().isVisible({ timeout: 2_000 }).catch(() => false)) {
        await loc.first().click({ force: true }).catch(() => undefined)
        focused = true
        break
      }
    }
    console.log('focused term?', focused)
    await consolePage.keyboard.type('nvidia-smi', { delay: 40 })
    await consolePage.keyboard.press('Enter')
    await settle(consolePage, 3500)
    await captureShot(consolePage, 'hami-verify-nvidia-smi')
    if (popup) await popup.close().catch(() => undefined)
    console.log('done')
  } finally {
    await browser.close()
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
