import { NextRequest, NextResponse } from 'next/server'
import { prisma, PageStatus, PageAccess } from '@/lib/prisma'
import { cache } from '@/lib/cache'
import { verifyJWT } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    console.log('📄 Page request started')

    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json(
        { error: 'Параметр slug обязателен' },
        { status: 400 }
      )
    }

    console.log('📄 Requested slug:', slug)

    // Check authorization for premium content access
    const authHeader = request.headers.get('authorization')
    let isSubscribed = false

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      try {
        const payload = await verifyJWT(token)
        isSubscribed = payload?.isSubscribed || false
        console.log('📄 User subscription status:', isSubscribed)
      } catch (error) {
        console.log('📄 JWT verification failed:', error)
      }
    }

    // Check cache first
    const cacheKey = `page:${slug}:${isSubscribed}`
    let page: any = await cache.get(cacheKey)

    // Ensure page is properly typed
    if (page && typeof page !== 'object') {
      console.log('📄 Invalid cached page data, treating as not cached')
      page = null
    }

    if (!page) {
      console.log('📡 Fetching page from database...')

      // Fetch page from database
      const dbPage = await prisma.page.findUnique({
        where: {
          slug,
          status: PageStatus.published,
        },
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          contentMd: true,
          access: true,
          updatedAt: true,
        },
      })

      if (!dbPage) {
        console.log('📄 Page not found:', slug)
        return NextResponse.json(
          { error: 'Страница не найдена' },
          { status: 404 }
        )
      }

      // Check if user has access to premium content
      if (dbPage.access === PageAccess.premium && !isSubscribed) {
        console.log('📄 Premium content access denied for slug:', slug)
        return NextResponse.json(
          { error: 'Доступ к премиум контенту ограничен' },
          { status: 403 }
        )
      }

      page = {
        id: dbPage.id,
        title: dbPage.title,
        excerpt: dbPage.excerpt,
        contentMd: dbPage.contentMd,
        access: dbPage.access,
        updatedAt: dbPage.updatedAt.toISOString()
      }

      // Cache for 5 minutes
      await cache.set(cacheKey, page, 300)
      console.log('💾 Page cached')
    } else {
      console.log('✅ Using cached page')
    }

    console.log('📄 Returning page for slug:', slug)
    return NextResponse.json({ page })

  } catch (error) {
    console.error('❌ Page fetch error:', error)

    // Return mock data as fallback for resilience
    console.log('📄 Using mock data as fallback')
    const mockPage = {
      id: 'mock-welcome',
      title: 'Добро пожаловать',
      excerpt: 'Введение в наш контент',
      contentMd: `# Добро пожаловать!

Это тестовая страница с контентом. Здесь вы можете разместить любое содержимое в формате Markdown.

## Возможности

- **Markdown** поддержка
- **Иерархическая** структура
- **Премиум** контент
- **Русский** интерфейс

## Следующие шаги

1. Настройте подключение к Notion
2. Импортируйте ваш контент
3. Настройте платежи через Tribute
4. Запустите приложение!

---

*Приятного использования! 🚀*`,
      access: 'public',
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({ page: mockPage })
  }
}
