import { env } from './env'

let redis: any = null

if (env.REDIS_URL) {
  try {
    // Dynamic import for Redis to make it optional
    const { createClient } = require('redis')
    redis = createClient({ url: env.REDIS_URL })
    redis.connect().catch(console.error)
  } catch (error) {
    console.warn('Redis not available, caching disabled')
  }
}

export class Cache {
  private static instance: Cache
  private client: any

  private constructor() {
    this.client = redis
  }

  static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache()
    }
    return Cache.instance
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client) return null

    try {
      const value = await this.client.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 60): Promise<void> {
    if (!this.client) return

    try {
      await this.client.setEx(key, ttlSeconds, JSON.stringify(value))
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client) return

    try {
      await this.client.del(key)
    } catch (error) {
      console.error('Cache del error:', error)
    }
  }

  async invalidateUserAccess(telegramUserId: string): Promise<void> {
    await this.del(`user_access:${telegramUserId}`)
  }

  async invalidateContent(): Promise<void> {
    if (!this.client) return

    try {
      const keys = await this.client.keys('content:*')
      if (keys.length > 0) {
        await this.client.del(keys)
      }
    } catch (error) {
      console.error('Cache content invalidation error:', error)
    }
  }
}

export const cache = Cache.getInstance()
