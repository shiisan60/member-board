"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress
} from "@mui/material"

interface PostFormData {
  title: string
  content: string
}

interface PostFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: PostFormData) => Promise<void>
  initialData?: PostFormData
  title: string
  submitLabel: string
}

export default function PostForm({
  open,
  onClose,
  onSubmit,
  initialData,
  title,
  submitLabel
}: PostFormProps) {
  const [formData, setFormData] = useState<PostFormData>(
    initialData || { title: "", content: "" }
  )
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(false)

  React.useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    } else {
      setFormData({ title: "", content: "" })
    }
    setError("")
  }, [initialData, open])

  const handleChange = (field: keyof PostFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }))
    if (error) setError("")
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError("タイトルと内容は必須です")
      return
    }

    setLoading(true)
    setError("")

    try {
      await onSubmit(formData)
      onClose()
      setFormData({ title: "", content: "" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
      setError("")
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: "60vh" }
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              label="タイトル"
              value={formData.title}
              onChange={handleChange("title")}
              fullWidth
              required
              disabled={loading}
              autoFocus
            />

            <TextField
              label="内容"
              value={formData.content}
              onChange={handleChange("content")}
              fullWidth
              required
              multiline
              rows={12}
              disabled={loading}
              placeholder="投稿内容を入力してください..."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} disabled={loading}>
            キャンセル
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !formData.title.trim() || !formData.content.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "処理中..." : submitLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}