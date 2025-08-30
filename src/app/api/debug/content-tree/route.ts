import { NextResponse } from 'next/server'
import { prisma, PageStatus } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🔍 Debug: Testing database connection...')

    // Test database connection - use findFirst instead of count
    const testPage = await prisma.page.findFirst({
      select: { id: true }
    })
    console.log('✅ Database connection successful:', testPage ? 'Found pages' : 'No pages found')

    // Fetch pages without auth
    const pages = await prisma.page.findMany({
      where: {
        status: PageStatus.published,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        access: true,
      },
      take: 5, // Limit for debugging
    })

    console.log('📋 Sample pages:', pages)

    return NextResponse.json({
      success: true,
      databaseConnected: true,
      pageCount: pages.length,
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
