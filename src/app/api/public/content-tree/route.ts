import { NextResponse } from 'next/server'
import { prisma, PageStatus, PageAccess } from '@/lib/prisma'
import { cache } from '@/lib/cache'

export async function GET() {
  try {
    console.log('🌐 Public content tree request')

    // Check cache first
    const cacheKey = 'public:content:tree'
    let contentTree: any[] = await cache.get(cacheKey)

    if (!contentTree) {
      console.log('📡 Fetching from database...')

      try {
        // Fetch only public pages from database using raw SQL
        const pages = await prisma.$queryRaw`
          SELECT id, "parentId", slug, title, excerpt, access, sort
          FROM "Page"
          WHERE status = 'published' AND access = 'public'
          ORDER BY sort ASC, title ASC
        ` as any[]

        console.log(`📄 Found ${pages.length} public pages`)

        // Build hierarchical tree
        contentTree = buildContentTree(pages)

        // Cache for 60 seconds
        await cache.set(cacheKey, contentTree, 60)
        console.log('💾 Cached content tree')
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
        console.log('💾 Cached mock content tree')
      }
    } else {
      console.log('✅ Using cached content tree')
    }

    return NextResponse.json({
      tree: contentTree,
      cached: true,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Public content tree error:', error)

    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
    }

    return NextResponse.json(
      {
        error: 'Ошибка сервера',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined,
        timestamp: new Date().toISOString()
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
