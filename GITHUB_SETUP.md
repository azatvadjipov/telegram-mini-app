# 🚀 Настройка репозитория на GitHub

## Шаг 1: Создание репозитория на GitHub

1. Перейдите на [GitHub.com](https://github.com) и войдите в аккаунт
2. Нажмите кнопку **"New repository"** (зеленая кнопка в правом верхнем углу)
3. Заполните форму:
   - **Repository name**: `telegram-mini-app` или любое другое название
   - **Description**: `Telegram Mini App with content search and premium access`
   - **Visibility**: Public (или Private если хотите)
   - **☐ Add a README file**: НЕ отмечайте (у нас уже есть)
   - **☐ Add .gitignore**: НЕ отмечайте (у нас уже настроен)
   - **☐ Choose a license**: MIT или любая другая
4. Нажмите **"Create repository"**

## Шаг 2: Настройка локального репозитория

После создания репозитория на GitHub, скопируйте URL репозитория (он будет выглядеть как `https://github.com/YOUR_USERNAME/telegram-mini-app.git`)

```bash
# Добавьте remote origin (замените YOUR_USERNAME на ваше имя пользователя)
git remote add origin https://github.com/YOUR_USERNAME/telegram-mini-app.git

# Отправьте код на GitHub
git push -u origin main
```

## Шаг 3: Проверка загрузки

После выполнения команд выше:
1. Обновите страницу репозитория на GitHub
2. Вы должны увидеть все файлы проекта
3. Проверьте что README.md отображается корректно

## Шаг 4: Настройка GitHub Actions (опционально)

Для автоматического тестирования и развертывания можно добавить GitHub Actions:

1. В репозитории создайте папку `.github/workflows`
2. Добавьте файл `ci.yml`:

```yaml
name: CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm test

    - name: Build project
      run: npm run build

    - name: Type check
      run: npm run type-check
```

## Шаг 5: Развертывание на Vercel

1. Подключите GitHub репозиторий к Vercel
2. Настройте переменные окружения в Vercel Dashboard
3. Автоматическое развертывание при каждом пуше в main ветку

## 🔧 Полезные команды Git

```bash
# Проверка статуса
git status

# Просмотр коммитов
git log --oneline

# Создание новой ветки
git checkout -b feature/new-feature

# Слияние веток
git checkout main
git merge feature/new-feature

# Отправка изменений
git push origin main

# Получение обновлений
git pull origin main
```

## 📝 Советы по работе с Git

1. **Всегда проверяйте статус** перед коммитом: `git status`
2. **Делайте осмысленные коммиты** с понятными сообщениями
3. **Используйте ветки** для новых функций
4. **Регулярно синхронизируйтесь** с основным репозиторием
5. **Не коммитьте** чувствительные данные (токены, пароли)

## 🎯 Следующие шаги после загрузки на GitHub

1. ✅ **Настройте Vercel** для автоматического развертывания
2. ✅ **Добавьте переменные окружения** в Vercel
3. ✅ **Настройте базу данных** Supabase
4. ✅ **Протестируйте** приложение в production
5. ✅ **Настройте мониторинг** и логи

---

**Приятной работы с проектом! 🚀**
