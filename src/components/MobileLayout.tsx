'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ContentSidebar } from './ContentSidebar'
import { ContentViewer } from './ContentViewer'
import { cn } from '@/lib/utils'

interface ContentTreeItem {
  id: string
  title: string
  slug: string
  excerpt?: string
  access: 'public' | 'premium'
  children: ContentTreeItem[]
}

interface User {
  id: number
  first_name: string
  last_name?: string
  username?: string
}

interface MobileLayoutProps {
  contentTree: ContentTreeItem[]
  selectedSlug: string
  onSelectSlug: (slug: string) => void
  sessionJWT: string
  user?: User
}

export function MobileLayout({
  contentTree,
  selectedSlug,
  onSelectSlug,
  sessionJWT,
  user = { id: 123456789, first_name: 'Test', username: 'testuser' }
}: MobileLayoutProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSelectSlug = (slug: string) => {
    onSelectSlug(slug)
    setIsOpen(false) // Закрыть drawer после выбора
  }

  return (
    <div className="h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="p-2">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <div className="h-full">
              <ContentSidebar
                contentTree={contentTree}
                selectedSlug={selectedSlug}
                onSelectSlug={handleSelectSlug}
                user={user}
                sessionJWT={sessionJWT}
              />
            </div>
          </SheetContent>
        </Sheet>

        <h1 className="text-lg font-semibold">Контент</h1>

        <div className="w-9" /> {/* Spacer for centering */}
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex h-screen">
        <ContentSidebar
          contentTree={contentTree}
          selectedSlug={selectedSlug}
          onSelectSlug={onSelectSlug}
          user={user}
          sessionJWT={sessionJWT}
        />
        <div className="flex-1 overflow-hidden">
          <ContentViewer
            slug={selectedSlug}
            sessionJWT={sessionJWT}
          />
        </div>
      </div>

      {/* Mobile Content */}
      <div className="lg:hidden h-[calc(100vh-73px)] overflow-hidden">
        <ContentViewer
          slug={selectedSlug}
          sessionJWT={sessionJWT}
        />
      </div>
    </div>
  )
}
