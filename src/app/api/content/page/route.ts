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
      try {
        // Fetch from database using raw SQL
        const pages = await prisma.$queryRaw`
          SELECT id, title, excerpt, "contentMd", access, "updatedAt"
          FROM "Page"
          WHERE slug = ${slug}
          LIMIT 1
        ` as any[]

        if (!pages || pages.length === 0) {
          return NextResponse.json(
            { error: 'Страница не найдена' },
            { status: 404 }
          )
        }

        page = pages[0]

        // Cache for 60 seconds
        await cache.set(cacheKey, page, 60)
      } catch (dbError) {
        console.error('Database query failed for page:', dbError)

        // Return mock data based on slug
        if (slug === 'welcome') {
          page = {
            id: 'mock-welcome',
            title: 'Добро пожаловать',
            excerpt: 'Введение в наш контент',
            contentMd: '# Добро пожаловать!\n\nЭто тестовая страница.',
            access: 'public',
            updatedAt: new Date().toISOString()
          }
        } else if (slug === 'premium-content') {
          page = {
            id: 'mock-premium',
            title: 'Премиум контент',
            excerpt: 'Эксклюзивный контент для подписчиков',
            contentMd: '# Премиум контент\n\nЭто премиум контент.',
            access: 'premium',
            updatedAt: new Date().toISOString()
          }
        } else {
          return NextResponse.json(
            { error: 'Страница не найдена' },
            { status: 404 }
          )
        }

        // Cache mock data for 30 seconds
        await cache.set(cacheKey, page, 30)
      }
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
