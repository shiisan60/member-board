import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Session } from 'next-auth'

/**
 * サーバーコンポーネント用認証チェック
 * 認証が必要なページで使用する
 */
export async function requireAuth(): Promise<Session> {
  const session = await auth()
  
  if (!session || !session.user) {
    redirect('/login')
  }
  
  return session
}

/**
 * 管理者権限チェック付き認証
 * 管理者権限が必要なページで使用する
 */
export async function requireAdmin(): Promise<Session> {
  const session = await requireAuth()
  
  if (session.user?.role !== 'admin') {
    redirect('/')
  }
  
  return session
}

/**
 * オプショナル認証チェック
 * ログイン状態に応じて表示を変える場合に使用
 */
export async function getOptionalAuth(): Promise<Session | null> {
  try {
    const session = await auth()
    return session
  } catch {
    return null
  }
}

/**
 * ユーザー情報を安全に取得
 * セッションからユーザー情報のみを抽出
 */
export function getUser(session: Session) {
  return {
    id: session.user?.id,
    email: session.user?.email,
    name: session.user?.name,
    role: session.user?.role,
    emailVerified: session.user?.emailVerified,
  }
}

/**
 * 権限チェック関数
 */
export function hasPermission(session: Session | null, requiredRole?: string): boolean {
  if (!session?.user) return false
  
  if (requiredRole) {
    return session.user.role === requiredRole
  }
  
  return true
}

/**
 * Next.js 15対応のサーバーサイド認証ガード
 * ページコンポーネントの先頭で呼び出す
 */
export async function withAuth<T>(
  callback: (session: Session) => T | Promise<T>
): Promise<T> {
  const session = await requireAuth()
  return await callback(session)
}

/**
 * 管理者権限付きサーバーサイド認証ガード
 */
export async function withAdminAuth<T>(
  callback: (session: Session) => T | Promise<T>
): Promise<T> {
  const session = await requireAdmin()
  return await callback(session)
}