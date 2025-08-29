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

export const env = envSchema.parse(process.env)

export type Env = z.infer<typeof envSchema>
