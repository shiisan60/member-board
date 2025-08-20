'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Typography, Alert } from '@mui/material';
import PostForm from '@/components/posts/PostForm';

interface EditPostClientProps {
  post: {
    id: string;
    title: string;
    content: string;
  };
}

export default function EditPostClient({ post }: EditPostClientProps) {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: { title: string; content: string }) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '投稿の更新に失敗しました');
      }

      router.push(`/posts/${post.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '投稿の更新中にエラーが発生しました');
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        投稿を編集
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <PostForm 
        initialData={{
          title: post.title,
          content: post.content,
        }}
        onSubmit={handleSubmit} 
        submitLabel="更新する"
        isLoading={isLoading}
      />
    </Container>
  );
}