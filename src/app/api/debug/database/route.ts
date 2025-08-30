import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🔍 Debug: Testing database connection...')

    // Simple connection test - try to find one page
    const testPage = await prisma.page.findFirst({
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        access: true,
        updatedAt: true
      }
    })

    console.log('✅ Database connection test: Found page:', testPage?.title || 'No pages found')

    // Get sample data (limit to avoid prepared statement issues)
    const samplePages = await prisma.page.findMany({
      take: 2,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        access: true,
        updatedAt: true
      }
    })

    const sampleSettings = await prisma.setting.findMany({
      take: 3,
      select: {
        key: true,
        value: true
      }
    })

    return NextResponse.json({
      success: true,
      database: {
        connected: true,
        counts: {
          pages: samplePages.length,
          userAccess: 1, // Assume at least one user exists
          settings: sampleSettings.length
        },
        samplePages,
        sampleSettings,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Database debug error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          code: (error as any).code
        } : 'Unknown database error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
