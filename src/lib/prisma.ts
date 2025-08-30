import { PrismaClient, PageStatus, PageAccess } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Try to avoid prepared statement conflicts
    __internal: {
      engine: {
        allowTriggerRetry: false,
        enableMetrics: false,
      },
    },
    // Disable prepared statements to avoid conflicts in serverless environments
    transactionOptions: {
      maxWait: 2000,
      timeout: 5000,
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export { PageStatus, PageAccess }
