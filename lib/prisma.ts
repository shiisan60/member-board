import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Vercelの本番環境でDB_URLを使用する場合のフォールバック
if (process.env.DB_URL && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DB_URL
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma