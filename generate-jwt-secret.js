#!/usr/bin/env node

/**
 * Скрипт для генерации безопасного JWT секрета
 * Запуск: node generate-jwt-secret.js
 */

const crypto = require('crypto');

function generateJWTSecret() {
  // Генерируем 32 байта (256 бит) случайных данных
  const secret = crypto.randomBytes(32);

  // Кодируем в base64 для удобства использования
  const base64Secret = secret.toString('base64');

  // Также генерируем hex версию на случай если base64 не подойдет
  const hexSecret = secret.toString('hex');

  console.log('🔐 Сгенерированные JWT секреты:');
  console.log('');
  console.log('📋 Рекомендуемый (base64, 44 символа):');
  console.log(base64Secret);
  console.log('');
  console.log('🔧 Альтернативный (hex, 64 символа):');
  console.log(hexSecret);
  console.log('');
  console.log('💡 Используйте base64 версию в переменной окружения JWT_SECRET');
  console.log('');
  console.log('📝 Пример использования:');
  console.log(`JWT_SECRET="${base64Secret}"`);
}

if (require.main === module) {
  generateJWTSecret();
}
