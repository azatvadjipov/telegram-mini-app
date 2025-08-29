import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cache } from '@/lib/cache'
import { verifyJWT } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    // Check authorization
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const payload = await verifyJWT(token)

    if (!payload?.isSubscribed) {
      return NextResponse.json(
        { error: 'Требуется активная подписка' },
        { status: 403 }
      )
    }

    // Check cache
    const cacheKey = 'content:tree'
    let contentTree = await cache.get(cacheKey)

    if (!contentTree) {
      // Fetch from database
      const pages = await prisma.page.findMany({
        where: {
          status: 'published',
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
          { title: 'asc' },
        ],
      })

      // Build hierarchical tree
      contentTree = buildContentTree(pages)

      // Cache for 60 seconds
      await cache.set(cacheKey, contentTree, 60)
    }

    return NextResponse.json({ tree: contentTree })

  } catch (error) {
    console.error('Content tree fetch error:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении дерева контента' },
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
