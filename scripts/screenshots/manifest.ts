import path from 'node:path'
import { WEBSITE_ROOT } from './src/env.ts'

const INF = 'docs/aicloud/guides/llm-inference/images'
const AI_PROXY = 'docs/aicloud/guides/ai-proxy/images'
const APP_DESKTOP = 'docs/onpremise/guides/application/images'

/** shotId → relative path under website root */
export const MANIFEST: Record<string, string> = {
  // 推理模板
  'sku-list': `${INF}/sku-list.png`,
  'sku-create': `${INF}/sku-create.png`,
  'sku-update': `${INF}/sku-update.png`,
  'sku-instant-model': `${INF}/sku-instant-model.png`,
  'sku-show-instant-model': `${INF}/sku-show-instant-model.png`,
  'sku-ready-deploy': `${INF}/sku-ready-deploy.png`,
  // ModelScope 导入（quickstart / template）
  'modelscope-import-entry': `${INF}/modelscope-import-entry.png`,
  'modelscope-search': `${INF}/modelscope-search.png`,
  'modelscope-select-vllm-image': `${INF}/modelscope-select-vllm-image.png`,
  'modelscope-select-hami-gpu': `${INF}/modelscope-select-hami-gpu.png`,
  // 推理部署
  'deployment-list': `${INF}/deployment-list.png`,
  'deployment-create': `${INF}/deployment-create.png`,
  'deployment-detail': `${INF}/deployment-detail.png`,
  'deployment-ready': `${INF}/deployment-ready.png`,
  'deployment-chat-test': `${INF}/deployment-chat-test.png`,
  'deployment-aiproxy-access': `${INF}/deployment-aiproxy-access.png`,
  'hami-verify-nvidia-smi': `${INF}/hami-verify-nvidia-smi.png`,
  // AI 网关 API Key
  'aiproxy-create-api-key': `${INF}/aiproxy-create-api-key.png`,
  // AI 网关用量
  'aiproxy-usage-overview': `${AI_PROXY}/usage-overview.png`,
  'aiproxy-usage-analysis': `${AI_PROXY}/usage-analysis.png`,
  'aiproxy-usage-events': `${AI_PROXY}/usage-events.png`,
  // 模型文件
  'model-files-list': `${INF}/model-files-list.png`,
  // 推理镜像
  'image-list': `${INF}/image-list.png`,
  'image-create': `${INF}/image-create.png`,
  // 基准测试
  'benchmark-list': `${INF}/benchmark-list.png`,
  'benchmark-create': `${INF}/benchmark-create.png`,
  'benchmark-detail': `${INF}/benchmark-detail.png`,
  // 应用 / 桌面（私有云）
  'desktop-sku-list': `${APP_DESKTOP}/template-list.png`,
  'desktop-sku-import-community': `${APP_DESKTOP}/template-import-community.png`,
  'desktop-sku-import-drawer': `${APP_DESKTOP}/template-import-drawer.png`,
  'desktop-sku-create': `${APP_DESKTOP}/template-create.png`,
  'desktop-sku-update': `${APP_DESKTOP}/template-update.png`,
  'desktop-image-list': `${APP_DESKTOP}/image-list.png`,
  'desktop-image-create': `${APP_DESKTOP}/image-create.png`,
  'desktop-instance-list': `${APP_DESKTOP}/instance-list.png`,
  'desktop-instance-create': `${APP_DESKTOP}/instance-create.png`,
  'desktop-instance-detail': `${APP_DESKTOP}/instance-detail.png`,
  'desktop-instance-login': `${APP_DESKTOP}/instance-login.png`,
}

export function resolveShotPath (shotId: string): string {
  const rel = MANIFEST[shotId]
  if (!rel) {
    throw new Error(`Unknown shotId "${shotId}". Add it to manifest.ts`)
  }
  return path.join(WEBSITE_ROOT, rel)
}
