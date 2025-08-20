"use client"

import React, { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Button,
  Pagination,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Container
} from "@mui/material"
import { Add as AddIcon } from "@mui/icons-material"
import PostCard from "./PostCard"
import PostForm from "./PostForm"
import { useSession } from "next-auth/react"

interface Author {
  id: string
  name: string | null
  email: string
}

interface Post {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  author: Author
}

interface PostsResponse {
  posts: Post[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface PostFormData {
  title: string
  content: string
}

export default function PostList() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [postFormOpen, setPostFormOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<string | null>(null)

  const fetchPosts = async (page: number = 1) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/posts?page=${page}&limit=10`)
      
      if (!response.ok) {
        throw new Error("投稿の取得に失敗しました")
      }

      const data: PostsResponse = await response.json()
      setPosts(data.posts)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    fetchPosts(page)
  }

  const handleCreatePost = async (data: PostFormData) => {
    const response = await fetch("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "投稿の作成に失敗しました")
    }

    await fetchPosts(pagination.page)
  }

  const handleEditPost = async (data: PostFormData) => {
    if (!editingPost) return

    const response = await fetch(`/api/posts/${editingPost.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "投稿の更新に失敗しました")
    }

    setEditingPost(null)
    await fetchPosts(pagination.page)
  }

  const handleDeletePost = async () => {
    if (!postToDelete) return

    try {
      const response = await fetch(`/api/posts/${postToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "投稿の削除に失敗しました")
      }

      setDeleteDialogOpen(false)
      setPostToDelete(null)
      await fetchPosts(pagination.page)
    } catch (err) {
      setError(err instanceof Error ? err.message : "削除に失敗しました")
    }
  }

  const openEditDialog = (post: Post) => {
    setEditingPost(post)
    setPostFormOpen(true)
  }

  const openDeleteDialog = (postId: string) => {
    setPostToDelete(postId)
    setDeleteDialogOpen(true)
  }

  const closePostForm = () => {
    setPostFormOpen(false)
    setEditingPost(null)
  }

  if (!session) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">
          掲示板を利用するにはログインが必要です。
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h4" component="h1">
            掲示板
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setPostFormOpen(true)}
          >
            新しい投稿
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : posts.length === 0 ? (
          <Alert severity="info">
            まだ投稿がありません。最初の投稿を作成してみましょう！
          </Alert>
        ) : (
          <>
            <Box sx={{ mb: 4 }}>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={session.user?.id}
                  onEdit={openEditDialog}
                  onDelete={openDeleteDialog}
                />
              ))}
            </Box>

            {pagination.totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Box>

      <PostForm
        open={postFormOpen}
        onClose={closePostForm}
        onSubmit={editingPost ? handleEditPost : handleCreatePost}
        initialData={editingPost ? { title: editingPost.title, content: editingPost.content } : undefined}
        title={editingPost ? "投稿を編集" : "新しい投稿"}
        submitLabel={editingPost ? "更新" : "投稿"}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>投稿を削除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            この投稿を削除してもよろしいですか？この操作は取り消せません。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            キャンセル
          </Button>
          <Button onClick={handleDeletePost} color="error" variant="contained">
            削除
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}