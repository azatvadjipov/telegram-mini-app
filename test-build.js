#!/usr/bin/env node

/**
 * Тестовый скрипт для проверки сборки без переменных окружения
 * Это позволяет протестировать что сборка работает локально
 */

console.log('🧪 Тестирование сборки без переменных окружения...');

// Устанавливаем тестовые переменные окружения для локального тестирования
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.TELEGRAM_BOT_TOKEN = 'test_token';
process.env.TRIBUTE_API_BASE = 'https://api.tribute.com';
process.env.TRIBUTE_API_KEY = 'test_key';
process.env.TRIBUTE_CHANNEL_ID = 'test_channel';
process.env.TILDA_UPSELL_URL = 'https://example.com';
process.env.NOTION_TOKEN = 'test_token';
process.env.NOTION_DATABASE_ID = 'test_db';
process.env.JWT_SECRET = 'test_jwt_secret_min_32_chars_for_testing_only';

console.log('✅ Тестовые переменные окружения установлены');
console.log('💡 Теперь можно запустить: npm run build');

// Показываем установленные переменные
console.log('\n📋 Установленные переменные окружения:');
console.log(`DATABASE_URL=${process.env.DATABASE_URL}`);
console.log(`TELEGRAM_BOT_TOKEN=${process.env.TELEGRAM_BOT_TOKEN}`);
console.log(`TRIBUTE_API_BASE=${process.env.TRIBUTE_API_BASE}`);
console.log(`TRIBUTE_API_KEY=${process.env.TRIBUTE_API_KEY}`);
console.log(`TRIBUTE_CHANNEL_ID=${process.env.TRIBUTE_CHANNEL_ID}`);
console.log(`TILDA_UPSELL_URL=${process.env.TILDA_UPSELL_URL}`);
console.log(`NOTION_TOKEN=${process.env.NOTION_TOKEN}`);
console.log(`NOTION_DATABASE_ID=${process.env.NOTION_DATABASE_ID}`);
console.log(`JWT_SECRET=${process.env.JWT_SECRET}`);
