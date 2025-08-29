'use client'

import { useState, useMemo, useEffect } from 'react'
import { ChevronRight, ChevronDown, FileText, Folder, Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { messages } from '@/lib/messages'

interface User {
  id: number
  first_name: string
  last_name?: string
  username?: string
}

interface ContentTreeItem {
  id: string
  title: string
  slug: string
  excerpt?: string
  access: 'public' | 'premium'
  children: ContentTreeItem[]
}

interface SearchResult {
  id: string
  slug: string
  title: string
  excerpt?: string
  access: 'public' | 'premium'
  score: number
  preview: string
  updatedAt: string
}

interface ContentSidebarProps {
  contentTree: ContentTreeItem[]
  selectedSlug: string
  onSelectSlug: (slug: string) => void
  user: User
  sessionJWT?: string
}

export function ContentSidebar({ contentTree, selectedSlug, onSelectSlug, user, sessionJWT }: ContentSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    const searchTimeout = setTimeout(async () => {
      setIsSearching(true)
      try {
        const response = await fetch(`/api/content/search?q=${encodeURIComponent(searchQuery)}&limit=10`, {
          headers: sessionJWT ? {
            'Authorization': `Bearer ${sessionJWT}`,
          } : {},
        })

        if (response.ok) {
          const data = await response.json()
          setSearchResults(data.results || [])
          setShowSearchResults(true)
        }
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(searchTimeout)
  }, [searchQuery, sessionJWT])

  const filteredTree = useMemo(() => {
    if (!searchQuery.trim() || showSearchResults) return contentTree

    const filterItems = (items: ContentTreeItem[]): ContentTreeItem[] => {
      return items
        .map(item => ({
          ...item,
          children: filterItems(item.children),
        }))
        .filter(item => {
          const matchesTitle = item.title.toLowerCase().includes(searchQuery.toLowerCase())
          const matchesExcerpt = item.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
          const hasMatchingChildren = item.children.length > 0

          return matchesTitle || matchesExcerpt || hasMatchingChildren
        })
    }

    return filterItems(contentTree)
  }, [contentTree, searchQuery, showSearchResults])

  const handleItemSelect = (item: ContentTreeItem) => {
    onSelectSlug(item.slug)
  }

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  const renderTreeItem = (item: ContentTreeItem, level = 0) => {
    const hasChildren = item.children.length > 0
    const isExpanded = expandedItems.has(item.id)
    const isSelected = selectedSlug === item.slug

    return (
      <div key={item.id}>
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-accent rounded-md transition-colors',
            isSelected && 'bg-accent text-accent-foreground',
            level > 0 && 'ml-4'
          )}
          onClick={() => handleItemSelect(item)}
        >
          {hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              className="w-4 h-4 p-0"
              onClick={(e) => {
                e.stopPropagation()
                toggleExpanded(item.id)
              }}
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </Button>
          ) : (
            <div className="w-4" />
          )}

          {hasChildren ? (
            <Folder className="w-4 h-4 text-muted-foreground" />
          ) : (
            <FileText className="w-4 h-4 text-muted-foreground" />
          )}

          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{item.title}</div>
            {item.excerpt && (
              <div className="text-xs text-muted-foreground truncate">
                {item.excerpt}
              </div>
            )}
          </div>

          {item.access === 'premium' && (
            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
              PRO
            </span>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-2">
            {item.children.map(child => renderTreeItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-80 bg-card border-r border-border flex flex-col">
      {/* User info header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
            {user.first_name[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{user.first_name}</div>
            {user.username && (
              <div className="text-xs text-muted-foreground truncate">
                @{user.username}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder={messages.nav.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 w-6 h-6 p-0"
              onClick={() => {
                setSearchQuery('')
                setSearchResults([])
                setShowSearchResults(false)
              }}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
          {isSearching && (
            <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Content tree or search results */}
      <div className="flex-1 overflow-auto">
        {showSearchResults ? (
          <div className="p-2">
            <div className="mb-2 px-2 py-1 text-xs text-muted-foreground bg-muted rounded">
              Найдено результатов: {searchResults.length}
            </div>
            <div className="space-y-1">
              {searchResults.length > 0 ? (
                searchResults.map((result) => (
                  <div
                    key={result.id}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors',
                      selectedSlug === result.slug && 'bg-accent'
                    )}
                    onClick={() => {
                      onSelectSlug(result.slug)
                      setShowSearchResults(false)
                    }}
                  >
                    <FileText className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">{result.title}</h4>
                        {result.access === 'premium' && (
                          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded flex-shrink-0">
                            PRO
                          </span>
                        )}
                      </div>
                      {result.preview && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {result.preview}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <div className="text-sm">Ничего не найдено</div>
                  <div className="text-xs mt-1">Попробуйте изменить запрос</div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-2">
            <div className="space-y-1">
              {filteredTree.length > 0 ? (
                <div>
                  {filteredTree.map(item => renderTreeItem(item))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <div className="text-sm">{messages.tree.empty}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
