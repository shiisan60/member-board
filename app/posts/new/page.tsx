'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Container, Typography, Alert } from '@mui/material';
import PostForm from '@/components/posts/PostForm';

export default function NewPostPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: { title: string; content: string }) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '投稿の作成に失敗しました');
      }

      const result = await response.json();
      router.push('/posts');
    } catch (err) {
      setError(err instanceof Error ? err.message : '投稿の作成中にエラーが発生しました');
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">
          投稿するにはログインが必要です
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        新規投稿
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <PostForm 
        onSubmit={handleSubmit} 
        submitLabel="投稿する"
        isLoading={isLoading}
      />
    </Container>
  );
}