# Telegram Mini App - Контент для подписчиков

Полнофункциональное Telegram Mini App с gated контентом для подписчиков, использующее Tribute для управления платежами и Notion для управления контентом.

## 🚀 Возможности

- ✅ **Telegram WebApp** аутентификация и валидация
- ✅ **Tribute API** интеграция для проверки подписок
- ✅ **Notion** импорт контента с преобразованием в Markdown
- ✅ **Иерархическая** структура контента с React Aria TreeView
- ✅ **Markdown** рендеринг с подсветкой синтаксиса
- ✅ **JWT** сессии с коротким сроком жизни
- ✅ **Redis** кэширование (опционально)
- ✅ **Русский** интерфейс по умолчанию
- ✅ **Iframe** fallback для не-подписчиков
- ✅ **Prisma + Supabase** PostgreSQL база данных

## 🛠 Стек технологий

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI**: shadcn/ui, React Aria Components, Lucide Icons
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: Supabase PostgreSQL
- **Authentication**: Telegram WebApp, JWT
- **Payments**: Tribute API (stub implementation)
- **Content**: Notion API, react-markdown
- **Caching**: Redis (опционально)
- **Testing**: Vitest, Testing Library

## 📋 Требования

- Node.js 18+
- PostgreSQL база данных (Supabase)
- Telegram Bot Token
- Notion Integration Token
- Tribute API credentials

## 🚀 Быстрый старт

### 0. Настройка GitHub репозитория

**Вариант 1: Автоматическая настройка**
```bash
# Запустите скрипт настройки (замените YOUR_USERNAME на ваше имя пользователя GitHub)
./setup-github.sh YOUR_USERNAME
```

**Вариант 2: Ручная настройка**
```bash
# Следуйте инструкциям в файле GITHUB_SETUP.md
```

### 1. Клонирование и установка

```bash
git clone <repository-url>
cd telegram-mini-app
npm install
```

### 2. Настройка переменных окружения

Скопируйте файл с шаблоном:

```bash
cp env.template .env.local
```

Заполните переменные в `.env.local`:

```env
# Database
DATABASE_URL="postgresql://username:password@host:5432/database"

# Telegram
TELEGRAM_BOT_TOKEN="your_telegram_bot_token_here"

# Tribute API
TRIBUTE_API_BASE="https://api.tribute.com"
TRIBUTE_API_KEY="your_tribute_api_key_here"
TRIBUTE_CHANNEL_ID="your_tribute_channel_id_here"

# Upsell
TILDA_UPSELL_URL="https://your-tilda-site.com/upsell"

# Notion
NOTION_TOKEN="your_notion_token_here"
NOTION_DATABASE_ID="your_notion_database_id_here"

# Redis (опционально)
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your_secure_jwt_secret_here"
```

### 3. Настройка базы данных

```bash
# Генерация Prisma клиента
npm run prisma:generate

# Применение миграций
npm run prisma:migrate

# Заполнение начальными данными
npm run seed
```

### 4. Импорт контента из Notion

```bash
# Импорт страниц из Notion
npm run import:notion
```

### 5. Запуск в режиме разработки

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## 🧪 Тестирование

```bash
# Запуск всех тестов
npm test

# Запуск с UI
npm run test:ui

# Запуск с покрытием
npm run test:coverage
```

## 📱 Развертывание

### Vercel (рекомендуется)

1. Подключите репозиторий к Vercel
2. Настройте переменные окружения в Vercel Dashboard
3. Деплой произойдет автоматически

### Railway / Render

1. Создайте новое приложение
2. Настройте переменные окружения
3. Подключите PostgreSQL базу данных
4. Запустите команды миграции в пост-билд хуке

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔧 Доступные скрипты

```bash
npm run dev          # Разработка
npm run build        # Сборка для продакшена
npm run start        # Запуск продакшена
npm run lint         # Проверка ESLint

# База данных
npm run prisma:generate  # Генерация Prisma клиента
npm run prisma:migrate   # Применение миграций
npm run prisma:push      # Push схемы (dev)
npm run seed            # Заполнение начальными данными

# Контент
npm run import:notion   # Импорт из Notion

# Тестирование
npm test               # Запуск тестов
npm run test:ui        # Тесты с UI
```

## 🏗 Архитектура

### API Routes

- `POST /api/auth/telegram-verify` - Валидация Telegram и проверка подписки
- `GET /api/content/tree` - Получение дерева контента
- `GET /api/content/page?slug=...` - Получение страницы
- `POST /api/tribute/webhook` - Webhook для обновления подписок

### Компоненты

- `TelegramMiniApp` - Главный компонент приложения
- `ContentShell` - Оболочка для аутентифицированных пользователей
- `ContentSidebar` - Боковая панель с деревом контента
- `ContentViewer` - Просмотрщик Markdown контента
- `UpsellView` - Iframe с предложением подписки

### Утилиты

- `telegram.ts` - Валидация Telegram initData
- `jwt.ts` - Управление JWT токенами
- `tribute.ts` - Клиент Tribute API
- `cache.ts` - Redis кэширование
- `prisma.ts` - Клиент базы данных

## 🔒 Безопасность

- ✅ Валидация Telegram initData только на сервере
- ✅ JWT токены с коротким сроком жизни (10 минут)
- ✅ HMAC-SHA256 для Tribute webhooks
- ✅ Санитизация HTML в Markdown контенте
- ✅ Кэширование с TTL
- ✅ Never expose API keys to client

## 🌐 Локализация

Все тексты интерфейса на русском языке:
- ✅ Сообщения об ошибках
- ✅ Состояния загрузки
- ✅ Подсказки и плейсхолдеры
- ✅ Кнопки и навигация

## 📊 Мониторинг

Рекомендуется настроить:
- **Vercel Analytics** для метрик
- **Sentry** для ошибок
- **LogRocket** для пользовательских сессий
- **UptimeRobot** для мониторинга доступности

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 Лицензия

Этот проект лицензирован под MIT License - смотрите файл [LICENSE](LICENSE) для деталей.

## 📞 Поддержка

Для вопросов и предложений:
- Создайте Issue в GitHub
- Напишите в Telegram: [@your_support_bot]

## 🔍 Поиск по контенту

Приложение включает продвинутую систему поиска:

- **Мгновенный поиск** с debounce (300ms)
- **Релевантность** результатов по заголовкам и содержимому
- **Предварительный просмотр** найденного контента
- **Фильтрация** по уровню доступа (публичный/premium)
- **Кэширование** результатов поиска

### Использование поиска:

1. Введите запрос в поле поиска в боковой панели
2. Результаты появляются автоматически
3. Нажмите на результат для просмотра страницы
4. Используйте кнопку "X" для очистки поиска

## 🚀 Развертывание на Vercel

### 1. Подготовка к развертыванию

```bash
# Проверка типов
npm run type-check

# Проверка линтера
npm run lint

# Сборка проекта
npm run build
```

### 2. Развертывание

1. **Подключите репозиторий к Vercel**
   - Импортируйте проект из GitHub/GitLab
   - Vercel автоматически обнаружит Next.js

2. **Настройте переменные окружения**
   - Скопируйте переменные из `env.production.example`
   - Добавьте их в Environment Variables в Vercel Dashboard

3. **Настройте базу данных**
   - Используйте Supabase или другой PostgreSQL провайдер
   - Обновите `DATABASE_URL` в переменных окружения

4. **Deploy Hooks (опционально)**
   ```bash
   # После деплоя можно автоматически обновлять контент
   curl -X POST https://your-app.vercel.app/api/content/cache/invalidate
   ```

### 3. Пост-развертывание

```bash
# Проверка здоровья приложения
curl https://your-app.vercel.app/api/health

# Применение миграций базы данных
npx prisma migrate deploy

# Импорт контента из Notion
npm run import:notion
```

## 📊 Мониторинг и поддержка

### Health Checks

```bash
# Проверка здоровья API
GET /api/health

# Проверка базы данных
GET /api/health/db
```

### Логи и отладка

- **Vercel Logs**: Доступны в Vercel Dashboard
- **Sentry**: Для отслеживания ошибок в production
- **Analytics**: Vercel Analytics для метрик производительности

## 🎯 Roadmap

- [x] Продвинутый поиск по контенту
- [ ] Темная тема
- [ ] PWA возможности
- [ ] Оффлайн режим
- [ ] Комментарии к страницам
- [ ] Экспорт контента
- [ ] Мультиязычность
- [ ] Админ панель для управления контентом
- [ ] Push уведомления через Telegram
- [ ] Интеграция с платежными системами

## 📞 Поддержка

### Полезные команды для разработки:

```bash
# Очистка кэша и перезапуск
npm run clean && npm install

# Проверка покрытия тестами
npm run test:coverage

# Локальная проверка здоровья
npm run health
```

### Возможные проблемы:

1. **Ошибка базы данных**: Проверьте `DATABASE_URL`
2. **Проблемы с Notion**: Убедитесь в корректности токена и прав доступа
3. **Redis не работает**: Убедитесь в правильности `REDIS_URL`
4. **Поиск не работает**: Проверьте индексы базы данных

---

**Сделано с ❤️ для Telegram экосистемы**