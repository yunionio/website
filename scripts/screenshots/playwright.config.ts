/** Shared browser defaults for doc screenshots (used by capture.ts / auth.ts). */
export const browserDefaults = {
  headless: process.env.HEADED !== '1',
  viewport: { width: 1440, height: 900 } as const,
  /** Retina-quality PNGs (2x CSS pixels). Override with SCREENSHOT_DPR=1|2|3 */
  deviceScaleFactor: Number(process.env.SCREENSHOT_DPR || 2) || 2,
  locale: 'zh-CN',
  ignoreHTTPSErrors: true,
  timeoutMs: 60_000,
}

export function browserContextOptions (baseURL: string) {
  return {
    baseURL,
    viewport: { ...browserDefaults.viewport },
    deviceScaleFactor: browserDefaults.deviceScaleFactor,
    locale: browserDefaults.locale,
    ignoreHTTPSErrors: browserDefaults.ignoreHTTPSErrors,
  }
}

export default browserDefaults
