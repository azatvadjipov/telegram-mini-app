import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST() {
  try {
    console.log('🚀 Starting database migration...')

    // Запускаем миграции Prisma
    const { stdout, stderr } = await execAsync('npx prisma migrate deploy')

    console.log('✅ Migration stdout:', stdout)
    if (stderr) {
      console.log('ℹ️ Migration stderr:', stderr)
    }

    return NextResponse.json({
      success: true,
      message: 'Database migration completed successfully',
      output: stdout,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Migration error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Migration failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to run database migration',
    endpoint: '/api/admin/migrate',
    method: 'POST',
    note: 'This will run: npx prisma migrate deploy'
  })
}
