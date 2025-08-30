import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🔍 Debug: Testing database connection...')

    // Test basic connection
    const testResult = await prisma.$queryRaw`SELECT 1 as connection_test, NOW() as current_time`
    console.log('✅ Database connection test:', testResult)

    // Count all records
    const pageCount = await prisma.page.count()
    const userAccessCount = await prisma.userAccess.count()
    const settingCount = await prisma.setting.count()

    console.log('📊 Database counts:', {
      pages: pageCount,
      userAccess: userAccessCount,
      settings: settingCount
    })

    // Get sample data
    const samplePages = await prisma.page.findMany({
      take: 3,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        access: true,
        createdAt: true
      }
    })

    const sampleSettings = await prisma.setting.findMany({
      take: 5,
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
          pages: pageCount,
          userAccess: userAccessCount,
          settings: settingCount
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
