# 🚀 Настройка Vercel для развертывания

## Проблема сборки решена ✅

Ошибка с переменными окружения исправлена. Теперь Vercel будет использовать заглушки во время сборки.

## Настройка переменных окружения в Vercel

### Шаг 1: Перейдите в Vercel Dashboard

1. Откройте ваш проект в [Vercel Dashboard](https://vercel.com/dashboard)
2. Перейдите в **Settings** → **Environment Variables**

### Шаг 2: Добавьте переменные окружения

Добавьте следующие переменные (используйте значения из `env.production.example`):

| Переменная | Значение | Пример |
|------------|----------|---------|
| `DATABASE_URL` | URL вашей PostgreSQL базы данных | `postgresql://user:pass@host:5432/db` |
| `TELEGRAM_BOT_TOKEN` | Токен Telegram бота | `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz` |
| `TRIBUTE_API_BASE` | Базовый URL Tribute API | `https://api.tribute.com` |
| `TRIBUTE_API_KEY` | API ключ Tribute | `your_tribute_api_key` |
| `TRIBUTE_CHANNEL_ID` | ID канала в Tribute | `your_channel_id` |
| `TILDA_UPSELL_URL` | URL страницы продаж | `https://your-site.tilda.ws` |
| `NOTION_TOKEN` | Токен Notion | `secret_xxxxxxxxxxxxxxxxxxxx` |
| `NOTION_DATABASE_ID` | ID базы данных Notion | `xxxxxxxxxxxxxxxxxxxxxxxx` |
| `JWT_SECRET` | Секретный ключ JWT (минимум 32 символа) | `your_super_secure_jwt_secret_key` |
| `REDIS_URL` | URL Redis (опционально) | `redis://user:pass@host:port` |

### Шаг 3: Настройка базы данных

Рекомендуется использовать **Supabase**:

1. Создайте проект на [supabase.com](https://supabase.com)
2. Получите `DATABASE_URL` из **Settings** → **Database**
3. Запустите миграции: `npx prisma migrate deploy`
4. Запустите сиды: `npx prisma db seed`

### Шаг 4: Проверка развертывания

После настройки переменных окружения:

1. **Trigger redeploy** в Vercel Dashboard
2. **Проверьте логи сборки** - ошибок быть не должно
3. **Протестируйте приложение** по production URL

### Шаг 5: Пост-развертывание

```bash
# Импорт контента из Notion
npm run import:notion

# Проверка здоровья
curl https://your-app.vercel.app/api/health
```

## 🔧 Troubleshooting

### Если сборка все еще падает:

1. **Проверьте переменные окружения** - все ли они установлены?
2. **Перезапустите сборку** в Vercel Dashboard
3. **Проверьте логи** - ищите ошибки связанные с env

### Если приложение не работает:

1. **Проверьте подключение к базе данных**
2. **Проверьте токены Telegram и Notion**
3. **Проверьте Tribute API credentials**

## 📊 Мониторинг

После развертывания настройте:

- **Vercel Analytics** для метрик
- **Health checks** через `/api/health`
- **Error tracking** через Sentry (опционально)

## 🎯 Следующие шаги

1. ✅ **Настройте переменные окружения** в Vercel
2. ✅ **Протестируйте приложение**
3. ✅ **Импортируйте контент из Notion**
4. ✅ **Настройте домен** (опционально)

---

**Приложение готово к production! 🚀**
