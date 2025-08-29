'use client'

import { useEffect, useState } from 'react'
import { TelegramMiniApp } from '@/components/TelegramMiniApp'

export default function Home() {
  const [isTelegram, setIsTelegram] = useState(false)
  const [initData, setInitData] = useState<string | null>(null)

  useEffect(() => {
    // Check if we're in Telegram WebApp
    const checkTelegramWebApp = () => {
      const urlParams = new URLSearchParams(window.location.hash.substring(1))
      const tgWebAppData = urlParams.get('tgWebAppData')

      if (tgWebAppData) {
        setIsTelegram(true)
        setInitData(decodeURIComponent(tgWebAppData))
      } else if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
        // Fallback for direct Telegram WebApp access
        const webApp = (window as any).Telegram.WebApp
        if (webApp.initData) {
          setIsTelegram(true)
          setInitData(webApp.initData)
        }
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
