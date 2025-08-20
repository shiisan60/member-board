'use client';

import { 
  Paper, 
  Typography, 
  Box, 
  Divider, 
  Avatar,
  Chip,
  Button
} from '@mui/material';
import { Edit, Delete, ArrowBack } from '@mui/icons-material';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';

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

interface PostDetailProps {
  post: Post;
  onDelete?: (id: string) => void;
}

export default function PostDetail({ post, onDelete }: PostDetailProps) {
  const router = useRouter();
  const { canEdit, canDelete, isAdmin, user } = usePermissions();
  
  const canEditPost = canEdit(post.author.id);
  const canDeletePost = canDelete(post.author.id);
  const isPostOwner = user.id === post.author.id;

  const handleDelete = () => {
    if (onDelete) {
      onDelete(post.id);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/posts')}
          sx={{ mb: 2 }}
        >
          一覧に戻る
        </Button>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {post.title}
        </Typography>
        {isPostOwner && (
          <Chip label="自分の投稿" color="primary" />
        )}
        {!isPostOwner && isAdmin() && (
          <Chip label="管理者として表示" color="warning" />
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Avatar sx={{ width: 40, height: 40, mr: 2 }}>
          {post.author.name?.[0] || post.author.email[0].toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="subtitle1">
            {post.author.name || post.author.email}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            投稿日: {format(new Date(post.createdAt), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
            {post.updatedAt !== post.createdAt && (
              <> / 更新日: {format(new Date(post.updatedAt), 'yyyy年MM月dd日 HH:mm', { locale: ja })}</>
            )}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Typography 
        variant="body1" 
        sx={{ 
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          lineHeight: 1.8
        }}
      >
        {post.content}
      </Typography>

      {(canEditPost || canDeletePost) && (
        <>
          <Divider sx={{ my: 3 }} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            {canEditPost && (
              <Link href={`/posts/${post.id}/edit`} style={{ textDecoration: 'none' }}>
                <Button variant="outlined" startIcon={<Edit />}>
                  編集
                </Button>
              </Link>
            )}
            {canDeletePost && (
              <Button 
                variant="outlined" 
                color="error" 
                startIcon={<Delete />}
                onClick={handleDelete}
              >
                削除
              </Button>
            )}
          </Box>
        </>
      )}
    </Paper>
  );
}