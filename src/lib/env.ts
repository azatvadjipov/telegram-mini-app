// import 'server-only' // Commented out for CLI compatibility
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  TRIBUTE_API_BASE: z.string().url(),
  TRIBUTE_API_KEY: z.string().min(1),
  TRIBUTE_CHANNEL_ID: z.string().min(1),
  TILDA_UPSELL_URL: z.string().url(),
  NOTION_TOKEN: z.string().min(1),
  NOTION_DATABASE_ID: z.string().min(1),
  REDIS_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(32),
})

// Проверка, что мы не в процессе сборки Next.js
const isBuildTime = typeof window === 'undefined' && !process.env.NODE_ENV

let env: z.infer<typeof envSchema>

if (isBuildTime) {
  // Во время сборки используем заглушки
  env = {
    DATABASE_URL: 'postgresql://build:build@localhost:5432/build',
    TELEGRAM_BOT_TOKEN: 'build_token',
    TRIBUTE_API_BASE: 'https://api.tribute.com',
    TRIBUTE_API_KEY: 'build_key',
    TRIBUTE_CHANNEL_ID: 'build_channel',
    TILDA_UPSELL_URL: 'https://example.com',
    NOTION_TOKEN: 'build_token',
    NOTION_DATABASE_ID: 'build_db',
    REDIS_URL: 'redis://localhost:6379',
    JWT_SECRET: 'build_jwt_secret_min_32_chars_for_build_time_only',
  }
} else {
  // В рантайме валидируем переменные окружения
  try {
    env = envSchema.parse(process.env)
  } catch (error) {
    // В режиме разработки используем дефолтные значения
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  Using development environment variables')
      env = {
        DATABASE_URL: 'postgresql://dev:dev@localhost:5432/dev',
        TELEGRAM_BOT_TOKEN: 'dev_token',
        TRIBUTE_API_BASE: 'https://api.tribute.com',
        TRIBUTE_API_KEY: 'dev_key',
        TRIBUTE_CHANNEL_ID: 'dev_channel',
        TILDA_UPSELL_URL: 'https://example.com',
        NOTION_TOKEN: 'dev_token',
        NOTION_DATABASE_ID: 'dev_db',
        REDIS_URL: 'redis://localhost:6379',
        JWT_SECRET: 'dev_jwt_secret_min_32_chars_for_development_only',
      }
    } else {
      throw error
    }
  }
}

export { env }

export type Env = z.infer<typeof envSchema>
