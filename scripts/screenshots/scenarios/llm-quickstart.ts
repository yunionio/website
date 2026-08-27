import type { Page } from 'playwright'
import {
  captureAppShot,
  captureShot,
  settle,
  waitForAppShell,
  waitForListReady,
} from '../src/shot.ts'

const MS_QUERY = process.env.SCREENSHOT_MS_QUERY || 'Qwen/Qwen3.5-4B'

async function waitPageReady (page: Page): Promise<void> {
  await page.locator('.page-list, .page-body, .ant-table, .ant-spin, .ant-empty, .hf-pane').first()
    .waitFor({ state: 'attached', timeout: 60_000 })
  await page.waitForLoadState('networkidle').catch(() => undefined)
  await settle(page, 500)
}

async function warnSkip (shotId: string, reason: string): Promise<void> {
  console.warn(`  ⚠ skip ${shotId}: ${reason}`)
}

async function openImportModelDropdown (page: Page): Promise<boolean> {
  const importBtn = page
    .locator('button, .ant-btn, a')
    .filter({ hasText: /导入模型|Import model/i })
    .first()
  if (!(await importBtn.isVisible().catch(() => false))) return false
  await importBtn.click()
  await settle(page, 400)
  const menu = page.locator('.ant-dropdown:visible, .ant-dropdown-menu:visible').first()
  return menu.isVisible({ timeout: 5_000 }).catch(() => false)
}

async function captureModelscopeImportEntry (page: Page): Promise<void> {
  await page.goto('/llm-sku', { waitUntil: 'domcontentloaded' })
  await waitForListReady(page)
  if (!(await openImportModelDropdown(page))) {
    await warnSkip('modelscope-import-entry', 'import model dropdown not found')
    return
  }
  await captureAppShot(page, 'modelscope-import-entry')
  await page.keyboard.press('Escape').catch(() => undefined)
}

async function captureModelscopeSearchAndDrawer (page: Page): Promise<void> {
  await page.goto('/llm-sku/import-from-modelscope', { waitUntil: 'domcontentloaded' })
  await waitPageReady(page)

  const searchInput = page.locator('.hf-pane input, input[placeholder*="搜索"], input[placeholder*="Search"], input[placeholder*="Model"]').first()
  if (await searchInput.isVisible().catch(() => false)) {
    await searchInput.fill(MS_QUERY)
    const searchBtn = page.locator('button, .ant-btn').filter({ hasText: /搜索|Search/i }).first()
    if (await searchBtn.isVisible().catch(() => false)) {
      await searchBtn.click()
    } else {
      await searchInput.press('Enter')
    }
    await page.waitForLoadState('networkidle').catch(() => undefined)
    await settle(page, 1200)
  }

  await captureAppShot(page, 'modelscope-search')

  const importOnCard = page
    .locator('.hf-result-card button, .hf-result-actions button')
    .filter({ hasText: /导入模型|Import/i })
    .first()
  const firstCard = page.locator('.hf-result-card').first()

  if (await importOnCard.isVisible().catch(() => false)) {
    await importOnCard.click()
  } else if (await firstCard.isVisible().catch(() => false)) {
    await firstCard.click()
    await settle(page, 300)
    const openBtn = page.locator('.hf-result-card-selected button, .hf-result-actions button').filter({ hasText: /导入模型|Import/i }).first()
    if (await openBtn.isVisible().catch(() => false)) {
      await openBtn.click()
    } else {
      await warnSkip('modelscope-select-vllm-image', 'no import button on result card')
      await warnSkip('modelscope-select-hami-gpu', 'drawer not opened')
      return
    }
  } else {
    await warnSkip('modelscope-select-vllm-image', 'no ModelScope search results')
    await warnSkip('modelscope-select-hami-gpu', 'no ModelScope search results')
    return
  }

  const drawer = page.locator('.ant-drawer:visible, .catalog-drawer-wrap .ant-drawer-content-wrapper').first()
  if (!(await drawer.isVisible({ timeout: 20_000 }).catch(() => false))) {
    await warnSkip('modelscope-select-vllm-image', 'config drawer not visible')
    await warnSkip('modelscope-select-hami-gpu', 'config drawer not visible')
    return
  }
  await settle(page, 800)

  // Prefer vLLM radio if present
  const vllm = page.locator('.ant-drawer:visible').locator('label, .ant-radio-button-wrapper').filter({ hasText: /^vLLM$/ }).first()
  if (await vllm.isVisible().catch(() => false)) {
    await vllm.click().catch(() => undefined)
    await settle(page, 500)
  }

  const scrollDrawer = async (text: RegExp) => {
    const item = page.locator('.ant-drawer:visible .ant-form-item, .ant-drawer:visible').filter({ hasText: text }).first()
    if (await item.isVisible().catch(() => false)) {
      await item.scrollIntoViewIfNeeded().catch(() => undefined)
      await settle(page, 300)
      return true
    }
    return false
  }

  // Image / community image area
  const hasImage = await scrollDrawer(/镜像|Image|社区/)
  if (!hasImage) {
    await page.locator('.ant-drawer:visible .catalog-drawer-scroll, .ant-drawer-body').first()
      .evaluate(el => { el.scrollTop = 200 })
      .catch(() => undefined)
  }
  await settle(page, 400)
  await captureAppShot(page, 'modelscope-select-vllm-image')

  // GPU / HAMI — scroll drawer until GPU editor is visible
  const drawerScroll = page.locator('.ant-drawer:visible .catalog-drawer-scroll, .ant-drawer:visible .ant-drawer-body').first()
  const gpuEditor = page.locator('.ant-drawer:visible .llm-gpu-devices-editor').first()
  if (await drawerScroll.isVisible().catch(() => false)) {
    for (let i = 0; i < 8; i++) {
      if (await gpuEditor.isVisible().catch(() => false)) break
      await drawerScroll.evaluate(el => { el.scrollTop += 280 })
      await settle(page, 150)
    }
  }
  if (await gpuEditor.isVisible().catch(() => false)) {
    await gpuEditor.scrollIntoViewIfNeeded().catch(() => undefined)
    await settle(page, 300)
    // Open model select to show HAMI options when available
    const modelSelect = gpuEditor.locator('.llm-gpu-devices-editor__model .ant-select, .ant-select').first()
    if (await modelSelect.isVisible().catch(() => false)) {
      await modelSelect.click().catch(() => undefined)
      await settle(page, 600)
    }
  } else if (await drawerScroll.isVisible().catch(() => false)) {
    await drawerScroll.evaluate(el => { el.scrollTop = el.scrollHeight })
    await settle(page, 400)
  }
  await captureAppShot(page, 'modelscope-select-hami-gpu')

  await page.keyboard.press('Escape').catch(() => undefined)
}

async function captureSkuReadyDeploy (page: Page): Promise<void> {
  await page.goto('/llm-sku', { waitUntil: 'domcontentloaded' })
  await waitForListReady(page)

  const deploy = page
    .locator('.catalog-card-actions, .catalog-card-footer, .catalog-card')
    .locator('a, button, .ant-btn')
    .filter({ hasText: /^部署$|^Deploy$/i })
    .first()

  if (await deploy.isVisible().catch(() => false)) {
    await deploy.scrollIntoViewIfNeeded().catch(() => undefined)
    await settle(page, 300)
    await captureAppShot(page, 'sku-ready-deploy')
    return
  }

  // Fallback: any card list state is still useful
  await warnSkip('sku-ready-deploy', 'no Deploy action on cards; capturing list fallback')
  await captureAppShot(page, 'sku-ready-deploy')
}

async function captureDeploymentCreateAndReady (page: Page): Promise<void> {
  await page.goto('/llm-deployment/create', { waitUntil: 'domcontentloaded' })
  await page.locator('form, .ant-form, .page-body').first().waitFor({ state: 'visible', timeout: 60_000 })
  await page.waitForLoadState('networkidle').catch(() => undefined)
  await captureAppShot(page, 'deployment-create')

  await page.goto('/llm-deployment', { waitUntil: 'domcontentloaded' })
  await waitPageReady(page)
  const nameLink = page.locator('.vxe-body--row .list-body-cell-wrap a, .vxe-body--row a').first()
  await nameLink.waitFor({ state: 'visible', timeout: 60_000 }).catch(() => undefined)
  await settle(page, 800)

  if (!(await nameLink.isVisible().catch(() => false))) {
    await warnSkip('deployment-ready', 'no deployment row')
    await warnSkip('deployment-chat-test', 'no deployment row')
    await warnSkip('deployment-aiproxy-access', 'no deployment row')
    return
  }

  await nameLink.click()
  let side = page.locator('.side-page-root .side-page-header-tabs, .side-page-header-tabs').first()
  if (!(await side.isVisible({ timeout: 8_000 }).catch(() => false))) {
    // Retry with plain text click (same as manual probe)
    await page.locator('.vxe-body--row').getByText(/test-vllm|\w+/).first().click({ force: true }).catch(() => undefined)
    side = page.locator('.side-page-header-tabs').first()
  }
  if (!(await side.isVisible({ timeout: 10_000 }).catch(() => false))) {
    await warnSkip('deployment-ready', 'sidepage not opened')
    await warnSkip('deployment-chat-test', 'sidepage not opened')
    await warnSkip('deployment-aiproxy-access', 'sidepage not opened')
    await captureAppShot(page, 'deployment-ready')
    return
  }
  await settle(page, 800)
  await waitForAppShell(page)
  await captureShot(page, 'deployment-ready')

  await clickSideTab(page, /AI\s*网关接入/)
  await settle(page, 1000)
  await captureShot(page, 'deployment-aiproxy-access')

  await clickSideTab(page, /chat测试|chat\s*测试/)
  await settle(page, 1000)
  await captureShot(page, 'deployment-chat-test')

  // Close sidepage
  const closeBtn = page.locator('.side-page-close, .side-page-close-inner').first()
  if (await closeBtn.isVisible().catch(() => false)) {
    await closeBtn.click().catch(() => undefined)
  } else {
    await page.keyboard.press('Escape').catch(() => undefined)
  }
  await settle(page, 300)
}

async function clickSideTab (page: Page, label: RegExp): Promise<void> {
  const tab = page
    .locator('.side-page-header-tabs .ant-tabs-tab, .side-page-root .ant-tabs-tab, .ant-tabs-tab')
    .filter({ hasText: label })
    .first()
  if (await tab.isVisible().catch(() => false)) {
    await tab.click()
    return
  }
  console.warn(`  ⚠ side tab not found: ${label}`)
}

async function captureApiKeyCreate (page: Page): Promise<void> {
  await page.goto('/ai-virtual-key/create', { waitUntil: 'domcontentloaded' })
  await page.locator('form, .ant-form, .page-body').first().waitFor({ state: 'visible', timeout: 60_000 }).catch(() => undefined)
  await page.waitForLoadState('networkidle').catch(() => undefined)
  await settle(page, 500)
  await captureAppShot(page, 'aiproxy-create-api-key')
}

/** Open instance web console and run nvidia-smi to verify HAMI memory limit. */
async function captureHamiVerifyNvidiaSmi (page: Page): Promise<void> {
  await page.goto('/llm-deployment', { waitUntil: 'domcontentloaded' })
  await waitPageReady(page)
  const nameLink = page.locator('.vxe-body--row .list-body-cell-wrap a, .vxe-body--row a').first()
  await nameLink.waitFor({ state: 'visible', timeout: 60_000 }).catch(() => undefined)
  if (!(await nameLink.isVisible().catch(() => false))) {
    await warnSkip('hami-verify-nvidia-smi', 'no deployment row')
    return
  }
  await nameLink.click()
  const tabs = page.locator('.side-page-header-tabs').first()
  if (!(await tabs.isVisible({ timeout: 15_000 }).catch(() => false))) {
    await warnSkip('hami-verify-nvidia-smi', 'sidepage not opened')
    return
  }
  await clickSideTab(page, /实例/)
  await settle(page, 1500)

  const instLink = page.locator('.side-page-root .vxe-body--row a, .side-page-root .list-body-cell-wrap a').first()
  if (!(await instLink.isVisible({ timeout: 15_000 }).catch(() => false))) {
    await warnSkip('hami-verify-nvidia-smi', 'no instance row')
    return
  }
  await instLink.click()
  await settle(page, 1200)

  const terminalBtn = page.locator('.side-page-root, .second-side-page').getByText(/^终端$/).first()
  if (!(await terminalBtn.isVisible({ timeout: 10_000 }).catch(() => false))) {
    await warnSkip('hami-verify-nvidia-smi', 'terminal action not found')
    return
  }

  const popupPromise = page.context().waitForEvent('page', { timeout: 25_000 }).catch(() => null)
  await terminalBtn.click()
  const containerItem = page.locator('.ant-dropdown:visible .ant-dropdown-menu-item, .ant-dropdown:visible li').first()
  if (await containerItem.isVisible({ timeout: 4_000 }).catch(() => false)) {
    await containerItem.click()
  }

  const popup = await popupPromise
  const consolePage = popup || page
  if (popup) {
    await popup.waitForLoadState('domcontentloaded').catch(() => undefined)
  }
  await settle(consolePage, 3500)

  const term = consolePage.locator('.xterm-helper-textarea, .xterm, textarea').first()
  if (await term.isVisible({ timeout: 20_000 }).catch(() => false)) {
    await term.click({ force: true }).catch(() => undefined)
  }
  await consolePage.keyboard.type('nvidia-smi', { delay: 40 })
  await consolePage.keyboard.press('Enter')
  await settle(consolePage, 3500)
  await captureShot(consolePage, 'hami-verify-nvidia-smi')
  if (popup) await popup.close().catch(() => undefined)
}

export async function runLlmQuickstart (page: Page): Promise<void> {
  console.log('Scenario: llm-quickstart (推理快速开始截图)')

  // Capture deployment sidepage first (needs list row); avoid later navigation flakiness
  await captureDeploymentCreateAndReady(page)
  await captureHamiVerifyNvidiaSmi(page)
  await captureApiKeyCreate(page)
  await captureModelscopeImportEntry(page)
  await captureModelscopeSearchAndDrawer(page)
  await captureSkuReadyDeploy(page)
}

export default runLlmQuickstart
