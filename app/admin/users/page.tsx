"use client"

import React, { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Container,
  Typography,
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Tooltip
} from "@mui/material"
import {
  AdminPanelSettings as AdminIcon,
  People as PeopleIcon,
  Edit as EditIcon,
  PersonOff as RemoveAdminIcon,
  PersonAdd as MakeAdminIcon
} from "@mui/icons-material"

interface User {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: string
  _count: {
    posts: number
  }
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/")
      return
    }

    if (status === "authenticated" && session) {
      fetchUsers()
    }
  }, [status, session, router])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/users")
      
      if (!response.ok) {
        throw new Error("管理者権限が必要です")
      }

      const data = await response.json()
      setUsers(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : "データの取得に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  const toggleAdminRole = async (userId: string, currentRole: string) => {
    try {
      setUpdatingUserId(userId)
      const newRole = currentRole === "admin" ? "user" : "admin"
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ role: newRole })
      })

      if (!response.ok) {
        throw new Error("更新に失敗しました")
      }

      // 更新後のユーザー一覧を再取得
      await fetchUsers()
    } catch (error) {
      alert(error instanceof Error ? error.message : "更新に失敗しました")
    } finally {
      setUpdatingUserId(null)
    }
  }

  if (status === "loading" || loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <PeopleIcon color="primary" />
          ユーザー管理
        </Typography>
        <Typography variant="body1" color="text.secondary">
          ユーザーの権限を管理できます
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>メールアドレス</TableCell>
                <TableCell>名前</TableCell>
                <TableCell>現在の権限</TableCell>
                <TableCell>投稿数</TableCell>
                <TableCell>登録日</TableCell>
                <TableCell align="center">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.name || "未設定"}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role === "admin" ? "管理者" : "一般ユーザー"}
                      color={user.role === "admin" ? "error" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{user._count.posts}</TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString("ja-JP")}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={user.role === "admin" ? "管理者権限を解除" : "管理者にする"}>
                      <IconButton
                        onClick={() => toggleAdminRole(user.id, user.role)}
                        disabled={updatingUserId === user.id || user.email === session?.user?.email}
                        color={user.role === "admin" ? "error" : "primary"}
                      >
                        {updatingUserId === user.id ? (
                          <CircularProgress size={20} />
                        ) : user.role === "admin" ? (
                          <RemoveAdminIcon />
                        ) : (
                          <MakeAdminIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
        <Button
          variant="outlined"
          onClick={() => router.push("/admin")}
        >
          管理者ダッシュボードに戻る
        </Button>
      </Box>
    </Container>
  )
}