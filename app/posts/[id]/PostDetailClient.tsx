'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Alert } from '@mui/material';
import PostDetail from '@/components/posts/PostDetail';
import DeleteConfirmDialog from '@/components/posts/DeleteConfirmDialog';

interface Author {
  id: string;
  name: string | null;
  email: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  author: Author;
}

interface PostDetailClientProps {
  post: Post;
}

export default function PostDetailClient({ post }: PostDetailClientProps) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    setError('');

    try {
      const response = await fetch(`/api/posts/${deleteTarget}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '削除に失敗しました');
      }

      router.push('/posts');
    } catch (err) {
      setError(err instanceof Error ? err.message : '削除中にエラーが発生しました');
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const postData = {
    ...post,
    createdAt: post.createdAt.toString(),
    updatedAt: post.updatedAt.toString(),
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <PostDetail 
        post={postData} 
        onDelete={(id) => setDeleteTarget(id)}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </Container>
  );
}