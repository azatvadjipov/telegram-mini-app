# 🚀 Настройка Vercel для развертывания

## Проблема сборки решена ✅

Ошибка с переменными окружения исправлена. Теперь Vercel будет использовать заглушки во время сборки.

## Настройка переменных окружения в Vercel

### Шаг 1: Перейдите в Vercel Dashboard

1. После нажатия кнопки "Deploy to Vercel" вы будете перенаправлены на Vercel
2. Авторизуйтесь и подтвердите импорт проекта
3. После создания проекта перейдите в **Settings** → **Environment Variables**

### Шаг 2: Добавьте переменные окружения

Добавьте следующие переменные (используйте значения из [`env.production.example`](https://github.com/azatvadjipov/telegram-mini-app/blob/main/env.production.example)):

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

### Сборка падает после настройки переменных окружения:

1. **Проверьте формат переменных окружения** - убедитесь что нет лишних пробелов
2. **Очистите кэш Vercel:**
   - Перейдите в **Settings** → **Advanced**
   - Нажмите **"Clear Build Cache"**
   - Подождите 1-2 минуты
3. **Перезапустите сборку** в Vercel Dashboard (кнопка "Redeploy")
4. **Проверьте логи сборки** - найдите конкретную ошибку
5. **Проверьте DATABASE_URL** - должен быть валидный PostgreSQL URL

### Ошибка "Could not parse File as JSON":

Если вы видите ошибку **"Could not parse File as JSON: vercel.json"**:

1. **Проверьте синтаксис JSON:**
   ```bash
   # Локально проверьте JSON
   python3 -m json.tool vercel.json
   ```

2. **Основные причины ошибки:**
   - Лишняя запятая в конце объекта
   - Неправильные кавычки (должны быть двойные)
   - Отсутствующие кавычки у ключей
   - Неправильная структура JSON

3. **Исправьте ошибки и перезапустите сборку:**
   - Внесите исправления в `vercel.json`
   - Отправьте изменения на GitHub
   - Перезапустите сборку в Vercel

### Приложение не работает после деплоя:

1. **Проверьте подключение к базе данных:**
   ```bash
   curl https://your-app.vercel.app/api/health
   ```

2. **Проверьте переменные окружения:**
   - TELEGRAM_BOT_TOKEN должен быть валидным
   - NOTION_TOKEN должен иметь доступ к базе данных
   - DATABASE_URL должен быть доступен

3. **Проверьте логи приложения** в Vercel Dashboard

### Ошибка "Cannot find module" или другие импорты:

1. **Очистите кэш Vercel:**
   - В Vercel Dashboard → Settings → Advanced → Clear Build Cache
   - Перезапустите сборку

2. **Проверьте package.json** на корректность зависимостей

### Performance проблемы:

1. **Проверьте Vercel Analytics** для анализа производительности
2. **Оптимизируйте изображения** - убедитесь что они сжимаются
3. **Настройте кэширование** для API routes

### Полезные команды для отладки:

```bash
# Проверьте статус приложения
curl -I https://your-app.vercel.app

# Проверьте конкретный API endpoint
curl https://your-app.vercel.app/api/content/tree

# Проверьте логи в Vercel Dashboard
# Functions → [название функции] → Logs
```



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
