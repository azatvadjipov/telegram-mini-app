import { NextRequest, NextResponse } from 'next/server'
import { tributeClient } from '@/lib/tribute'
import { prisma } from '@/lib/prisma'
import { cache } from '@/lib/cache'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('trbt-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Отсутствует подпись webhook' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const isValidSignature = await tributeClient.verifyWebhookSignature(body, signature)

    if (!isValidSignature) {
      return NextResponse.json(
        { error: 'Неверная подпись webhook' },
        { status: 401 }
      )
    }

    const payload = JSON.parse(body)

    // Handle different webhook events
    switch (payload.event) {
      case 'subscription.created':
      case 'subscription.updated':
      case 'subscription.renewed':
        await handleSubscriptionUpdate(payload.data)
        break

      case 'subscription.cancelled':
      case 'subscription.expired':
        await handleSubscriptionCancel(payload.data)
        break

      default:
        console.log('Unhandled webhook event:', payload.event)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Ошибка обработки webhook' },
      { status: 500 }
    )
  }
}

async function handleSubscriptionUpdate(data: any) {
  const telegramUserId = data.telegramUserId || data.userId

  if (!telegramUserId) {
    console.error('No telegramUserId in webhook data')
    return
  }

  // Update user access in database
  await prisma.userAccess.upsert({
    where: { telegramUserId: telegramUserId.toString() },
    update: {
      isActive: true,
      updatedAt: new Date(),
    },
    create: {
      telegramUserId: telegramUserId.toString(),
      isActive: true,
    },
  })

  // Invalidate cache
  await cache.invalidateUserAccess(telegramUserId.toString())

  console.log(`Updated subscription for user ${telegramUserId}`)
}

async function handleSubscriptionCancel(data: any) {
  const telegramUserId = data.telegramUserId || data.userId

  if (!telegramUserId) {
    console.error('No telegramUserId in webhook data')
    return
  }

  // Update user access in database
  await prisma.userAccess.upsert({
    where: { telegramUserId: telegramUserId.toString() },
    update: {
      isActive: false,
      updatedAt: new Date(),
    },
    create: {
      telegramUserId: telegramUserId.toString(),
      isActive: false,
    },
  })

  // Invalidate cache
  await cache.invalidateUserAccess(telegramUserId.toString())

  console.log(`Cancelled subscription for user ${telegramUserId}`)
}
