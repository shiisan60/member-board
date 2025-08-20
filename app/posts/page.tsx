import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import PostListClient from './PostListClient';

export default async function PostsPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

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
}