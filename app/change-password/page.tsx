import { requireAuth } from '@/lib/server-auth'
import ChangePasswordClient from './ChangePasswordClient'

export default async function ChangePasswordPage() {
  // サーバーサイドで認証チェック
  await requireAuth()

  return <ChangePasswordClient />
}