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
  PersonAdd as MakeAdminIcon,
  Delete as DeleteIcon,
  Verified as VerifiedIcon,
  Cancel as UnverifiedIcon
} from "@mui/icons-material"

interface User {
  id: string
  email: string
  name: string | null
  role: string
  emailVerified: string | null
  createdAt: string
  updatedAt: string
  _count: {
    posts: number
    accounts: number
  }
}

interface UsersResponse {
  success: boolean
  users: User[]
  pagination: {
    page: number
    limit: number
    totalPages: number
    totalCount: number
    hasNext: boolean
    hasPrev: boolean
  }
  stats: {
    total: number
    verified: number
    unverified: number
    admins: number
  }
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
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

      const data: UsersResponse = await response.json()
      setUsers(data.users)
      setStats(data.stats)
    } catch (error) {
      setError(error instanceof Error ? error.message : "データの取得に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  const toggleAdminRole = async (userId: string, currentRole: string) => {
    try {
      setUpdatingUserId(userId)
      const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN"
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ role: newRole })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "更新に失敗しました")
      }

      // 更新後のユーザー一覧を再取得
      await fetchUsers()
    } catch (error) {
      alert(error instanceof Error ? error.message : "更新に失敗しました")
    } finally {
      setUpdatingUserId(null)
    }
  }

  const deleteUser = async (userId: string, userName: string, userEmail: string) => {
    const confirmMessage = `本当に「${userName || userEmail}」を削除しますか？\n\n⚠️ この操作は取り消せません。関連する投稿やデータもすべて削除されます。`
    
    if (!confirm(confirmMessage)) {
      return
    }

    try {
      setDeletingUserId(userId)
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE"
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "削除に失敗しました")
      }

      const result = await response.json()
      alert(`✅ ${result.message}`)
      
      // 削除後のユーザー一覧を再取得
      await fetchUsers()
    } catch (error) {
      alert(error instanceof Error ? error.message : "削除に失敗しました")
    } finally {
      setDeletingUserId(null)
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
          ユーザーの権限管理と削除ができます
        </Typography>
        {stats && (
          <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Chip label={`総数: ${stats.total}`} variant="outlined" />
            <Chip label={`認証済み: ${stats.verified}`} color="success" variant="outlined" />
            <Chip label={`未認証: ${stats.unverified}`} color="warning" variant="outlined" />
            <Chip label={`管理者: ${stats.admins}`} color="error" variant="outlined" />
          </Box>
        )}
      </Box>

      <Paper sx={{ p: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>メールアドレス</TableCell>
                <TableCell>名前</TableCell>
                <TableCell>認証状態</TableCell>
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
                      icon={user.emailVerified ? <VerifiedIcon /> : <UnverifiedIcon />}
                      label={user.emailVerified ? "認証済み" : "未認証"}
                      color={user.emailVerified ? "success" : "warning"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role === "ADMIN" ? "管理者" : "一般ユーザー"}
                      color={user.role === "ADMIN" ? "error" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{user._count.posts}</TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString("ja-JP")}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                      <Tooltip title={user.role === "ADMIN" ? "管理者権限を解除" : "管理者にする"}>
                        <span>
                          <IconButton
                            onClick={() => toggleAdminRole(user.id, user.role)}
                            disabled={updatingUserId === user.id || user.email === session?.user?.email}
                            color={user.role === "ADMIN" ? "error" : "primary"}
                            size="small"
                          >
                            {updatingUserId === user.id ? (
                              <CircularProgress size={16} />
                            ) : user.role === "ADMIN" ? (
                              <RemoveAdminIcon />
                            ) : (
                              <MakeAdminIcon />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="ユーザーを削除">
                        <span>
                          <IconButton
                            onClick={() => deleteUser(user.id, user.name || '', user.email)}
                            disabled={deletingUserId === user.id || user.email === session?.user?.email}
                            color="error"
                            size="small"
                          >
                            {deletingUserId === user.id ? (
                              <CircularProgress size={16} />
                            ) : (
                              <DeleteIcon />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "space-between", alignItems: "center" }}>
        <Button
          variant="outlined"
          onClick={() => router.push("/admin")}
        >
          管理者ダッシュボードに戻る
        </Button>
        <Button
          variant="contained"
          onClick={fetchUsers}
          disabled={loading}
        >
          {loading ? "更新中..." : "リストを更新"}
        </Button>
      </Box>
    </Container>
  )
}