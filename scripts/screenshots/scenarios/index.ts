import type { Page } from 'playwright'
import { runLlmSkuTemplate } from './llm-sku-template.ts'
import { runLlmDeployment } from './llm-deployment.ts'
import { runLlmModelFiles } from './llm-model-files.ts'
import { runLlmImage } from './llm-image.ts'
import { runLlmBenchmark } from './llm-benchmark.ts'
import { runLlmQuickstart } from './llm-quickstart.ts'
import { runAppDesktop } from './app-desktop.ts'

export type ScenarioFn = (page: Page) => Promise<void>

export const scenarios: Record<string, ScenarioFn> = {
  'llm-quickstart': runLlmQuickstart,
  'llm-sku-template': runLlmSkuTemplate,
  'llm-deployment': runLlmDeployment,
  'llm-model-files': runLlmModelFiles,
  'llm-image': runLlmImage,
  'llm-benchmark': runLlmBenchmark,
  'app-desktop': runAppDesktop,
}

/** All inference-menu scenarios in doc order */
export const LLM_INFERENCE_SCENARIOS = [
  'llm-quickstart',
  'llm-deployment',
  'llm-sku-template',
  'llm-model-files',
  'llm-image',
  'llm-benchmark',
] as const

export function listScenarios (): string[] {
  return Object.keys(scenarios)
}
