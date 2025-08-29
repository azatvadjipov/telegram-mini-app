import { NextRequest, NextResponse } from 'next/server'
import { validateInitData, getTelegramUserId } from '@/lib/telegram'
import { tributeClient } from '@/lib/tribute'
import { signJWT } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'
import { cache } from '@/lib/cache'

export async function POST(request: NextRequest) {
  try {
    const { initData } = await request.json()

    if (!initData || typeof initData !== 'string') {
      return NextResponse.json(
        { error: 'Неверные данные инициализации' },
        { status: 400 }
      )
    }

    // Validate Telegram initData
    const { isValid, user } = validateInitData(initData)

    if (!isValid || !user) {
      return NextResponse.json(
        { error: 'Неверные данные Telegram' },
        { status: 401 }
      )
    }

    const telegramUserId = user.id.toString()

    // Check cache first
    const cacheKey = `user_access:${telegramUserId}`
    let userAccess = await cache.get(cacheKey)

    if (!userAccess) {
      // Check database
      userAccess = await prisma.userAccess.findUnique({
        where: { telegramUserId },
      })

      // If not in database, check Tribute API
      if (!userAccess) {
        const subscription = await tributeClient.checkSubscription(telegramUserId)

        // Create or update user access record
        userAccess = await prisma.userAccess.upsert({
          where: { telegramUserId },
          update: {
            isActive: subscription.isActive,
            updatedAt: new Date(),
          },
          create: {
            telegramUserId,
            isActive: subscription.isActive,
          },
        })
      }

      // Cache the result for 5 minutes
      await cache.set(cacheKey, userAccess, 300)
    }

    const isSubscribed = (userAccess as any).isActive

    if (!isSubscribed) {
      return NextResponse.json({
        subscribed: false,
        message: 'Требуется подписка для доступа к контенту',
      })
    }

    // Create JWT session token
    const sessionJWT = await signJWT({
      telegramUserId,
      isSubscribed,
    })

    return NextResponse.json({
      subscribed: true,
      sessionJWT,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
      },
    })

  } catch (error) {
    console.error('Telegram verification error:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера при проверке аутентификации' },
      { status: 500 }
    )
  }
}
