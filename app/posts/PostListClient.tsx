'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Button,
  Box,
  Fab,
  Alert,
  Paper,
  Grid
} from '@mui/material';
import { Add as AddIcon, Create as CreateIcon } from '@mui/icons-material';
import PostCard from '@/components/posts/PostCard';
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
  author: Author;
  createdAt: string;
  updatedAt: string;
}

interface PostListClientProps {
  initialPosts: Post[];
}

export default function PostListClient({ initialPosts }: PostListClientProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
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

      setPosts(posts.filter(post => post.id !== deleteTarget));
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '削除中にエラーが発生しました');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          投稿一覧
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push('/posts/new')}
          size="large"
        >
          新規投稿
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {posts.length === 0 ? (
        <Paper 
          elevation={1} 
          sx={{ 
            p: 6, 
            textAlign: 'center', 
            bgcolor: 'grey.50',
            border: '1px dashed',
            borderColor: 'grey.300'
          }}
        >
          <CreateIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            まだ投稿がありません
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            最初の投稿を作成してみましょう！
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/posts/new')}
            size="large"
          >
            投稿を作成
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {posts.map((post) => (
            <Grid item xs={12} key={post.id}>
              <PostCard 
                post={post} 
                onDelete={(id) => setDeleteTarget(id)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Fab
        color="primary"
        aria-label="add post"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24
        }}
        onClick={() => router.push('/posts/new')}
      >
        <AddIcon />
      </Fab>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </Container>
  );
}