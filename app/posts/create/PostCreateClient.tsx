"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress
} from "@mui/material"
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon
} from "@mui/icons-material"

interface User {
  id?: string
  email?: string
  name?: string
  role?: string
  emailVerified?: any
}

interface PostCreateClientProps {
  user: User
}

export default function PostCreateClient({ user }: PostCreateClientProps) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  if (!user?.id) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error">
          認証情報の取得に失敗しました。
        </Alert>
      </Container>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim()) {
      setError("タイトルと内容の両方を入力してください")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // 投稿詳細ページまたは投稿一覧ページにリダイレクト
        router.push(`/posts/${data.post.id}`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "投稿の作成に失敗しました")
      }
    } catch (err) {
      setError("投稿の作成中にエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{ mb: 2 }}
        >
          戻る
        </Button>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          新しい投稿を作成
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="タイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
            required
            disabled={loading}
            placeholder="投稿のタイトルを入力してください"
          />
          
          <TextField
            fullWidth
            label="内容"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            margin="normal"
            required
            multiline
            rows={10}
            disabled={loading}
            placeholder="投稿の内容を入力してください"
          />

          <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              disabled={loading}
            >
              {loading ? "投稿中..." : "投稿する"}
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => router.back()}
              disabled={loading}
            >
              キャンセル
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}