"use client"

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Avatar,
  Divider,
  Grid,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip
} from '@mui/material'
import {
  AccountCircle,
  Email,
  Person,
  Badge,
  CalendarToday,
  Save,
  Cancel,
  Edit as EditIcon,
  CheckCircle,
  AdminPanelSettings
} from '@mui/icons-material'

interface Profile {
  id: string
  email: string
  name: string | null
  bio: string | null
  role: string
  emailVerified: Date | null
  createdAt: Date
  updatedAt: Date
}

export default function ProfileClient() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    email: ''
  })
  
  const [profile, setProfile] = useState<Profile | null>(null)

  // プロフィールデータを取得
  const fetchProfile = async () => {
    if (!session?.user?.id) return
    
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
        setFormData({
          name: data.user.name || '',
          bio: data.user.bio || '',
          email: data.user.email || ''
        })
      } else {
        console.error('Profile API error:', response.status, response.statusText)
        // APIエラーの場合もセッション情報を使用
        if (session.user) {
          setFormData({
            name: session.user.name || '',
            bio: '',
            email: session.user.email || ''
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      // ネットワークエラーの場合もセッション情報を使用
      if (session.user) {
        setFormData({
          name: session.user.name || '',
          bio: '',
          email: session.user.email || ''
        })
      }
    }
  }

  React.useEffect(() => {
    fetchProfile()
  }, [session])

  if (status === 'loading') {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  if (!session) {
    router.push('/login')
    return null
  }

  const handleEdit = () => {
    setIsEditing(true)
    setMessage('')
    setError('')
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      name: profile?.name || '',
      bio: profile?.bio || '',
      email: profile?.email || ''
    })
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          bio: formData.bio.trim()
        })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('プロフィールを更新しました')
        setIsEditing(false)
        setProfile(data.user)
        // セッション情報を更新
        await update()
      } else {
        setError(data.error || 'プロフィールの更新に失敗しました')
      }
    } catch (err) {
      setError('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return '未設定'
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        プロフィール
      </Typography>

      {message && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* プロフィールカード */}
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  margin: '0 auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '3rem'
                }}
              >
                {profile?.name?.[0]?.toUpperCase() || <AccountCircle sx={{ fontSize: '4rem' }} />}
              </Avatar>
              
              <Typography variant="h5" sx={{ mb: 1 }}>
                {profile?.name || 'ユーザー'}
              </Typography>
              
              {profile?.bio && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, px: 2 }}>
                  {profile.bio}
                </Typography>
              )}
              
              <Chip
                icon={session.user?.role === 'admin' ? <AdminPanelSettings /> : <Person />}
                label={session.user?.role === 'admin' ? '管理者' : 'メンバー'}
                color={session.user?.role === 'admin' ? 'error' : 'primary'}
                variant="outlined"
                sx={{ mt: 1 }}
              />

              {session.user?.emailVerified && (
                <Box sx={{ mt: 2 }}>
                  <Chip
                    icon={<CheckCircle />}
                    label="メール認証済み"
                    color="success"
                    size="small"
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* プロフィール情報 */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                基本情報
              </Typography>
              {!isEditing && (
                <Button
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                  variant="outlined"
                >
                  編集
                </Button>
              )}
            </Box>

            <Divider sx={{ mb: 3 }} />

            {isEditing ? (
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="名前"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      disabled={loading}
                      inputProps={{ maxLength: 50 }}
                      helperText={`${formData.name.length}/50文字`}
                      InputProps={{
                        startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="自己紹介"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      disabled={loading}
                      multiline
                      rows={3}
                      inputProps={{ maxLength: 200 }}
                      helperText={`${formData.bio.length}/200文字`}
                      placeholder="自己紹介を入力してください（任意）"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="メールアドレス"
                      value={formData.email}
                      disabled
                      InputProps={{
                        startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                      helperText="メールアドレスは変更できません"
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                    disabled={loading}
                  >
                    {loading ? '保存中...' : '保存'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    キャンセル
                  </Button>
                </Box>
              </Box>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Person sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        名前
                      </Typography>
                      <Typography variant="body1">
                        {profile?.name || '未設定'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Email sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        メールアドレス
                      </Typography>
                      <Typography variant="body1">
                        {profile?.email}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Badge sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        ユーザーID
                      </Typography>
                      <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                        {profile?.id || '未設定'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CalendarToday sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        メール認証日
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(profile?.emailVerified)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                {profile?.bio && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Person sx={{ mr: 2, color: 'text.secondary', mt: 0.5 }} />
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="body2" color="text.secondary">
                          自己紹介
                        </Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          {profile.bio}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>
            )}
          </Paper>

          {/* アカウント設定 */}
          <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              アカウント設定
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => router.push('/change-password')}
                disabled={!session?.user?.id}
              >
                パスワードを変更
              </Button>
              
              <Button
                variant="outlined"
                color="error"
                disabled
              >
                アカウントを削除
              </Button>
            </Box>
            
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              ※ アカウント削除機能は現在開発中です
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}