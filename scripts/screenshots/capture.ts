#!/usr/bin/env tsx
import { chromium } from 'playwright'
import { browserDefaults } from './playwright.config.ts'
import { loadEnv } from './src/env.ts'
import { createAuthedContext } from './src/auth.ts'
import {
  LLM_INFERENCE_SCENARIOS,
  listScenarios,
  scenarios,
} from './scenarios/index.ts'

function resolveScenarioNames (arg: string): string[] {
  if (arg === 'llm-inference' || arg === 'all-inference') {
    return [...LLM_INFERENCE_SCENARIOS]
  }
  return [arg]
}

async function main (): Promise<void> {
  const name = process.argv[2]
  if (!name || name === '-h' || name === '--help') {
    console.log('Usage: yarn capture <scenario>\n')
    console.log('Available scenarios:')
    for (const s of listScenarios()) console.log(`  - ${s}`)
    console.log('  - llm-inference   (run all inference-menu scenarios)')
    process.exit(name ? 0 : 1)
  }

  const names = resolveScenarioNames(name)
  for (const n of names) {
    if (!scenarios[n]) {
      console.error(`Unknown scenario "${n}". Available: ${listScenarios().join(', ')}`)
      process.exit(1)
    }
  }

  const env = loadEnv()
  console.log(`Dashboard: ${env.baseURL}`)
  console.log(`Scenarios: ${names.join(', ')}`)
  console.log(`Login:     ${env.loginMode} (user=${env.username})`)

  const browser = await chromium.launch({ headless: browserDefaults.headless })
  try {
    const context = await createAuthedContext(browser, env)
    const page = await context.newPage()
    page.setDefaultTimeout(browserDefaults.timeoutMs)
    for (const n of names) {
      await scenarios[n](page)
    }
    await context.close()
    console.log('Done.')
  } finally {
    await browser.close()
  }
}

main().catch(err => {
  console.error(err instanceof Error ? err.stack || err.message : err)
  process.exit(1)
})
