'use client'

import { useEffect, useState } from 'react'
import { LoadingSpinner } from './LoadingSpinner'
import { messages } from '@/lib/messages'
import { env } from '@/lib/env'

export function UpsellView() {
  const [isLoading, setIsLoading] = useState(true)
  const [iframeError, setIframeError] = useState(false)

  // Use the configured upsell URL
  const upsellUrl = env.TILDA_UPSELL_URL

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleIframeError = () => {
    setIframeError(true)
    setIsLoading(false)
  }

  if (iframeError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
        <div className="text-destructive mb-4 text-2xl">⚠️</div>
        <h2 className="text-lg font-semibold mb-2">{messages.upsell.title}</h2>
        <p className="text-muted-foreground mb-4">{messages.upsell.description}</p>
        <a
          href={upsellUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          {messages.upsell.subscribeNow}
        </a>
      </div>
    )
  }

  return (
    <div className="relative h-screen w-screen">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
          <LoadingSpinner size="lg" />
          <span className="ml-2">{messages.upsell.loading}</span>
        </div>
      )}
      <iframe
        src={upsellUrl}
        className="w-full h-full border-0"
        onLoad={() => setIsLoading(false)}
        onError={handleIframeError}
        title={messages.upsell.title}
        allow="payment"
      />
    </div>
  )
}
