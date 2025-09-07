import { NextRequest, NextResponse } from 'next/server'
import { prisma, PageStatus, PageAccess } from '@/lib/prisma'
import { cache } from '@/lib/cache'
import { verifyJWT } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    console.log('🌳 Content tree request started')

    // Check authorization for premium content access
    const authHeader = request.headers.get('authorization')
    let isSubscribed = false

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      try {
        const payload = await verifyJWT(token)
        isSubscribed = payload?.isSubscribed || false
        console.log('🌳 User subscription status:', isSubscribed)
      } catch (error) {
        console.log('🌳 JWT verification failed:', error)
      }
    }

    // Check cache first
    const cacheKey = `tree:${isSubscribed}`
    let contentTree: any[] | null = await cache.get(cacheKey)

    if (!contentTree) {
      console.log('📡 Fetching content tree from database...')

      try {
        // Fetch pages from database
        const pages = await prisma.page.findMany({
          where: {
            status: PageStatus.published,
            // Filter by access level
            ...(isSubscribed ? {} : {
              access: PageAccess.public
            })
          },
          select: {
            id: true,
            parentId: true,
            slug: true,
            title: true,
            excerpt: true,
            access: true,
            sort: true,
          },
          orderBy: [
            { sort: 'asc' },
            { title: 'asc' }
          ],
        })

        console.log(`📄 Found ${pages.length} pages`)

        // Build hierarchical tree
        contentTree = buildContentTree(pages)

        // Cache for 5 minutes
        await cache.set(cacheKey, contentTree, 300)
        console.log('💾 Content tree cached')
      } catch (dbError) {
        console.error('Database query failed, using mock data:', dbError)

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
          }
        ]

        // Cache mock data for 30 seconds
        await cache.set(cacheKey, contentTree, 30)
        console.log('💾 Mock content tree cached')
      }
    } else {
      console.log('✅ Using cached content tree')
    }

    console.log('✅ Returning content tree')
    return NextResponse.json({
      tree: contentTree,
      cached: true,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Content tree error:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
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
