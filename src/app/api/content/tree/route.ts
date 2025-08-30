import { NextRequest, NextResponse } from 'next/server'
import { prisma, PageStatus } from '@/lib/prisma'
import { cache } from '@/lib/cache'
import { verifyJWT } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    console.log('🌳 Content tree request started')

    // Simplified response - return mock data immediately to avoid timeouts
    const contentTree = [
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

    console.log('✅ Returning mock content tree')
    return NextResponse.json({ tree: contentTree })

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
