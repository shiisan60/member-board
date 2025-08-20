import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import PostDetailClient from './PostDetailClient'

interface PostDetailPageProps {
  params: {
    id: string
  }
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = params

  // 投稿データを取得
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      }
    }
  })

  if (!post) {
    notFound()
  }

  return (
    <PostDetailClient 
      post={{
        id: post.id,
        title: post.title,
        content: post.content,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        author: post.author
      }}
    />
  )
}