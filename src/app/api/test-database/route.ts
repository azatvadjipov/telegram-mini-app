import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Показываем текущие переменные окружения (только в development)
    const envInfo = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
      DATABASE_URL_PREFIX: process.env.DATABASE_URL?.substring(0, 20) + '...',
      TELEGRAM_BOT_TOKEN_EXISTS: !!process.env.TELEGRAM_BOT_TOKEN,
      TRIBUTE_API_BASE_EXISTS: !!process.env.TRIBUTE_API_BASE,
      NOTION_TOKEN_EXISTS: !!process.env.NOTION_TOKEN,
      NOTION_DATABASE_ID_EXISTS: !!process.env.NOTION_DATABASE_ID,
      JWT_SECRET_EXISTS: !!process.env.JWT_SECRET,
    }

    return NextResponse.json({
      success: true,
      message: 'Environment variables check',
      environment: process.env.NODE_ENV === 'development' ? envInfo : 'Production mode - variables hidden',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
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
