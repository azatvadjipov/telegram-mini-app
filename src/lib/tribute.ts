import 'server-only'
import { env } from './env'

export interface TributeSubscription {
  isActive: boolean
  expiresAt?: Date
  planId?: string
}

export class TributeClient {
  private baseUrl: string
  private apiKey: string
  private channelId: string

  constructor() {
    this.baseUrl = env.TRIBUTE_API_BASE
    this.apiKey = env.TRIBUTE_API_KEY
    this.channelId = env.TRIBUTE_CHANNEL_ID
  }

  async checkSubscription(telegramUserId: string): Promise<TributeSubscription> {
    try {
      // This is a stub implementation
      // In production, you would make an actual API call to Tribute
      const response = await fetch(`${this.baseUrl}/api/v1/subscriptions/${telegramUserId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        // For demo purposes, return mock data
        console.warn('Tribute API not available, using mock data')
        return this.getMockSubscription(telegramUserId)
      }

      const data = await response.json()

      return {
        isActive: data.isActive ?? false,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        planId: data.planId,
      }
    } catch (error) {
      console.error('Error checking Tribute subscription:', error)
      // Fallback to mock data
      return this.getMockSubscription(telegramUserId)
    }
  }

  private getMockSubscription(telegramUserId: string): TributeSubscription {
    // Mock implementation for development
    // You can customize this based on your testing needs
    const mockActiveUsers = ['123456789', '987654321'] // Add telegram user IDs that should have active subscriptions

    return {
      isActive: mockActiveUsers.includes(telegramUserId),
      expiresAt: mockActiveUsers.includes(telegramUserId) ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined, // 30 days from now
      planId: 'premium_monthly',
    }
  }

  async verifyWebhookSignature(payload: string, signature: string): Promise<boolean> {
    // Implement HMAC-SHA256 verification for webhooks
    // This is a stub implementation
    try {
      const crypto = await import('crypto')
      const expectedSignature = crypto
        .createHmac('sha256', this.apiKey)
        .update(payload)
        .digest('hex')

      return signature === expectedSignature
    } catch (error) {
      console.error('Error verifying webhook signature:', error)
      return false
    }
  }
}

export const tributeClient = new TributeClient()
