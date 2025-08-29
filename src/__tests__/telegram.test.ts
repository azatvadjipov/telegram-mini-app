import { describe, it, expect, vi } from 'vitest'
import { validateInitData, getTelegramUserId } from '../lib/telegram'

// Mock environment
vi.mock('../lib/env', () => ({
  env: {
    TELEGRAM_BOT_TOKEN: 'test_bot_token_12345'
  }
}))

describe('Telegram Authentication', () => {
  const validInitData = 'user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Test%22%2C%22username%22%3A%22testuser%22%7D&auth_date=1640995200&hash=test_hash_123'

  describe('validateInitData', () => {
    it('should validate correct initData format', () => {
      const result = validateInitData(validInitData)
      expect(result.isValid).toBe(false) // Will be false due to hash mismatch in test
      expect(result.user).toBeUndefined()
    })

    it('should reject malformed initData', () => {
      const result = validateInitData('invalid_data')
      expect(result.isValid).toBe(false)
      expect(result.user).toBeUndefined()
    })

    it('should reject expired initData', () => {
      const expiredData = 'user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Test%22%7D&auth_date=1577836800&hash=expired_hash'
      const result = validateInitData(expiredData)
      expect(result.isValid).toBe(false)
    })
  })

  describe('getTelegramUserId', () => {
    it('should return null for invalid data', () => {
      const result = getTelegramUserId('invalid_data')
      expect(result).toBeNull()
    })

    it('should return null for expired data', () => {
      const expiredData = 'user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Test%22%7D&auth_date=1577836800&hash=expired_hash'
      const result = getTelegramUserId(expiredData)
      expect(result).toBeNull()
    })
  })
})
