import { handlers } from "@/lib/auth"

export const { GET, POST } = handlers

// NextAuth + Prisma は Node.js ランタイムを必要とするため、
// ルートを Edge ではなく Node.js で実行するように明示します。
export const runtime = 'nodejs'

// 認証エンドポイントはキャッシュ不可にする
export const dynamic = 'force-dynamic'