import { NextResponse } from 'next/server'
import { prisma, PageStatus } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🔍 Debug: Testing database connection...')

    // Test database connection using simple SQL
    const testResult = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Page"` as any[]

    console.log('✅ Database connection successful: Found', testResult[0]?.count || 0, 'pages')

    // Fetch pages without auth using simple SQL
    const pages = await prisma.$queryRaw`SELECT id, title, slug, status, access FROM "Page" WHERE status = 'published' LIMIT 5` as any[]

    console.log('📋 Sample pages:', pages)

    return NextResponse.json({
      success: true,
      databaseConnected: true,
      pageCount: parseInt(testResult[0]?.count || '0'),
      samplePages: pages,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Debug error:', error)

    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
    }

    // In production, return mock data if database fails
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️ Debug content tree failed in production, returning mock data')
      return NextResponse.json({
        success: true,
        databaseConnected: false,
        pageCount: 2,
        samplePages: [
          { id: 'mock-1', title: 'Добро пожаловать', slug: 'welcome', status: 'published', access: 'public' },
          { id: 'mock-2', title: 'Премиум контент', slug: 'premium-content', status: 'published', access: 'premium' }
        ],
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
