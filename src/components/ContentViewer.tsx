'use client'

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import rehypePrism from 'rehype-prism-plus'
import { LoadingSpinner } from './LoadingSpinner'
import { UpsellView } from './UpsellView'
import { messages } from '@/lib/messages'
import { cn } from '@/lib/utils'

interface ContentViewerProps {
  slug: string
  sessionJWT: string
}

interface PageData {
  id: string
  title: string
  excerpt?: string
  contentMd: string
  access: 'public' | 'premium'
  updatedAt: string
}

export function ContentViewer({ slug, sessionJWT }: ContentViewerProps) {
  const [page, setPage] = useState<PageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showUpsell, setShowUpsell] = useState(false)

  useEffect(() => {
    const fetchPage = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/content/page?slug=${encodeURIComponent(slug)}`, {
          headers: {
            'Authorization': `Bearer ${sessionJWT}`,
          },
        })

        if (response.status === 404) {
          setError(messages.content.notFound)
          return
        }



        if (!response.ok) {
          throw new Error(messages.errors.serverError)
        }

        const data = await response.json()
        setPage(data.page)

        // Check if this is premium content and user doesn't have access
        // In development mode, we always have access to premium content
        if (data.page.access === 'premium' && !sessionJWT && typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
          setShowUpsell(true)
          setIsLoading(false)
          return
        }
      } catch (err) {
        console.error('Error fetching page:', err)
        setError(err instanceof Error ? err.message : messages.errors.unknownError)
      } finally {
        setIsLoading(false)
      }
    }

    if (slug) {
      fetchPage()
    }
  }, [slug, sessionJWT])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
        <span className="ml-2">{messages.content.loading}</span>
      </div>
    )
  }

  if (showUpsell) {
    return <UpsellView />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="text-destructive mb-4 text-2xl">
          {error === messages.content.notFound ? '📄' : '🚫'}
        </div>
        <h2 className="text-lg font-semibold mb-2">
          {error === messages.content.notFound ? messages.content.notFound : messages.content.accessDenied}
        </h2>
        <p className="text-muted-foreground">
          {error === messages.content.notFound
            ? messages.content.emptyMessage
            : messages.content.accessDeniedMessage
          }
        </p>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="text-muted-foreground mb-4 text-2xl">📄</div>
        <h2 className="text-lg font-semibold mb-2">{messages.content.empty}</h2>
        <p className="text-muted-foreground">{messages.content.emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">{page.title}</h1>
          {page.excerpt && (
            <p className="text-lg text-muted-foreground mb-4">{page.excerpt}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {page.access === 'premium' && (
              <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                Премиум контент
              </span>
            )}
            <span>
              Обновлено: {new Date(page.updatedAt).toLocaleDateString('ru-RU')}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <ReactMarkdown
            rehypePlugins={[
              rehypeRaw,
              rehypeSanitize,
              [rehypePrism, { showLineNumbers: true }]
            ]}
            components={{
              h1: ({ children, ...props }) => (
                <h1 className="text-2xl font-bold mb-4 mt-8 first:mt-0" {...props}>
                  {children}
                </h1>
              ),
              h2: ({ children, ...props }) => (
                <h2 className="text-xl font-semibold mb-3 mt-6" {...props}>
                  {children}
                </h2>
              ),
              h3: ({ children, ...props }) => (
                <h3 className="text-lg font-medium mb-2 mt-4" {...props}>
                  {children}
                </h3>
              ),
              p: ({ children, ...props }) => (
                <p className="mb-4 leading-relaxed" {...props}>
                  {children}
                </p>
              ),
              ul: ({ children, ...props }) => (
                <ul className="mb-4 ml-6 list-disc" {...props}>
                  {children}
                </ul>
              ),
              ol: ({ children, ...props }) => (
                <ol className="mb-4 ml-6 list-decimal" {...props}>
                  {children}
                </ol>
              ),
              li: ({ children, ...props }) => (
                <li className="mb-1" {...props}>
                  {children}
                </li>
              ),
              blockquote: ({ children, ...props }) => (
                <blockquote className="border-l-4 border-primary/20 pl-4 py-2 my-4 bg-muted/50 rounded-r-md" {...props}>
                  {children}
                </blockquote>
              ),
              code: ({ className, children, ...props }) => {
                const isInline = !className
                return isInline ? (
                  <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                    {children}
                  </code>
                ) : (
                  <code className={cn('block', className)} {...props}>
                    {children}
                  </code>
                )
              },
              pre: ({ children, ...props }) => (
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4" {...props}>
                  {children}
                </pre>
              ),
              a: ({ children, href, ...props }) => (
                <a
                  className="text-primary hover:text-primary/80 underline"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  {...props}
                >
                  {children}
                </a>
              ),
              table: ({ children, ...props }) => (
                <div className="overflow-x-auto mb-4">
                  <table className="min-w-full border-collapse border border-border" {...props}>
                    {children}
                  </table>
                </div>
              ),
              th: ({ children, ...props }) => (
                <th className="border border-border px-4 py-2 bg-muted font-semibold text-left" {...props}>
                  {children}
                </th>
              ),
              td: ({ children, ...props }) => (
                <td className="border border-border px-4 py-2" {...props}>
                  {children}
                </td>
              ),
            }}
          >
            {page.contentMd}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
