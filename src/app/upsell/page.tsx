'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { messages } from '@/lib/messages'

export default function UpsellPage() {
  const router = useRouter()

  useEffect(() => {
    // For development, use a placeholder URL
    const upsellUrl = process.env.NEXT_PUBLIC_TILDA_UPSELL_URL || 'https://example.com/upsell'

    // Redirect to the upsell URL after a short delay
    const timer = setTimeout(() => {
      window.location.href = upsellUrl
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
      <LoadingSpinner size="lg" />
      <h2 className="text-lg font-semibold mt-4 mb-2">{messages.upsell.title}</h2>
      <p className="text-muted-foreground">{messages.upsell.description}</p>
      <p className="text-sm text-muted-foreground mt-2">
        Перенаправление на страницу подписки...
      </p>
    </div>
  )
}
