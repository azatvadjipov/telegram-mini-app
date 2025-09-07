#!/usr/bin/env tsx

import { Client } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'
import { PrismaClient } from '@prisma/client'
import { env } from '../src/lib/env'
import { cache } from '../src/lib/cache'

// Create Prisma client directly for CLI script
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

const notion = new Client({
  auth: env.NOTION_TOKEN,
})

const n2m = new NotionToMarkdown({ notionClient: notion })

interface NotionPage {
  id: string
  properties: {
    Name: { title: Array<{ plain_text: string }> }
    Slug: { rich_text: Array<{ plain_text: string }> }
    Excerpt: { rich_text: Array<{ plain_text: string }> }
    Status: { select: { name: string } }
    Access: { select: { name: string } }
    Sort: { number: number }
  }
  parent: {
    type: string
    page_id?: string
  }
}

async function getNotionPages(): Promise<NotionPage[]> {
  const response = await notion.databases.query({
    database_id: env.NOTION_DATABASE_ID,
  })

  return response.results as any
}

function extractTextFromProperty(property: any): string {
  if (property.title) {
    return property.title.map((t: any) => t.plain_text).join('')
  }
  if (property.rich_text) {
    return property.rich_text.map((t: any) => t.plain_text).join('')
  }
  return ''
}

async function importNotionPages() {
  console.log('🚀 Starting Notion import...')

  try {
    const pages = await getNotionPages()
    console.log(`📄 Found ${pages.length} pages in Notion`)

    for (const page of pages) {
      const title = extractTextFromProperty(page.properties.Name)
      const slug = extractTextFromProperty(page.properties.Slug) || generateSlug(title)
      const excerpt = extractTextFromProperty(page.properties.Excerpt)
      const status = page.properties.Status?.select?.name === 'Published' ? 'published' : 'draft'
      const access = page.properties.Access?.select?.name === 'Premium' ? 'premium' : 'public'
      const sort = page.properties.Sort?.number || 0

      // Determine parent relationship
      let parentId = null
      if (page.parent.type === 'page_id') {
        // Find parent page in our database
        const parentPage = await prisma.page.findFirst({
          where: { id: page.parent.page_id! },
        })
        parentId = parentPage?.id || null
      }

      // Convert page content to Markdown
      const mdBlocks = await n2m.pageToMarkdown(page.id)
      const contentMd = n2m.toMarkdownString(mdBlocks).parent

      // Upsert page in database
      await prisma.page.upsert({
        where: { slug },
        update: {
          title,
          excerpt,
          contentMd,
          status,
          access,
          sort,
          parentId,
          updatedAt: new Date(),
        },
        create: {
          id: page.id,
          slug,
          title,
          excerpt,
          contentMd,
          status,
          access,
          sort,
          parentId,
        },
      })

      console.log(`✅ Imported: ${title} (${slug})`)
    }

    // Invalidate content cache
    await cache.invalidateContent()

    console.log('🎉 Notion import completed successfully!')

  } catch (error) {
    console.error('❌ Error during Notion import:', error)
    process.exit(1)
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

async function main() {
  await importNotionPages()
  await prisma.$disconnect()
}

if (require.main === module) {
  main()
}
