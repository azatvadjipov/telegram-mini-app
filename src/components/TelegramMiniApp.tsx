'use client'

import { useEffect, useState } from 'react'
import { UpsellView } from './UpsellView'
import { ContentShell } from './ContentShell'
import { LoadingSpinner } from './LoadingSpinner'
import { messages } from '@/lib/messages'

interface TelegramMiniAppProps {
  initData: string | null
  isTelegram: boolean
}

interface AuthResponse {
  subscribed: boolean
  sessionJWT?: string
  user?: {
    id: number
    first_name: string
    last_name?: string
    username?: string
  }
}

export function TelegramMiniApp({ initData, isTelegram }: TelegramMiniAppProps) {
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated' | 'error'>('loading')
  const [authData, setAuthData] = useState<AuthResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('🚀 TelegramMiniApp useEffect triggered:', { isTelegram, initData: initData ? 'present' : 'null' })

    if (!isTelegram) {
      console.log('🛠️ Using development mode - generating JWT token')
      // For development/testing outside Telegram - generate real JWT
      const generateDevToken = async () => {
        try {
          console.log('📡 Fetching dev JWT token from /api/debug/auth...')
          const response = await fetch('/api/debug/auth', {
            method: 'GET',
          })
          const data = await response.json()
          console.log('📨 Debug auth response:', { status: response.status, ok: response.ok, hasToken: !!data.token })

          if (response.ok && data.token) {
            setAuthData({
              subscribed: true,
              sessionJWT: data.token,
              user: { id: 123456789, first_name: 'Test', username: 'testuser' }
            })
            setAuthStatus('authenticated')
            console.log('✅ Dev authentication successful')
          } else {
            throw new Error('Failed to generate dev token')
          }
        } catch (error) {
          console.error('❌ Dev token generation failed:', error)
          setAuthStatus('error')
          setError('Не удалось сгенерировать токен разработчика')
        }
      }

      generateDevToken()
      return
    }

    console.log('📱 Using Telegram mode - validating initData')

    if (!initData) {
      setAuthStatus('error')
      setError(messages.auth.invalidData)
      return
    }

    const authenticate = async () => {
      try {
        console.log('📡 Sending Telegram authentication request...')
        console.log('🔑 initData length:', initData?.length || 0)
        console.log('🔑 initData preview:', initData?.substring(0, 100) + '...')

        const response = await fetch('/api/auth/telegram-verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ initData }),
        })

        const data: AuthResponse = await response.json()
        console.log('📨 Telegram auth response:', { status: response.status, ok: response.ok, error: (data as any).error })

        if (!response.ok) {
          throw new Error((data as any).error || messages.auth.error)
        }

        setAuthData(data)
        setAuthStatus(data.subscribed ? 'authenticated' : 'unauthenticated')
        console.log('✅ Telegram authentication successful:', { subscribed: data.subscribed })
      } catch (err) {
        console.error('❌ Authentication error:', err)
        setAuthStatus('error')
        setError(err instanceof Error ? err.message : messages.errors.unknownError)
      }
    }

    authenticate()
  }, [initData, isTelegram])

  if (authStatus === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
        <span className="ml-2">{messages.auth.loading}</span>
      </div>
    )
  }

  if (authStatus === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
        <div className="text-destructive mb-4">⚠️</div>
        <h2 className="text-lg font-semibold mb-2">{messages.auth.error}</h2>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  if (authStatus === 'unauthenticated') {
    return <UpsellView />
  }

  if (authStatus === 'authenticated' && authData) {
    return <ContentShell sessionJWT={authData.sessionJWT!} user={authData.user!} />
  }

  return null
}
