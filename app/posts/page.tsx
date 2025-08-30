import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import PostListClient from './PostListClient';

export default async function PostsPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  try {
    const postsData = await prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const posts = postsData.map(post => ({
      ...post,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    }));

    return <PostListClient initialPosts={posts} />;
  } catch (error) {
    console.error('Error fetching posts:', error);
    // 空の配列を渡してエラーを回避
    return <PostListClient initialPosts={[]} />;
  }
}