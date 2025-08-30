#!/usr/bin/env node

/**
 * Скрипт для проверки и исправления DATABASE_URL
 * Запуск: node check-database-url.js "ваш_database_url"
 */

const url = require('url');

function checkDatabaseUrl(databaseUrl) {
  if (!databaseUrl) {
    console.log('❌ Ошибка: DATABASE_URL не указан');
    console.log('Использование: node check-database-url.js "postgresql://user:pass@host:port/db"');
    return false;
  }

  try {
    const parsedUrl = new URL(databaseUrl);

    console.log('🔍 Анализ DATABASE_URL...');
    console.log(`📍 Протокол: ${parsedUrl.protocol}`);
    console.log(`🏠 Хост: ${parsedUrl.hostname}`);
    console.log(`🔌 Порт: ${parsedUrl.port || '5432 (по умолчанию для PostgreSQL)'}`);
    console.log(`📁 База данных: ${parsedUrl.pathname.slice(1)}`);
    console.log(`👤 Пользователь: ${parsedUrl.username ? '✅ указан' : '❌ отсутствует'}`);
    console.log(`🔒 Пароль: ${parsedUrl.password ? '✅ указан' : '❌ отсутствует'}`);

    // Проверки
    const issues = [];

    if (parsedUrl.protocol !== 'postgresql:') {
      issues.push('❌ Протокол должен быть postgresql:');
    }

    if (!parsedUrl.hostname) {
      issues.push('❌ Хост не указан');
    }

    if (!parsedUrl.username) {
      issues.push('❌ Пользователь не указан');
    }

    if (!parsedUrl.password) {
      issues.push('❌ Пароль не указан');
    }

    if (!parsedUrl.pathname || parsedUrl.pathname === '/') {
      issues.push('❌ База данных не указана');
    }

    if (issues.length === 0) {
      console.log('\n✅ DATABASE_URL выглядит корректно!');
      console.log('\n💡 Для Supabase, URL должен выглядеть так:');
      console.log('postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres');

      console.log('\n🔧 Если подключение не работает:');
      console.log('1. Проверьте что проект Supabase активен');
      console.log('2. Используйте "Connection string" из Settings → Database');
      console.log('3. Убедитесь что пароль правильный');
    } else {
      console.log('\n❌ Найдены проблемы:');
      issues.forEach(issue => console.log(`   ${issue}`));
    }

    return issues.length === 0;

  } catch (error) {
    console.log('❌ Ошибка парсинга URL:', error.message);
    console.log('\n💡 DATABASE_URL должен быть в формате:');
    console.log('postgresql://username:password@hostname:port/database');
    return false;
  }
}

// Получаем аргумент командной строки
const databaseUrl = process.argv[2];

if (databaseUrl) {
  checkDatabaseUrl(databaseUrl);
} else {
  console.log('🔍 Проверка DATABASE_URL');
  console.log('');
  console.log('📋 Использование:');
  console.log('node check-database-url.js "ваш_database_url"');
  console.log('');
  console.log('📝 Примеры:');
  console.log('node check-database-url.js "postgresql://user:pass@localhost:5432/db"');
  console.log('node check-database-url.js "postgresql://postgres.proj:pass@aws-0-us-east-1.pooler.supabase.com:6543/postgres"');
}
