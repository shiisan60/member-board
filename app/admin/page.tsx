import { requireAdmin, getUser } from '@/lib/server-auth'
import { prisma } from '@/lib/prisma'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  // サーバーサイドで管理者認証チェック
  const session = await requireAdmin()
  const user = getUser(session)

  // サイト統計データを取得
  const [
    totalUsers,
    totalPosts,
    verifiedUsers,
    unverifiedUsers,
    adminUsers,
    postsThisMonth,
    usersThisMonth
  ] = await Promise.all([
    // 基本統計
    prisma.user.count(),
    prisma.post.count(),
    prisma.user.count({ where: { emailVerified: { not: null } } }),
    prisma.user.count({ where: { emailVerified: null } }),
    prisma.user.count({ where: { role: 'admin' } }),
    
    // 今月のデータ
    prisma.post.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    })
  ])

  // 最近のユーザー（上位10名）
  const recentUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      _count: {
        select: {
          posts: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 10
  })

  // 最近の投稿（上位10件）
  const recentPosts = await prisma.post.findMany({
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
      author: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 10
  })

  const statsData = {
    totalUsers,
    totalPosts,
    verifiedUsers,
    unverifiedUsers,
    adminUsers,
    postsThisMonth,
    usersThisMonth
  }

  return (
    <AdminClient 
      currentUser={user}
      stats={statsData}
      recentUsers={recentUsers}
      recentPosts={recentPosts}
    />
  )
}