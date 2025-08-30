import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🔍 Debug: Testing database connection...')

    // Use raw SQL to avoid prepared statement conflicts
    const testResult = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "Page" LIMIT 1
    ` as any[]

    console.log('✅ Database connection test: Found', testResult[0]?.count || 0, 'pages')

    // Get sample data using raw SQL
    const samplePages = await prisma.$queryRaw`
      SELECT id, title, slug, status, access, "updatedAt"
      FROM "Page"
      LIMIT 2
    ` as any[]

    const sampleSettings = await prisma.$queryRaw`
      SELECT key, value
      FROM "Setting"
      LIMIT 3
    ` as any[]

    return NextResponse.json({
      success: true,
      database: {
        connected: true,
        counts: {
          pages: parseInt(testResult[0]?.count || '0'),
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
