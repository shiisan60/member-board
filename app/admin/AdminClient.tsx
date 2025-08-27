"use client"

import React from "react"
import { useRouter } from "next/navigation"
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  Button
} from "@mui/material"
import {
  AdminPanelSettings as AdminIcon,
  People as PeopleIcon,
  Article as ArticleIcon,
  VerifiedUser as VerifiedIcon,
  PersonOff as UnverifiedIcon,
  TrendingUp as TrendingIcon,
  Visibility as ViewIcon
} from "@mui/icons-material"

interface User {
  id: string
  email: string
  name: string | null
  role: string
  emailVerified: Date | null
  createdAt: Date
  _count: {
    posts: number
  }
}

interface Post {
  id: string
  title: string
  content: string
  createdAt: Date
  author: {
    name: string | null
    email: string
  }
}

interface Stats {
  totalUsers: number
  totalPosts: number
  verifiedUsers: number
  unverifiedUsers: number
  adminUsers: number
  postsThisMonth: number
  usersThisMonth: number
}

interface AdminClientProps {
  currentUser: {
    id?: string
    email?: string
    name?: string
    role?: string
  }
  stats: Stats
  recentUsers: User[]
  recentPosts: Post[]
}

export default function AdminClient({ currentUser, stats, recentUsers, recentPosts }: AdminClientProps) {
  const router = useRouter()

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const truncateContent = (content: string, length: number = 100) => {
    return content.length > length ? content.slice(0, length) + '...' : content
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* ヘッダー */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <AdminIcon sx={{ mr: 2, color: 'warning.main' }} />
              管理者ダッシュボード
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              システムの全体的な状況を管理・監視
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PeopleIcon />}
              onClick={() => router.push('/admin/users')}
            >
              ユーザー管理
            </Button>
          </Box>
        </Box>
      </Box>

      {/* 統計カード */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center' }}>
              <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" color="primary.main">
                {stats.totalUsers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                総ユーザー数
              </Typography>
              <Typography variant="caption" color="success.main">
                今月: +{stats.usersThisMonth}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center' }}>
              <VerifiedIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {stats.verifiedUsers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                認証済みユーザー
              </Typography>
              <Typography variant="caption" color="text.secondary">
                認証率: {Math.round((stats.verifiedUsers / stats.totalUsers) * 100)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center' }}>
              <ArticleIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" color="info.main">
                {stats.totalPosts}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                総投稿数
              </Typography>
              <Typography variant="caption" color="success.main">
                今月: +{stats.postsThisMonth}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center' }}>
              <UnverifiedIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                {stats.unverifiedUsers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                未認証ユーザー
              </Typography>
              <Typography variant="caption" color="text.secondary">
                管理者: {stats.adminUsers}名
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* 最近のユーザー */}
        <Grid item xs={12} lg={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <PeopleIcon sx={{ mr: 1 }} />
                最近のユーザー
              </Typography>
              <Button
                size="small"
                onClick={() => router.push('/admin/users')}
                endIcon={<ViewIcon />}
              >
                すべて表示
              </Button>
            </Box>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ユーザー</TableCell>
                    <TableCell>ステータス</TableCell>
                    <TableCell>投稿数</TableCell>
                    <TableCell>登録日</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {user.name || 'Unknown'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Chip
                            size="small"
                            label={user.role === 'ADMIN' ? '管理者' : 'ユーザー'}
                            color={user.role === 'ADMIN' ? 'error' : 'default'}
                          />
                          <Chip
                            size="small"
                            label={user.emailVerified ? '認証済み' : '未認証'}
                            color={user.emailVerified ? 'success' : 'warning'}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>{user._count.posts}</TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {formatDate(user.createdAt)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* 最近の投稿 */}
        <Grid item xs={12} lg={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <ArticleIcon sx={{ mr: 1 }} />
                最近の投稿
              </Typography>
              <Button
                size="small"
                onClick={() => router.push('/posts')}
                endIcon={<ViewIcon />}
              >
                すべて表示
              </Button>
            </Box>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>タイトル</TableCell>
                    <TableCell>作成者</TableCell>
                    <TableCell>投稿日</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {post.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {truncateContent(post.content, 50)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {post.author.name || 'Unknown'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {post.author.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {formatDate(post.createdAt)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}