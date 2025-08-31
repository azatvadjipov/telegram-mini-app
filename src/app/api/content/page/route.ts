import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('📄 Page request started')

    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json(
        { error: 'Параметр slug обязателен' },
        { status: 400 }
      )
    }

    console.log('📄 Requested slug:', slug)

    // Return mock data based on slug - no database queries or JWT verification
    let page;

    if (slug === 'welcome') {
      page = {
        id: 'mock-welcome',
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
        access: 'public',
        updatedAt: new Date().toISOString()
      }
    } else if (slug === 'premium-content') {
      page = {
        id: 'mock-premium',
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
        access: 'premium',
        updatedAt: new Date().toISOString()
      }
    } else {
      return NextResponse.json(
        { error: 'Страница не найдена' },
        { status: 404 }
      )
    }

    console.log('📄 Returning mock page for slug:', slug)
    return NextResponse.json({ page })

  } catch (error) {
    console.error('❌ Page fetch error:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении страницы' },
      { status: 500 }
    )
  }
}
