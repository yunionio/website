import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const PACKAGE_ROOT = path.resolve(__dirname, '..')
export const WEBSITE_ROOT = path.resolve(PACKAGE_ROOT, '../..')
export const AUTH_STATE_PATH = path.join(PACKAGE_ROOT, '.auth', 'user.json')

dotenv.config({ path: path.join(PACKAGE_ROOT, '.env') })

export type LoginMode = 'ui' | 'api' | 'auto'

export interface ScreenshotEnv {
  baseURL: string
  username: string
  password: string
  domain?: string
  loginMode: LoginMode
}

export function loadEnv (): ScreenshotEnv {
  const baseURL = (process.env.DASHBOARD_URL || 'http://localhost:8081').replace(/\/$/, '')
  const username = process.env.DASHBOARD_USERNAME?.trim() || ''
  const password = process.env.DASHBOARD_PASSWORD || ''
  const domain = process.env.DASHBOARD_DOMAIN?.trim() || undefined
  const modeRaw = (process.env.DASHBOARD_LOGIN_MODE || 'auto').toLowerCase()
  const loginMode: LoginMode = modeRaw === 'ui' || modeRaw === 'api' ? modeRaw : 'auto'

  if (!username || !password) {
    throw new Error(
      'Missing DASHBOARD_USERNAME / DASHBOARD_PASSWORD. Copy .env.example to .env and fill credentials.',
    )
  }

  return { baseURL, username, password, domain, loginMode }
}
