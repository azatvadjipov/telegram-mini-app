import { NextRequest, NextResponse } from 'next/server'
import { prisma, PageAccess } from '@/lib/prisma'
import { cache } from '@/lib/cache'
import { verifyJWT } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json(
        { error: 'Параметр slug обязателен' },
        { status: 400 }
      )
    }

    // Check authorization for premium content
    const authHeader = request.headers.get('authorization')

    // Check cache first
    const cacheKey = `content:page:${slug}`
    let page = await cache.get(cacheKey)

    if (!page) {
      // Fetch from database
      page = await prisma.page.findUnique({
        where: { slug },
        select: {
          id: true,
          title: true,
          excerpt: true,
          contentMd: true,
          access: true,
          updatedAt: true,
        },
      })

      if (!page) {
        return NextResponse.json(
          { error: 'Страница не найдена' },
          { status: 404 }
        )
      }

      // Cache for 60 seconds
      await cache.set(cacheKey, page, 60)
    }

    // Check access permissions
    if ((page as any).access === PageAccess.premium) {
      if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Требуется авторизация для доступа к премиум контенту' },
          { status: 401 }
        )
      }

      const token = authHeader.substring(7)
      const payload = await verifyJWT(token)

      if (!payload?.isSubscribed) {
        return NextResponse.json(
          { error: 'Требуется активная подписка для доступа к этому контенту' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json({ page })

  } catch (error) {
    console.error('Page fetch error:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении страницы' },
      { status: 500 }
    )
  }
}
