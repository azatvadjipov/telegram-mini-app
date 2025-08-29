#!/bin/bash

# Скрипт для настройки GitHub репозитория
# Использование: ./setup-github.sh YOUR_GITHUB_USERNAME

set -e

if [ $# -eq 0 ]; then
    echo "❌ Ошибка: Укажите ваше имя пользователя GitHub"
    echo "Использование: ./setup-github.sh YOUR_GITHUB_USERNAME"
    exit 1
fi

GITHUB_USERNAME=$1
REPO_NAME="telegram-mini-app"
REPO_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

echo "🚀 Начинаем настройку GitHub репозитория..."
echo "👤 Пользователь: ${GITHUB_USERNAME}"
echo "📦 Репозиторий: ${REPO_NAME}"
echo ""

# Проверка наличия git
if ! command -v git &> /dev/null; then
    echo "❌ Git не установлен. Установите Git и попробуйте снова."
    exit 1
fi

# Проверка наличия изменений
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Есть незакоммиченные изменения. Добавляем их..."
    git add .
    git commit -m "chore: Auto-commit before GitHub setup"
fi

# Проверка наличия remote origin
if git remote get-url origin &> /dev/null; then
    echo "⚠️  Remote origin уже существует. Обновляем URL..."
    git remote set-url origin "${REPO_URL}"
else
    echo "📡 Добавляем remote origin..."
    git remote add origin "${REPO_URL}"
fi

# Проверка существования репозитория на GitHub
echo "🔍 Проверяем доступность репозитория..."
if curl --output /dev/null --silent --head --fail "${REPO_URL}"; then
    echo "✅ Репозиторий найден на GitHub"
else
    echo "❌ Репозиторий не найден на GitHub"
    echo ""
    echo "📋 Создайте репозиторий на GitHub:"
    echo "1. Перейдите на https://github.com/new"
    echo "2. Название: ${REPO_NAME}"
    echo "3. Сделайте репозиторий Public"
    echo "4. НЕ добавляйте README, .gitignore, license"
    echo "5. Нажмите 'Create repository'"
    echo ""
    echo "После создания репозитория запустите скрипт снова:"
    echo "./setup-github.sh ${GITHUB_USERNAME}"
    exit 1
fi

# Отправка кода на GitHub
echo "📤 Отправляем код на GitHub..."
if git push -u origin main; then
    echo ""
    echo "🎉 Успешно! Репозиторий настроен и код загружен."
    echo ""
    echo "🌐 Ссылка на репозиторий:"
    echo "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"
    echo ""
    echo "📋 Следующие шаги:"
    echo "1. Настройте Vercel для автоматического развертывания"
    echo "2. Добавьте переменные окружения в Vercel Dashboard"
    echo "3. Настройте базу данных Supabase"
    echo "4. Протестируйте приложение"
    echo ""
    echo "📚 Документация: README.md"
    echo "🔧 Настройка: GITHUB_SETUP.md"
else
    echo "❌ Ошибка при отправке кода на GitHub"
    echo ""
    echo "Возможные причины:"
    echo "- Неверное имя пользователя GitHub"
    echo "- Репозиторий не существует"
    echo "- Проблемы с аутентификацией"
    echo ""
    echo "Проверьте настройки и попробуйте снова"
    exit 1
fi
