'use client';

import { Card, CardContent, CardActions, Typography, Button, Box, Chip, Avatar } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import Link from 'next/link';
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

interface PostCardProps {
  post: Post;
  onDelete?: (id: string) => void;
}

export default function PostCard({ post, onDelete }: PostCardProps) {
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
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            {post.title}
          </Typography>
          {isPostOwner && (
            <Chip label="自分の投稿" color="primary" size="small" />
          )}
          {!isPostOwner && isAdmin() && (
            <Chip label="管理者として表示" color="warning" size="small" />
          )}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
            {post.author.name?.[0] || post.author.email[0].toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              {post.author.name || post.author.email}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {format(new Date(post.createdAt), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
            </Typography>
          </Box>
        </Box>

        <Typography 
          variant="body1" 
          sx={{ 
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {post.content}
        </Typography>

        <Link href={`/posts/${post.id}`} style={{ textDecoration: 'none' }}>
          <Button size="small" color="primary">
            続きを読む
          </Button>
        </Link>
      </CardContent>

      {(canEditPost || canDeletePost) && (
        <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
          {canEditPost && (
            <Link href={`/posts/${post.id}/edit`} style={{ textDecoration: 'none' }}>
              <Button size="small" startIcon={<Edit />}>
                編集
              </Button>
            </Link>
          )}
          {canDeletePost && (
            <Button 
              size="small" 
              color="error" 
              startIcon={<Delete />}
              onClick={handleDelete}
            >
              削除
            </Button>
          )}
        </CardActions>
      )}
    </Card>
  );
}