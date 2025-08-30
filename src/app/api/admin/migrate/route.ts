import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    console.log('🚀 Starting database migration...')

    // Создаем таблицы напрямую через Prisma client
    // Это работает лучше в serverless средах, чем npx команды

    // Проверяем, существуют ли таблицы
    const existingTables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('Page', 'Setting', 'UserAccess')
    `

    console.log('📊 Existing tables:', existingTables)

    // Если таблицы уже существуют, просто возвращаем успех
    if (Array.isArray(existingTables) && existingTables.length >= 3) {
      console.log('✅ All tables already exist')
      return NextResponse.json({
        success: true,
        message: 'Database tables already exist',
        tables: existingTables,
        timestamp: new Date().toISOString()
      })
    }

    // Создаем таблицы через SQL
    console.log('🔨 Creating tables...')

    // Создаем enum типы, если они не существуют
    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "PageStatus" AS ENUM('draft', 'published');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `

    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "PageAccess" AS ENUM('public', 'premium');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `

    // Создаем таблицу Setting
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Setting" (
        "key" TEXT NOT NULL,
        "value" TEXT NOT NULL,

        CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
      );
    `

    // Создаем таблицу UserAccess
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "UserAccess" (
        "telegramUserId" TEXT NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT false,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "UserAccess_pkey" PRIMARY KEY ("telegramUserId")
      );
    `

    // Создаем таблицу Page
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Page" (
        "id" TEXT NOT NULL,
        "parentId" VARCHAR(191),
        "slug" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "excerpt" TEXT,
        "contentMd" TEXT NOT NULL,
        "status" "PageStatus" NOT NULL DEFAULT 'published',
        "access" "PageAccess" NOT NULL DEFAULT 'premium',
        "sort" INTEGER NOT NULL DEFAULT 0,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
      );
    `

    // Создаем индексы
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "Page_slug_key" ON "Page"("slug");
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Page_parentId_idx" ON "Page"("parentId");
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Page_status_idx" ON "Page"("status");
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Page_access_idx" ON "Page"("access");
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Page_title_idx" ON "Page"("title");
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Page_status_access_idx" ON "Page"("status", "access");
    `

    console.log('✅ Database migration completed successfully')

    return NextResponse.json({
      success: true,
      message: 'Database migration completed successfully',
      createdTables: ['Setting', 'UserAccess', 'Page'],
      createdIndexes: ['Page_slug_key', 'Page_parentId_idx', 'Page_status_idx', 'Page_access_idx', 'Page_title_idx', 'Page_status_access_idx'],
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Migration error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Migration failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to run database migration',
    endpoint: '/api/admin/migrate',
    method: 'POST',
    note: 'This will create database tables directly using SQL'
  })
}
