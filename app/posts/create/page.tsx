import { requireAuth, getUser } from '@/lib/server-auth'
import PostCreateClient from './PostCreateClient'

export default async function CreatePostPage() {
  // サーバーサイドで認証チェック
  const session = await requireAuth()
  const user = getUser(session)

  return (
    <PostCreateClient user={user} />
  )
}