import { requireAuth, getUser } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  // サーバーサイドで認証チェック
  const session = await requireAuth()
  const user = getUser(session)
  
  // サーバーサイドでユーザーデータを取得
  const userData = await prisma.user.findUnique({
    where: { id: user.id! },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
        }
      }
    }
  })

  // 最近の投稿を取得
  const recentPosts = await prisma.post.findMany({
    where: {
      authorId: user.id!
    },
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 5
  })

  // サイトの統計データ（管理者の場合）
  let siteStats = null
  if (user.role === 'admin') {
    siteStats = {
      totalUsers: await prisma.user.count(),
      totalPosts: await prisma.post.count(),
      verifiedUsers: await prisma.user.count({
        where: { emailVerified: { not: null } }
      })
    }
  }

  return (
    <DashboardClient 
      user={userData}
      recentPosts={recentPosts}
      siteStats={siteStats}
    />
  )
}