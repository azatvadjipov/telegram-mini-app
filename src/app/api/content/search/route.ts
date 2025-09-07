import { NextRequest, NextResponse } from 'next/server'
import { prisma, PageStatus, PageAccess } from '@/lib/prisma'
import { cache } from '@/lib/cache'
import { verifyJWT } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Поисковый запрос должен содержать минимум 2 символа' },
        { status: 400 }
      )
    }

    // Check authorization for premium content access
    const authHeader = request.headers.get('authorization')
    let isSubscribed = false

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const payload = await verifyJWT(token)
      isSubscribed = payload?.isSubscribed || false
    }

    // Check cache first
    const cacheKey = `search:${query}:${isSubscribed}:${limit}`
    let searchResults: any[] = await cache.get(cacheKey)

    if (!searchResults) {
      const searchQuery = query.trim().toLowerCase()

      // Search in pages
      const pages = await prisma.page.findMany({
        where: {
          status: PageStatus.published,
          OR: [
            {
              title: {
                contains: searchQuery,
                mode: 'insensitive'
              }
            },
            {
              excerpt: {
                contains: searchQuery,
                mode: 'insensitive'
              }
            },
            {
              contentMd: {
                contains: searchQuery,
                mode: 'insensitive'
              }
            }
          ],
          // Filter by access level
          ...(isSubscribed ? {} : {
            OR: [
              { access: PageAccess.public },
              { access: PageAccess.premium } // Will be filtered client-side
            ]
          })
        },
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          access: true,
          updatedAt: true,
        },
        orderBy: [
          // Prioritize exact title matches
          {
            title: 'asc'
          },
          {
            updatedAt: 'desc'
          }
        ],
        take: limit,
      })

      // Calculate relevance scores
      const scoredResults = pages.map((page: any) => {
        let score = 0
        const titleLower = page.title.toLowerCase()
        const excerptLower = page.excerpt?.toLowerCase() || ''
        const queryWords = searchQuery.split(/\s+/)

        // Exact title match gets highest score
        if (titleLower.includes(searchQuery)) {
          score += 100
        }

        // Title word matches
        queryWords.forEach(word => {
          if (titleLower.includes(word)) {
            score += 50
          }
          if (excerptLower.includes(word)) {
            score += 20
          }
        })

        // Content matches (lower weight)
        if (page.contentMd.toLowerCase().includes(searchQuery)) {
          score += 10
        }

        return {
          ...page,
          score,
          preview: generatePreview(page.contentMd, searchQuery)
        }
      })

      // Sort by score and title
      searchResults = scoredResults
        .sort((a: any, b: any) => {
          if (a.score !== b.score) {
            return b.score - a.score
          }
          return a.title.localeCompare(b.title)
        })
        .slice(0, limit)

      // Cache for 5 minutes
      await cache.set(cacheKey, searchResults, 300)
    }

    return NextResponse.json({
      query,
      results: searchResults,
      total: (searchResults as any[]).length
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Ошибка при выполнении поиска' },
      { status: 500 }
    )
  }
}

function generatePreview(content: string, query: string): string {
  const words = query.split(/\s+/)
  const sentences = content.split(/[.!?]+/).filter(s => s.trim())

  // Find sentence containing search terms
  for (const sentence of sentences) {
    const sentenceLower = sentence.toLowerCase()
    if (words.some(word => sentenceLower.includes(word))) {
      // Clean and truncate sentence
      let preview = sentence.trim()
      if (preview.length > 200) {
        preview = preview.substring(0, 200) + '...'
      }
      return preview
    }
  }

  // Fallback: first non-empty sentence
  for (const sentence of sentences) {
    if (sentence.trim()) {
      let preview = sentence.trim()
      if (preview.length > 200) {
        preview = preview.substring(0, 200) + '...'
      }
      return preview
    }
  }

  return ''
}
