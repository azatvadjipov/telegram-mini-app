import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create some sample pages
  const pages = [
    {
      slug: 'welcome',
      title: 'Добро пожаловать',
      excerpt: 'Введение в наш контент',
      contentMd: `# Добро пожаловать!

Это пример страницы с контентом. Здесь вы можете разместить любое содержимое в формате Markdown.

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
      status: 'published' as const,
      access: 'public' as const,
      sort: 0,
    },
    {
      slug: 'getting-started',
      title: 'Начало работы',
      excerpt: 'Как начать использовать приложение',
      contentMd: `# Начало работы

## Установка

\`\`\`bash
npm install
npm run prisma:generate
npm run prisma:migrate
\`\`\`

## Настройка

1. Скопируйте \`env.template\` в \`.env\`
2. Заполните все необходимые переменные окружения
3. Запустите импорт контента из Notion:

\`\`\`bash
npm run import:notion
\`\`\`

## Запуск

\`\`\`bash
npm run dev
\`\`\`

Откройте [http://localhost:3000](http://localhost:3000) в браузере.`,
      status: 'published' as const,
      access: 'public' as const,
      sort: 1,
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
      status: 'published' as const,
      access: 'premium' as const,
      sort: 2,
    },
  ]

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: page,
      create: page,
    })
  }

  // Create sample settings
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

  console.log('✅ Database seeded successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
