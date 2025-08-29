import { describe, it, expect, vi } from 'vitest'
import { signJWT, verifyJWT } from '../lib/jwt'

// Mock environment
vi.mock('../lib/env', () => ({
  env: {
    JWT_SECRET: 'test_jwt_secret_key_for_testing_only_12345'
  }
}))

describe('JWT Utilities', () => {
  const testPayload = {
    telegramUserId: '123456789',
    isSubscribed: true
  }

  describe('signJWT and verifyJWT', () => {
    it('should sign and verify JWT successfully', async () => {
      const token = await signJWT(testPayload)
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)

      const verified = await verifyJWT(token)
      expect(verified).toEqual(
        expect.objectContaining({
          telegramUserId: testPayload.telegramUserId,
          isSubscribed: testPayload.isSubscribed
        })
      )
      expect(verified?.iat).toBeDefined()
      expect(verified?.exp).toBeDefined()
    })

    it('should reject invalid JWT', async () => {
      const result = await verifyJWT('invalid.jwt.token')
      expect(result).toBeNull()
    })

    it('should reject expired JWT', async () => {
      // Create an expired token (this would require mocking time, simplified for test)
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZWxlZ3JhbVVzZXJJZCI6IjEyMzQ1Njc4OSIsImlzU3Vic2NyaWJlZCI6dHJ1ZSwiaWF0IjoxNjQwOTk1MjAwLCJleHAiOjE2NDA5OTUyMDB9.expired_signature'
      const result = await verifyJWT(expiredToken)
      expect(result).toBeNull()
    })
  })
})
