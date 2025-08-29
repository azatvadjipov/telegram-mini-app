import { createHmac } from 'crypto'
import { env } from './env'

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
}

export interface TelegramInitData {
  query_id?: string
  user?: TelegramUser
  auth_date: number
  hash: string
}

export function parseInitData(initData: string): TelegramInitData {
  const params = new URLSearchParams(initData)
  const data: Record<string, string> = {}

  for (const [key, value] of params.entries()) {
    data[key] = value
  }

  const user = data.user ? JSON.parse(data.user) : undefined

  return {
    query_id: data.query_id,
    user,
    auth_date: parseInt(data.auth_date),
    hash: data.hash,
  }
}

export function validateInitData(initData: string): { isValid: boolean; user?: TelegramUser } {
  try {
    const parsed = parseInitData(initData)

    // Check if data is not too old (24 hours)
    const now = Math.floor(Date.now() / 1000)
    if (now - parsed.auth_date > 86400) {
      return { isValid: false }
    }

    // Create data string for hash verification
    const params = new URLSearchParams(initData)
    params.delete('hash')

    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')

    // Create HMAC-SHA256 hash
    const secretKey = createHmac('sha256', 'WebAppData')
      .update(env.TELEGRAM_BOT_TOKEN)
      .digest()

    const calculatedHash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex')

    const isValid = calculatedHash === parsed.hash

    return {
      isValid,
      user: isValid ? parsed.user : undefined,
    }
  } catch (error) {
    console.error('Error validating Telegram initData:', error)
    return { isValid: false }
  }
}

export function getTelegramUserId(initData: string): string | null {
  const { isValid, user } = validateInitData(initData)
  return isValid && user ? user.id.toString() : null
}
