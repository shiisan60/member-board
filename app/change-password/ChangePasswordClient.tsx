"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Visibility,
  VisibilityOff,
  Lock as LockIcon
} from '@mui/icons-material'
import { PasswordStrengthIndicator } from '@/components/PasswordStrengthIndicator'

export default function ChangePasswordClient() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  if (status === 'loading') {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  if (!session) {
    router.push('/login')
    return null
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    // 入力検証
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('すべてのフィールドを入力してください')
      setLoading(false)
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('新しいパスワードが一致しません')
      setLoading(false)
      return
    }

    if (formData.newPassword.length < 8) {
      setError('新しいパスワードは8文字以上で入力してください')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('パスワードが変更されました')
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        // 3秒後にプロフィールページに戻る
        setTimeout(() => {
          router.push('/profile')
        }, 3000)
      } else {
        setError(data.error || 'パスワードの変更に失敗しました')
      }
    } catch (err) {
      setError('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/profile')}
          sx={{ mb: 2 }}
        >
          プロフィールに戻る
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          パスワード変更
        </Typography>
      </Box>

      {message && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {message}
          <br />
          <Typography variant="body2" sx={{ mt: 1 }}>
            3秒後にプロフィールページに戻ります...
          </Typography>
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper elevation={2} sx={{ p: 4 }}>
        <Box component="form" onSubmit={handleSubmit}>
          {/* 現在のパスワード */}
          <TextField
            fullWidth
            label="現在のパスワード"
            type={showPasswords.current ? 'text' : 'password'}
            value={formData.currentPassword}
            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
            required
            disabled={loading}
            margin="normal"
            InputProps={{
              startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => togglePasswordVisibility('current')}
                    disabled={loading}
                    edge="end"
                  >
                    {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* 新しいパスワード */}
          <TextField
            fullWidth
            label="新しいパスワード"
            type={showPasswords.new ? 'text' : 'password'}
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            required
            disabled={loading}
            margin="normal"
            inputProps={{ maxLength: 128 }}
            InputProps={{
              startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => togglePasswordVisibility('new')}
                    disabled={loading}
                    edge="end"
                  >
                    {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            helperText="8文字以上、大文字・小文字・数字・特殊文字のうち3種類以上を含む"
          />

          {/* パスワード強度インジケータ */}
          {formData.newPassword && (
            <Box sx={{ mt: 1, mb: 2 }}>
              <PasswordStrengthIndicator password={formData.newPassword} />
            </Box>
          )}

          {/* パスワード確認 */}
          <TextField
            fullWidth
            label="新しいパスワード（確認）"
            type={showPasswords.confirm ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
            disabled={loading}
            margin="normal"
            error={formData.confirmPassword && formData.newPassword !== formData.confirmPassword}
            helperText={
              formData.confirmPassword && formData.newPassword !== formData.confirmPassword
                ? 'パスワードが一致しません'
                : ''
            }
            InputProps={{
              startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => togglePasswordVisibility('confirm')}
                    disabled={loading}
                    edge="end"
                  >
                    {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              disabled={
                loading ||
                !formData.currentPassword ||
                !formData.newPassword ||
                !formData.confirmPassword ||
                formData.newPassword !== formData.confirmPassword
              }
              sx={{ minWidth: 140 }}
            >
              {loading ? '変更中...' : 'パスワード変更'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => router.push('/profile')}
              disabled={loading}
            >
              キャンセル
            </Button>
          </Box>
        </Box>

        <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            パスワードの要件
          </Typography>
          <Typography variant="body2" component="ul" sx={{ m: 0, pl: 2 }}>
            <li>8文字以上128文字以内</li>
            <li>大文字、小文字、数字、特殊文字のうち少なくとも3種類を含む</li>
            <li>現在のパスワードとは異なるもの</li>
          </Typography>
        </Box>
      </Paper>
    </Container>
  )
}