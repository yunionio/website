import type { BrowserContext, Page } from 'playwright'
import {
  captureAppShot,
  captureShot,
  dismissTopAlert,
  formDialog,
  settle,
  waitForAppShell,
  waitForListReady,
  waitForSkuForm,
} from '../src/shot.ts'

const DESKTOP_APP = process.env.SCREENSHOT_DESKTOP_APP || 'ubuntu-kde'
const INSTANCE_WAIT_MS = Number(process.env.SCREENSHOT_DESKTOP_INSTANCE_WAIT_MS || 10 * 60 * 1000)

function cardByName (page: Page, name: string) {
  return page.locator('.catalog-card, .community-image-card, .ant-card').filter({ hasText: new RegExp(name, 'i') }).first()
}

async function openEditDialog (page: Page): Promise<boolean> {
  const modify = page
    .locator('.catalog-card-actions, .catalog-card-footer')
    .locator('a, button, .ant-btn')
    .filter({ hasText: /修改|编辑|Modify|Edit/i })
    .first()

  if (await modify.isVisible().catch(() => false)) {
    await modify.click()
  } else {
    const fallback = page.locator('a, button, .ant-btn').filter({ hasText: /^修改$|^编辑$/ }).first()
    if (!(await fallback.isVisible().catch(() => false))) {
      return false
    }
    await fallback.click()
  }

  const dialog = formDialog(page)
  try {
    await dialog.waitFor({ state: 'visible', timeout: 20_000 })
    await waitForSkuForm(page)
    return true
  } catch {
    return false
  }
}

async function openUbuntuKdeImportDrawer (page: Page): Promise<{ opened: boolean, imported: boolean }> {
  const card = cardByName(page, DESKTOP_APP)
  if (!(await card.isVisible({ timeout: 20_000 }).catch(() => false))) {
    console.warn(`  ⚠ community card not found: ${DESKTOP_APP}`)
    return { opened: false, imported: false }
  }
  await card.scrollIntoViewIfNeeded().catch(() => undefined)
  await card.click()
  const drawer = page.locator('.catalog-drawer-wrap .ant-drawer:visible, .ant-drawer:visible').first()
  try {
    await drawer.waitFor({ state: 'visible', timeout: 15_000 })
    await settle(page, 500)
  } catch {
    return { opened: false, imported: false }
  }

  const importedTag = drawer.locator('.ant-tag').filter({ hasText: /已导入|Imported/i }).first()
  const imported = await importedTag.isVisible().catch(() => false)
  return { opened: true, imported }
}

async function importUbuntuKdeIfNeeded (page: Page): Promise<void> {
  const { opened, imported } = await openUbuntuKdeImportDrawer(page)
  if (!opened) return
  if (imported) {
    console.log(`  · ${DESKTOP_APP} already imported`)
    await captureAppShot(page, 'desktop-sku-import-drawer')
    await page.keyboard.press('Escape').catch(() => undefined)
    return
  }

  await captureAppShot(page, 'desktop-sku-import-drawer')

  const importBtn = page.locator('.ant-drawer:visible button.ant-btn-primary, .catalog-drawer-footer button.ant-btn-primary').filter({ hasText: /导\s*入|Import/i }).first()
  if (!(await importBtn.isVisible().catch(() => false))) {
    // fallback: any primary in drawer footer
    const footerBtn = page.locator('.catalog-drawer-footer .ant-btn-primary, .ant-drawer:visible .ant-btn-primary').last()
    if (await footerBtn.isVisible().catch(() => false)) {
      await footerBtn.click()
    } else {
      console.warn('  ⚠ import button not found in drawer')
      await page.keyboard.press('Escape').catch(() => undefined)
      return
    }
  } else {
    if (await importBtn.isDisabled().catch(() => false)) {
      console.log(`  · ${DESKTOP_APP} import disabled (likely already imported)`)
      await page.keyboard.press('Escape').catch(() => undefined)
      return
    }
    await importBtn.click()
  }
  await page.waitForLoadState('networkidle').catch(() => undefined)
  // Wait for drawer close or success toast
  await page.locator('.ant-drawer:visible').first().waitFor({ state: 'hidden', timeout: 120_000 }).catch(() => undefined)
  await settle(page, 1000)
  console.log(`  · submitted import for ${DESKTOP_APP}`)
}

async function waitTemplateReady (page: Page): Promise<void> {
  await page.goto('/app-desktop-sku', { waitUntil: 'domcontentloaded' })
  await waitForListReady(page)
  const deadline = Date.now() + 180_000
  while (Date.now() < deadline) {
    const card = cardByName(page, DESKTOP_APP)
    if (await card.isVisible().catch(() => false)) {
      const ready = card.locator('text=/就绪|Ready/i').first()
      if (await ready.isVisible().catch(() => false)) {
        console.log(`  · template ready: ${DESKTOP_APP}`)
        return
      }
    }
    await settle(page, 3000)
    await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => undefined)
    await waitForListReady(page)
  }
  console.warn(`  ⚠ template ${DESKTOP_APP} not ready within timeout`)
}

async function selectSkuOnCreate (page: Page): Promise<boolean> {
  const placeholder = page.getByText('请选择桌面模板').first()
  if (await placeholder.isVisible().catch(() => false)) {
    await placeholder.click()
  } else {
    const skuItem = page.locator('.ant-form-item').filter({
      has: page.locator('.ant-form-item-label, label', { hasText: /桌面模板|模板/i }),
    }).first()
    const skuSelect = skuItem.locator('.ant-select, [class*="select"]').first()
    if (!(await skuSelect.isVisible().catch(() => false))) return false
    await skuSelect.click()
  }
  await settle(page, 500)

  const option = page.locator('.ant-select-dropdown:visible').getByText(new RegExp(DESKTOP_APP, 'i')).first()
  if (!(await option.isVisible({ timeout: 10_000 }).catch(() => false))) {
    return false
  }
  await option.click()
  await settle(page, 300)
  return true
}

async function fillInstanceName (page: Page): Promise<string> {
  const name = `${DESKTOP_APP}-doc-${Date.now().toString().slice(-6)}`
  // First text input on create form is usually 名称
  const nameInput = page.locator('.ant-form input:not([type=checkbox]):not([type=radio]), form input:not([type=checkbox]):not([type=radio])').first()
  await nameInput.waitFor({ state: 'visible', timeout: 15_000 })
  await nameInput.fill(name)
  return name
}

async function findInstanceRow (page: Page, nameHint?: string) {
  const hint = nameHint || DESKTOP_APP
  return page.locator('.ant-table-tbody tr, .ant-table-row').filter({ hasText: new RegExp(hint, 'i') }).first()
}

async function openInstanceDetailByHint (page: Page, nameHint?: string): Promise<boolean> {
  const row = await findInstanceRow(page, nameHint)
  if (!(await row.isVisible({ timeout: 10_000 }).catch(() => false))) {
    // fallback first row
    const first = page.locator('.ant-table-tbody tr, .ant-table-row').first()
    if (!(await first.isVisible().catch(() => false))) return false
    const link = first.locator('a, .side-page-trigger').first()
    if (await link.isVisible().catch(() => false)) await link.click()
    else await first.click()
  } else {
    const link = row.locator('a, .side-page-trigger').first()
    if (await link.isVisible().catch(() => false)) await link.click()
    else await row.click()
  }
  const side = page.locator('.ant-drawer:visible, .side-page:visible').first()
  try {
    await side.waitFor({ state: 'visible', timeout: 15_000 })
    await settle(page, 800)
    return true
  } catch {
    return false
  }
}

async function readLoginInfoFromSidepage (page: Page): Promise<{ url: string, username?: string, password?: string }> {
  // Prefer visible login URL text in detail
  const side = page.locator('.ant-drawer:visible, .side-page:visible').first()
  const urlCell = side.locator('.ant-descriptions-item, .detail-item, tr, .list-body-cell-wrap').filter({
    hasText: /登录地址|login_url|http/i,
  }).first()
  let url = ''
  if (await urlCell.isVisible().catch(() => false)) {
    const text = (await urlCell.innerText().catch(() => '')) || ''
    const m = text.match(/https?:\/\/[^\s]+/)
    if (m) url = m[0].replace(/[),.]+$/, '')
  }
  if (!url) {
    const anyHttp = side.locator('text=/https?:\\/\\/\\S+/').first()
    if (await anyHttp.isVisible().catch(() => false)) {
      const t = await anyHttp.innerText()
      const m = t.match(/https?:\/\/[^\s]+/)
      if (m) url = m[0].replace(/[),.]+$/, '')
    }
  }

  // Try API via page context using first matching llm id from list row data attributes if present
  if (!url) {
    const href = await side.locator('a[href^="http"]').first().getAttribute('href').catch(() => null)
    if (href) url = href
  }

  return { url }
}

async function fetchLoginInfoViaApi (page: Page, llmId: string): Promise<{ url: string, username?: string, password?: string }> {
  const res = await page.request.get(`/api/v2/llms/${llmId}/login-info`)
  if (!res.ok()) {
    console.warn(`  ⚠ login-info API ${res.status()}`)
    return { url: '' }
  }
  const data = await res.json().catch(() => ({})) as Record<string, unknown>
  return {
    url: String(data.login_url || data.public_url || data.internal_url || ''),
    username: data.username != null ? String(data.username) : undefined,
    password: data.password != null ? String(data.password) : undefined,
  }
}

async function resolveLlmIdFromList (page: Page, nameHint: string): Promise<string> {
  // Try extract id from row link href or data-row-key
  const row = await findInstanceRow(page, nameHint)
  if (!(await row.isVisible().catch(() => false))) return ''
  const rowKey = await row.getAttribute('data-row-key').catch(() => null)
  if (rowKey) return rowKey
  const href = await row.locator('a').first().getAttribute('href').catch(() => null)
  if (href) {
    const m = href.match(/[0-9a-f-]{8,}/i)
    if (m) return m[0]
  }
  return ''
}

async function waitInstanceRunning (page: Page, nameHint: string): Promise<boolean> {
  const deadline = Date.now() + INSTANCE_WAIT_MS
  while (Date.now() < deadline) {
    await page.goto('/app-desktop', { waitUntil: 'domcontentloaded' })
    await page.locator('.page-list, .ant-table, .ant-spin, .ant-empty').first()
      .waitFor({ state: 'attached', timeout: 60_000 })
      .catch(() => undefined)
    await settle(page, 800)
    const row = await findInstanceRow(page, nameHint)
    if (await row.isVisible().catch(() => false)) {
      const text = (await row.innerText().catch(() => '')) || ''
      if (/运行中|running/i.test(text)) {
        console.log(`  · instance running: ${nameHint}`)
        return true
      }
      console.log(`  · waiting instance status… (${text.split('\n')[0] || nameHint})`)
    }
    await settle(page, 5000)
  }
  return false
}

async function createUbuntuKdeInstance (page: Page): Promise<string | null> {
  await page.goto('/app-desktop/create', { waitUntil: 'domcontentloaded' })
  await page.locator('form, .ant-form').first().waitFor({ state: 'visible', timeout: 60_000 })
  await page.waitForLoadState('networkidle').catch(() => undefined)
  await settle(page, 500)
  await dismissTopAlert(page)

  const name = await fillInstanceName(page)
  const selected = await selectSkuOnCreate(page)
  if (!selected) {
    console.warn(`  ⚠ could not select template ${DESKTOP_APP}; capturing create form anyway`)
  }
  await captureAppShot(page, 'desktop-instance-create')

  if (!selected) return null

  const submit = page.locator('button.ant-btn-primary, button').filter({ hasText: /新\s*建|创\s*建|确\s*定|提\s*交|OK|Create/i }).first()
  if (!(await submit.isVisible().catch(() => false))) {
    console.warn('  ⚠ create submit button not found')
    return null
  }
  await submit.click()
  await page.waitForLoadState('networkidle').catch(() => undefined)
  await settle(page, 2000)
  // Expect redirect back to list
  await page.waitForURL(/\/app-desktop\/?$/, { timeout: 60_000 }).catch(() => undefined)
  console.log(`  · created instance: ${name}`)
  return name
}

async function captureLoginPage (context: BrowserContext, page: Page, nameHint: string): Promise<void> {
  await page.goto('/app-desktop', { waitUntil: 'domcontentloaded' })
  await settle(page, 800)

  let llmId = await resolveLlmIdFromList(page, nameHint)
  if (!llmId) {
    // try any ubuntu-kde row
    llmId = await resolveLlmIdFromList(page, DESKTOP_APP)
  }

  let login = { url: '', username: undefined as string | undefined, password: undefined as string | undefined }
  if (llmId) {
    login = await fetchLoginInfoViaApi(page, llmId)
  }

  if (!login.url) {
    if (await openInstanceDetailByHint(page, nameHint)) {
      await captureAppShot(page, 'desktop-instance-detail')
      login = await readLoginInfoFromSidepage(page)
      // try id from URL hash/query
      if (!llmId) {
        const u = page.url()
        const m = u.match(/[0-9a-f]{8}-[0-9a-f-]{27,}/i)
        if (m) llmId = m[0]
      }
      if (!login.url && llmId) login = await fetchLoginInfoViaApi(page, llmId)
    }
  } else if (await openInstanceDetailByHint(page, nameHint)) {
    await captureAppShot(page, 'desktop-instance-detail')
  }

  if (!login.url) {
    throw new Error(`No login URL for instance matching ${nameHint || DESKTOP_APP}`)
  }

  let target = login.url
  if (login.username && login.password) {
    try {
      const u = new URL(login.url)
      u.username = login.username
      u.password = login.password
      target = u.toString()
    } catch {
      // keep raw url
    }
  }

  console.log(`  · opening login URL: ${login.url}`)
  const loginPage = await context.newPage()
  try {
    loginPage.setDefaultTimeout(120_000)
    await loginPage.goto(target, { waitUntil: 'domcontentloaded', timeout: 120_000 })
    await loginPage.waitForLoadState('networkidle').catch(() => undefined)
    // Desktop UIs can be slow; wait for body content
    await loginPage.locator('body').waitFor({ state: 'visible', timeout: 60_000 })
    await settle(loginPage, 3000)
    await captureShot(loginPage, 'desktop-instance-login')
  } finally {
    await loginPage.close().catch(() => undefined)
  }
}

export async function runAppDesktop (page: Page): Promise<void> {
  console.log(`Scenario: app-desktop (应用 / 桌面, app=${DESKTOP_APP})`)
  const context = page.context()

  // --- 桌面模板：导入 ubuntu-kde ---
  await page.goto('/app-desktop-sku/import-from-community', { waitUntil: 'domcontentloaded' })
  await page.locator('.catalog-grid-page-body, .community-image-card, .catalog-card, .ant-empty, .ant-spin')
    .first()
    .waitFor({ state: 'attached', timeout: 60_000 })
  await page.waitForLoadState('networkidle').catch(() => undefined)
  await settle(page, 800)
  await dismissTopAlert(page)

  // Scroll ubuntu-kde into view before community overview shot
  const communityCard = cardByName(page, DESKTOP_APP)
  if (await communityCard.isVisible().catch(() => false)) {
    await communityCard.scrollIntoViewIfNeeded().catch(() => undefined)
    await settle(page, 300)
  }
  await captureAppShot(page, 'desktop-sku-import-community')

  await importUbuntuKdeIfNeeded(page)
  await waitTemplateReady(page)
  await captureAppShot(page, 'desktop-sku-list')

  // create / update form shots (generic, keep for concept pages)
  await page.goto('/app-desktop-sku/create', { waitUntil: 'domcontentloaded' })
  await waitForSkuForm(page)
  await captureAppShot(page, 'desktop-sku-create')

  await page.goto('/app-desktop-sku', { waitUntil: 'domcontentloaded' })
  await waitForListReady(page)
  const edited = await openEditDialog(page)
  if (edited) {
    await waitForAppShell(page)
    await captureShot(page, 'desktop-sku-update')
    await page.keyboard.press('Escape').catch(() => undefined)
  } else {
    await page.goto('/app-desktop-sku/create', { waitUntil: 'domcontentloaded' })
    await waitForSkuForm(page)
    await captureAppShot(page, 'desktop-sku-update')
  }

  // --- 桌面镜像 ---
  await page.goto('/app-desktop-image', { waitUntil: 'domcontentloaded' })
  await page.locator('.page-list, .ant-table, .ant-spin, .ant-empty').first()
    .waitFor({ state: 'attached', timeout: 60_000 })
  await page.waitForLoadState('networkidle').catch(() => undefined)
  await settle(page, 500)
  await captureAppShot(page, 'desktop-image-list')

  // --- 桌面实例 ---
  await page.goto('/app-desktop', { waitUntil: 'domcontentloaded' })
  await page.locator('.page-list, .ant-table, .ant-spin, .ant-empty').first()
    .waitFor({ state: 'attached', timeout: 60_000 })
  await page.waitForLoadState('networkidle').catch(() => undefined)
  await settle(page, 500)

  let instanceName: string | null = null
  const existing = await findInstanceRow(page, DESKTOP_APP)
  if (await existing.isVisible().catch(() => false)) {
    const text = await existing.innerText()
    instanceName = text.split('\n')[0]?.trim() || DESKTOP_APP
    console.log(`  · reuse existing instance row: ${instanceName}`)
    await captureAppShot(page, 'desktop-instance-list')
    // still capture create form with template selected
    await page.goto('/app-desktop/create', { waitUntil: 'domcontentloaded' })
    await page.locator('form, .ant-form').first().waitFor({ state: 'visible', timeout: 60_000 })
    await settle(page, 400)
    await selectSkuOnCreate(page).catch(() => false)
    await captureAppShot(page, 'desktop-instance-create')
  } else {
    await captureAppShot(page, 'desktop-instance-list')
    instanceName = await createUbuntuKdeInstance(page)
  }

  if (!instanceName) {
    console.warn(`  ⚠ no ${DESKTOP_APP} instance; skip login capture`)
    return
  }

  const running = await waitInstanceRunning(page, instanceName)
  if (!running) {
    const ok = await waitInstanceRunning(page, DESKTOP_APP)
    if (!ok) {
      console.warn(`  ⚠ instance ${instanceName} not running; capturing detail only`)
      await page.goto('/app-desktop', { waitUntil: 'domcontentloaded' })
      await settle(page, 800)
      if (await openInstanceDetailByHint(page, DESKTOP_APP)) {
        await captureAppShot(page, 'desktop-instance-detail')
      }
      return
    }
  }

  await page.goto('/app-desktop', { waitUntil: 'domcontentloaded' })
  await settle(page, 800)
  await captureAppShot(page, 'desktop-instance-list')

  try {
    await captureLoginPage(context, page, instanceName)
  } catch (e) {
    console.warn(`  ⚠ login page capture failed: ${(e as Error).message}`)
    if (await openInstanceDetailByHint(page, instanceName)) {
      await captureAppShot(page, 'desktop-instance-detail')
    }
  }
}

export default runAppDesktop
