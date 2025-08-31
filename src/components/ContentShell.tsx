'use client'

import { useEffect, useState } from 'react'
import { ContentViewer } from './ContentViewer'
import { LoadingSpinner } from './LoadingSpinner'
import { messages } from '@/lib/messages'
import { MobileLayout } from './MobileLayout'

interface User {
  id: number
  first_name: string
  last_name?: string
  username?: string
}

interface ContentShellProps {
  sessionJWT: string
  user: User
}

interface ContentTreeItem {
  id: string
  title: string
  slug: string
  excerpt?: string
  access: 'public' | 'premium'
  children: ContentTreeItem[]
}

export function ContentShell({ sessionJWT, user }: ContentShellProps) {
  const [contentTree, setContentTree] = useState<ContentTreeItem[]>([])
  const [selectedSlug, setSelectedSlug] = useState<string>('welcome')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchContentTree = async () => {
      try {
        const response = await fetch('/api/content/tree', {
          headers: {
            'Authorization': `Bearer ${sessionJWT}`,
          },
        })

        if (!response.ok) {
          throw new Error(messages.errors.serverError)
        }

        const data = await response.json()
        setContentTree(data.tree || [])

        // Auto-select first item if no specific page is requested
        if (data.tree && data.tree.length > 0) {
          setSelectedSlug(data.tree[0].slug)
        }
      } catch (err) {
        console.error('Error fetching content tree:', err)
        setError(err instanceof Error ? err.message : messages.errors.unknownError)
      } finally {
        setIsLoading(false)
      }
    }

    fetchContentTree()
  }, [sessionJWT])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
        <span className="ml-2">{messages.tree.loading}</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
        <div className="text-destructive mb-4 text-2xl">⚠️</div>
        <h2 className="text-lg font-semibold mb-2">Ошибка</h2>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <MobileLayout
      contentTree={contentTree}
      selectedSlug={selectedSlug}
      onSelectSlug={setSelectedSlug}
      sessionJWT={sessionJWT}
    />
  )
}
