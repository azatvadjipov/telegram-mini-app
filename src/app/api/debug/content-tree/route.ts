import { NextResponse } from 'next/server'
import { prisma, PageStatus } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🔍 Debug: Testing database connection...')

    // Test database connection using raw SQL
    const testResult = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "Page"
    ` as any[]

    console.log('✅ Database connection successful: Found', testResult[0]?.count || 0, 'pages')

    // Fetch pages without auth using raw SQL
    const pages = await prisma.$queryRaw`
      SELECT id, title, slug, status, access
      FROM "Page"
      WHERE status = 'published'
      LIMIT 5
    ` as any[]

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
