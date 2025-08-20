import { requireAuth } from '@/lib/server-auth'
import ProfileClient from './ProfileClient'

export default async function ProfilePage() {
  // サーバーサイドで認証チェック
  await requireAuth()

  return <ProfileClient />
}