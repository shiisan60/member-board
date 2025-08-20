import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canEditPost } from '@/lib/auth/permissions';
import EditPostClient from './EditPostClient';

interface EditPostPageProps {
  params: {
    id: string;
  };
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }

  const { id } = params;

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  // 権限チェック（管理者も編集可能）
  const user = await prisma.user.findUnique({
    where: { id: session.user?.id },
    select: { role: true }
  });

  if (!canEditPost(session.user?.id, post.authorId, user?.role)) {
    redirect(`/posts/${id}`);
  }

  return (
    <EditPostClient 
      post={{
        id: post.id,
        title: post.title,
        content: post.content,
      }}
    />
  );
}