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
  console.log('🔍 Parsing initData string...')

  try {
    const params = new URLSearchParams(initData)
    const data: Record<string, string> = {}

    console.log('📋 URLSearchParams created successfully')

    for (const [key, value] of params.entries()) {
      data[key] = value
      console.log(`🔑 Parsed param: ${key} = ${value?.substring(0, 50)}...`)
    }

    console.log('📊 All parsed params:', Object.keys(data))

    const user = data.user ? JSON.parse(data.user) : undefined
    console.log('👤 User parsed:', user ? { id: user.id, first_name: user.first_name } : 'null')

    const result = {
      query_id: data.query_id,
      user,
      auth_date: parseInt(data.auth_date),
      hash: data.hash,
    }

    console.log('✅ parseInitData completed successfully')
    return result

  } catch (error) {
    console.error('❌ Error in parseInitData:', error)
    console.error('❌ Raw initData that caused error:', initData)
    throw error
  }
}

export function validateInitData(initData: string): { isValid: boolean; user?: TelegramUser } {
  try {
    console.log('🔐 Validating Telegram initData...')
    console.log('📝 Raw initData length:', initData?.length || 0)
    console.log('📝 Raw initData preview:', initData?.substring(0, 200) + '...')

    const parsed = parseInitData(initData)
    console.log('✅ Parsed initData:', {
      hasUser: !!parsed.user,
      authDate: parsed.auth_date,
      hasHash: !!parsed.hash,
      hasQueryId: !!parsed.query_id
    })

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
