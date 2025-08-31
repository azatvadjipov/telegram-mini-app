import 'server-only'
import { env } from './env'

let redis: any = null

if (env.REDIS_URL) {
  try {
    console.log('🔄 Initializing Redis cache...')
    // Dynamic import for Redis to make it optional
    const { createClient } = require('redis')
    redis = createClient({ url: env.REDIS_URL })
    redis.connect().then(() => {
      console.log('✅ Redis connected successfully')
    }).catch((error: any) => {
      console.error('❌ Redis connection failed:', error)
      redis = null
    })
  } catch (error) {
    console.warn('⚠️ Redis not available, caching disabled')
    redis = null
  }
} else {
  console.log('ℹ️ No REDIS_URL provided, caching disabled')
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
    if (!this.client) {
      console.log('💾 Cache disabled, returning null for key:', key)
      return null
    }

    try {
      console.log('💾 Cache get:', key)
      const value = await this.client.get(key)
      console.log('💾 Cache get result:', value ? 'found' : 'not found')
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('❌ Cache get error:', error)
      return null
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 60): Promise<void> {
    if (!this.client) {
      console.log('💾 Cache disabled, skipping set for key:', key)
      return
    }

    try {
      console.log('💾 Cache set:', key, 'TTL:', ttlSeconds)
      await this.client.setEx(key, ttlSeconds, JSON.stringify(value))
      console.log('💾 Cache set completed')
    } catch (error) {
      console.error('❌ Cache set error:', error)
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
