import { NextRequest, NextResponse } from 'next/server'
import { validateInitData, getTelegramUserId, parseInitData } from '@/lib/telegram'
import { tributeClient } from '@/lib/tribute'
import { signJWT } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'
import { cache } from '@/lib/cache'

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Telegram verification started')

    const body = await request.json()
    const { initData } = body

    if (!initData) {
      return NextResponse.json(
        { error: 'Отсутствуют данные инициализации Telegram' },
        { status: 400 }
      )
    }

    console.log('📝 Validating Telegram initData...')

    // Validate Telegram initData
    const validation = validateInitData(initData)
    if (!validation.isValid || !validation.user) {
      console.log('❌ Invalid Telegram initData')
      return NextResponse.json(
        { error: 'Недействительные данные Telegram' },
        { status: 401 }
      )
    }

    const telegramUserId = validation.user.id.toString()
    console.log('✅ Telegram user validated:', telegramUserId)

    // Check cache first for subscription status
    const cacheKey = `subscription:${telegramUserId}`
    let isSubscribed = await cache.get(cacheKey)

    if (isSubscribed === null) {
      console.log('📡 Checking subscription with Tribute...')

      // Check subscription status with Tribute
      const subscription = await tributeClient.checkSubscription(telegramUserId)
      isSubscribed = subscription.isActive

      // Cache subscription status for 5 minutes
      await cache.set(cacheKey, isSubscribed, 300)
      console.log('💾 Subscription status cached')
    } else {
      console.log('✅ Using cached subscription status')
    }

    console.log('🎯 User subscription status:', isSubscribed)

    // Generate JWT token
    const sessionJWT = await signJWT({
      telegramUserId,
      isSubscribed,
    })

    console.log('✅ Telegram verification completed successfully')
    return NextResponse.json({
      subscribed: isSubscribed,
      sessionJWT,
      user: {
        id: validation.user.id,
        first_name: validation.user.first_name,
        last_name: validation.user.last_name || null,
        username: validation.user.username || null,
      },
    })

  } catch (error) {
    console.error('❌ Telegram verification error:', error)

    // Fallback for development - return mock successful response
    if (process.env.NODE_ENV === 'development') {
      console.log('🛠️ Development mode - returning mock successful response')
      const sessionJWT = await signJWT({
        telegramUserId: '123456789',
        isSubscribed: true,
      })

      return NextResponse.json({
        subscribed: true,
        sessionJWT,
        user: {
          id: 123456789,
          first_name: 'Test',
          last_name: null,
          username: 'testuser',
        },
      })
    }

    return NextResponse.json(
      { error: 'Ошибка сервера при проверке аутентификации' },
      { status: 500 }
    )
  }
}
