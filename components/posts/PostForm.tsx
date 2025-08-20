'use client';

import { useState } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Paper,
  CircularProgress
} from '@mui/material';

interface PostFormProps {
  initialData?: {
    title: string;
    content: string;
  };
  onSubmit: (data: { title: string; content: string }) => Promise<void>;
  submitLabel?: string;
  isLoading?: boolean;
}

export default function PostForm({ 
  initialData, 
  onSubmit, 
  submitLabel = '投稿する',
  isLoading = false 
}: PostFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

  const validate = () => {
    const newErrors: { title?: string; content?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'タイトルは必須です';
    } else if (title.length > 20) {
      newErrors.title = 'タイトルは20文字以内で入力してください';
    }

    if (!content.trim()) {
      newErrors.content = '本文は必須です';
    } else if (content.length > 200) {
      newErrors.content = '本文は200文字以内で入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    await onSubmit({ title: title.trim(), content: content.trim() });
  };

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="タイトル"
          value={title}
          onChange={(e) => {
            if (e.target.value.length <= 20) {
              setTitle(e.target.value);
            }
          }}
          error={!!errors.title}
          helperText={errors.title || `${title.length}/20文字`}
          margin="normal"
          required
          disabled={isLoading}
          inputProps={{ maxLength: 20 }}
        />

        <TextField
          fullWidth
          label="本文"
          value={content}
          onChange={(e) => {
            if (e.target.value.length <= 200) {
              setContent(e.target.value);
            }
          }}
          error={!!errors.content}
          helperText={errors.content || `${content.length}/200文字`}
          margin="normal"
          required
          multiline
          rows={10}
          disabled={isLoading}
          inputProps={{ maxLength: 200 }}
        />

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading}
            sx={{ minWidth: 120 }}
          >
            {isLoading ? <CircularProgress size={24} /> : submitLabel}
          </Button>
          <Button
            variant="outlined"
            href="/posts"
            disabled={isLoading}
          >
            キャンセル
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}