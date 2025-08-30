'use client'

import { useEffect, useState } from 'react'
import { TelegramMiniApp } from '@/components/TelegramMiniApp'

export default function Home() {
  const [isTelegram, setIsTelegram] = useState(false)
  const [initData, setInitData] = useState<string | null>(null)

  useEffect(() => {
    // Check if we're in Telegram WebApp
    const checkTelegramWebApp = () => {
      console.log('🔍 Checking Telegram WebApp environment...')

      const urlParams = new URLSearchParams(window.location.hash.substring(1))
      const tgWebAppData = urlParams.get('tgWebAppData')

      console.log('📋 URL params:', Object.fromEntries(urlParams.entries()))
      console.log('🎯 tgWebAppData from URL:', tgWebAppData)

      if (tgWebAppData) {
        console.log('✅ Using tgWebAppData from URL hash')
        setIsTelegram(true)
        setInitData(decodeURIComponent(tgWebAppData))
      } else if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
        // Fallback for direct Telegram WebApp access
        const webApp = (window as any).Telegram.WebApp
        console.log('🔄 Telegram WebApp found:', { initData: webApp.initData, platform: webApp.platform })

        if (webApp.initData) {
          console.log('✅ Using initData from Telegram WebApp')
          setIsTelegram(true)
          setInitData(webApp.initData)
        } else {
          console.log('⚠️ Telegram WebApp found but no initData')
          setIsTelegram(false)
          setInitData(null)
        }
      } else {
        console.log('❌ No Telegram WebApp detected, using dev mode')
        setIsTelegram(false)
        setInitData(null)
      }
    }

    checkTelegramWebApp()

    // Listen for hash changes (for development/testing)
    const handleHashChange = () => {
      checkTelegramWebApp()
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  return (
    <div className="h-screen w-screen overflow-hidden">
      <TelegramMiniApp initData={initData} isTelegram={isTelegram} />
    </div>
  )
}
