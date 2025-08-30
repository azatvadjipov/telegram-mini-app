import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    console.log('🌱 Starting database seeding...')

    // Создаем тестовые настройки
    const settings = [
      { key: 'site_title', value: 'Telegram Mini App' },
      { key: 'site_description', value: 'Гейтед контент для подписчиков' },
      { key: 'support_email', value: 'support@example.com' },
    ]

    for (const setting of settings) {
      await prisma.setting.upsert({
        where: { key: setting.key },
        update: setting,
        create: setting,
      })
    }

    // Создаем тестовые страницы
    const pages = [
      {
        slug: 'welcome',
        title: 'Добро пожаловать',
        excerpt: 'Введение в наш контент',
        contentMd: `# Добро пожаловать!

Это тестовая страница с контентом. Здесь вы можете разместить любое содержимое в формате Markdown.

## Возможности

- **Markdown** поддержка
- **Иерархическая** структура
- **Премиум** контент
- **Русский** интерфейс

## Следующие шаги

1. Настройте подключение к Notion
2. Импортируйте ваш контент
3. Настройте платежи через Tribute
4. Запустите приложение!

---

*Приятного использования! 🚀*`,
        status: 'published',
        access: 'public',
        sort: 0,
      },
      {
        slug: 'premium-content',
        title: 'Премиум контент',
        excerpt: 'Эксклюзивный контент для подписчиков',
        contentMd: `# Премиум контент

🎉 **Поздравляем!** Вы имеете доступ к премиум контенту.

## Эксклюзивные материалы

Этот раздел содержит материалы, доступные только подписчикам.

### Преимущества подписки

- ✅ Доступ ко всему контенту
- ✅ Регулярные обновления
- ✅ Приоритетная поддержка
- ✅ Эксклюзивные материалы

---

*Спасибо за поддержку! 💝*`,
        status: 'published',
        access: 'premium',
        sort: 1,
      },
    ]

    for (const page of pages) {
      await prisma.page.upsert({
        where: { slug: page.slug },
        update: page,
        create: page,
      })
    }

    // Создаем тестового пользователя
    await prisma.userAccess.upsert({
      where: { telegramUserId: '123456789' },
      update: {
        isActive: true,
        updatedAt: new Date(),
      },
      create: {
        telegramUserId: '123456789',
        isActive: true,
      },
    })

    console.log('✅ Database seeding completed')

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        settingsCreated: settings.length,
        pagesCreated: pages.length,
        usersCreated: 1,
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Seeding error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Seeding failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to seed database',
    endpoint: '/api/admin/seed',
    method: 'POST',
    note: 'This will create test data in your database'
  })
}
