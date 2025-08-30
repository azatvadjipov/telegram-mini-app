import { NextRequest, NextResponse } from 'next/server'
import { prisma, PageStatus } from '@/lib/prisma'
import { cache } from '@/lib/cache'
import { verifyJWT } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    console.log('🌳 Content tree request started')

    // Check authorization
    const authHeader = request.headers.get('authorization')
    console.log('🔑 Auth header present:', !!authHeader)

    if (!authHeader?.startsWith('Bearer ')) {
      console.log('❌ No Bearer token in auth header')
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    console.log('🔑 Token extracted, verifying JWT...')

    const payload = await verifyJWT(token)
    console.log('🔑 JWT payload:', { isSubscribed: payload?.isSubscribed, telegramUserId: payload?.telegramUserId })

    if (!payload?.isSubscribed) {
      console.log('❌ User not subscribed')
      return NextResponse.json(
        { error: 'Требуется активная подписка' },
        { status: 403 }
      )
    }

    console.log('✅ Authorization passed')

    // Check cache
    const cacheKey = 'content:tree'
    console.log('💾 Checking cache for key:', cacheKey)

    let contentTree: any[] = await cache.get(cacheKey)
    console.log('💾 Cache result:', contentTree ? 'HIT' : 'MISS')

    if (!contentTree) {
      console.log('📡 Cache miss, fetching from database...')
      try {
        console.log('🗄️ Executing raw SQL query...')
        // Fetch from database using raw SQL to avoid prepared statement issues
        const pages = await prisma.$queryRaw`
          SELECT id, "parentId", slug, title, excerpt, access, sort
          FROM "Page"
          WHERE status = 'published'
          ORDER BY sort ASC, title ASC
        ` as any[]

        console.log('🗄️ Raw SQL query completed, found', pages.length, 'pages')

        // Build hierarchical tree
        console.log('🌳 Building content tree...')
        contentTree = buildContentTree(pages)
        console.log('🌳 Content tree built with', (contentTree as any[]).length, 'root pages')

        // Cache for 60 seconds
        console.log('💾 Caching result for 60 seconds...')
        await cache.set(cacheKey, contentTree, 60)
        console.log('💾 Cache set successfully')
      } catch (dbError) {
        console.error('❌ Database query failed, using mock data:', dbError)

        // Return mock data for resilience
        contentTree = [
          {
            id: 'mock-welcome',
            parentId: null,
            slug: 'welcome',
            title: 'Добро пожаловать',
            excerpt: 'Введение в наш контент',
            access: 'public',
            sort: 0,
            children: []
          },
          {
            id: 'mock-premium',
            parentId: null,
            slug: 'premium-content',
            title: 'Премиум контент',
            excerpt: 'Эксклюзивный контент для подписчиков',
            access: 'premium',
            sort: 1,
            children: []
          }
        ]

        // Cache mock data for 30 seconds
        console.log('💾 Caching mock data for 30 seconds...')
        await cache.set(cacheKey, contentTree, 30)
        console.log('💾 Mock data cached successfully')
      }
    }

    console.log('✅ Content tree ready, returning response')

    console.log('📤 Returning response with', (contentTree as any[]).length, 'root pages')
    return NextResponse.json({ tree: contentTree })

  } catch (error) {
    console.error('❌ Content tree fetch error:', error)

    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }

    return NextResponse.json(
      {
        error: 'Ошибка сервера',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined
      },
      { status: 500 }
    )
  }
}

function buildContentTree(pages: any[]): any[] {
  const pageMap = new Map()
  const rootPages: any[] = []

  // Create a map of pages by ID
  pages.forEach(page => {
    pageMap.set(page.id, { ...page, children: [] })
  })

  // Build the tree structure
  pages.forEach(page => {
    const pageWithChildren = pageMap.get(page.id)

    if (page.parentId) {
      const parent = pageMap.get(page.parentId)
      if (parent) {
        parent.children.push(pageWithChildren)
        // Sort children by sort order
        parent.children.sort((a: any, b: any) => a.sort - b.sort)
      }
    } else {
      rootPages.push(pageWithChildren)
    }
  })

  return rootPages
}
