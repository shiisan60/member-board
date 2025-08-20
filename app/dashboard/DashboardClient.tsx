"use client"

import React from "react"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  Grid,
  Alert,
} from "@mui/material"
import {
  Person as PersonIcon,
  Email as EmailIcon,
  ExitToApp as LogoutIcon,
  Dashboard as DashboardIcon,
  AccountCircle as AccountIcon,
  PostAdd as PostIcon,
  TrendingUp as StatsIcon,
  VerifiedUser as VerifiedIcon,
  Group as GroupIcon,
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
  updatedAt: Date
}

interface SiteStats {
  totalUsers: number
  totalPosts: number
  verifiedUsers: number
}

interface DashboardClientProps {
  user: User | null
  recentPosts: Post[]
  siteStats: SiteStats | null
}

export default function DashboardClient({ user, recentPosts, siteStats }: DashboardClientProps) {
  const router = useRouter()

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error">
          ユーザー情報の取得に失敗しました。
        </Alert>
      </Container>
    )
  }

  const handleLogout = async () => {
    await signOut({
      callbackUrl: "/login",
      redirect: true
    })
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* ヘッダー */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
          <DashboardIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          ダッシュボード
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          こんにちは、{user.name}さん
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* ユーザー情報カード */}
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  margin: '0 auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '2rem'
                }}
              >
                {user.name?.[0]?.toUpperCase() || <AccountIcon sx={{ fontSize: '2.5rem' }} />}
              </Avatar>
              
              <Typography variant="h6" sx={{ mb: 1 }}>
                {user.name || 'ユーザー'}
              </Typography>
              
              <Chip
                icon={user.role === 'admin' ? <VerifiedIcon /> : <PersonIcon />}
                label={user.role === 'admin' ? '管理者' : 'メンバー'}
                color={user.role === 'admin' ? 'error' : 'primary'}
                size="small"
                sx={{ mb: 2 }}
              />

              <Box sx={{ textAlign: 'left', mt: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EmailIcon sx={{ mr: 1, color: 'text.secondary', fontSize: '1.2rem' }} />
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PostIcon sx={{ mr: 1, color: 'text.secondary', fontSize: '1.2rem' }} />
                  <Typography variant="body2" color="text.secondary">
                    投稿数: {user._count.posts}
                  </Typography>
                </Box>
                
                <Typography variant="caption" color="text.secondary">
                  登録日: {formatDate(user.createdAt)}
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{ mt: 3 }}
              >
                ログアウト
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* メインコンテンツ */}
        <Grid item xs={12} md={8}>
          {/* サイト統計（管理者のみ） */}
          {siteStats && (
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <StatsIcon sx={{ mr: 1 }} />
                サイト統計
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary.main">
                      {siteStats.totalUsers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      総ユーザー数
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {siteStats.verifiedUsers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      認証済みユーザー
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="info.main">
                      {siteStats.totalPosts}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      総投稿数
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* 最近の投稿 */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <PostIcon sx={{ mr: 1 }} />
              最近の投稿
            </Typography>
            
            {recentPosts.length > 0 ? (
              <Box>
                {recentPosts.map((post, index) => (
                  <Box key={post.id}>
                    <Box sx={{ py: 2 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>
                        {post.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {post.content}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(post.createdAt)}
                      </Typography>
                    </Box>
                    {index < recentPosts.length - 1 && <Divider />}
                  </Box>
                ))}
                
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Button 
                    variant="outlined" 
                    onClick={() => router.push('/posts')}
                  >
                    すべての投稿を見る
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  まだ投稿がありません
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={() => router.push('/posts/create')}
                >
                  最初の投稿を作成
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}