import { PrismaClient } from '@prisma/client'
import { initDatabaseConfig } from './db-config'

// データベース設定を初期化
initDatabaseConfig()

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma