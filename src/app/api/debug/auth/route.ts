import { NextResponse } from 'next/server'
import { signJWT } from '@/lib/jwt'

export async function GET() {
  try {
    console.log('🔐 Debug: Generating test JWT token...')

    // Generate test JWT token
    const testPayload = {
      telegramUserId: '123456789',
      isSubscribed: true
    }

    const token = await signJWT(testPayload)

    console.log('✅ Test JWT token generated successfully')

    return NextResponse.json({
      success: true,
      token,
      payload: testPayload,
      expiresIn: '10 minutes',
      usage: 'Use this token in Authorization header: Bearer ' + token,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ JWT generation error:', error)

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
