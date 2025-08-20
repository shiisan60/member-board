"use client"

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Typography,
  Alert,
  Box,
  CircularProgress,
  Button,
  Link,
  TextField,
  Divider
} from '@mui/material';
import { CheckCircle, Error, Email } from '@mui/icons-material';
import NextLink from 'next/link';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setError('認証トークンが見つかりません');
      setLoading(false);
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(`/api/auth/verify?token=${token}`);
      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setMessage(data.message);
      } else {
        setError(data.error || 'メール認証に失敗しました');
      }
    } catch (err) {
      setError('認証処理中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!resendEmail) {
      setResendError('メールアドレスを入力してください');
      return;
    }

    setResendLoading(true);
    setResendError('');
    setResendMessage('');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resendEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setResendMessage(data.message);
        setResendEmail('');
      } else {
        setResendError(data.error || '再送信に失敗しました');
      }
    } catch (err) {
      setResendError('再送信処理中にエラーが発生しました');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h4" sx={{ mb: 3 }}>
            メール認証
          </Typography>

          {loading && (
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography variant="body1">
                メールアドレスを認証しています...
              </Typography>
            </Box>
          )}

          {success && !loading && (
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <CheckCircle 
                sx={{ fontSize: 60, color: 'success.main', mb: 2 }} 
              />
              <Alert severity="success" sx={{ mb: 2 }}>
                {message}
              </Alert>
              <Typography variant="body1" sx={{ mb: 3 }}>
                ログインしてMember Boardをお楽しみください。
              </Typography>
              <Button
                variant="contained"
                onClick={() => router.push('/login')}
                sx={{ mr: 2 }}
              >
                ログインページへ
              </Button>
            </Box>
          )}

          {error && !loading && (
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Error 
                sx={{ fontSize: 60, color: 'error.main', mb: 2 }} 
              />
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
              <Typography variant="body2" sx={{ mb: 3 }}>
                認証リンクが無効または期限切れの可能性があります。
                新しい認証メールをリクエストしてください。
              </Typography>
              
              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  認証メールを再送信
                </Typography>
              </Divider>

              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  type="email"
                  label="メールアドレス"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  disabled={resendLoading}
                  sx={{ mb: 2 }}
                  size="small"
                />
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  startIcon={resendLoading ? <CircularProgress size={20} /> : <Email />}
                >
                  {resendLoading ? '送信中...' : '認証メールを再送信'}
                </Button>
                
                {resendMessage && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    {resendMessage}
                  </Alert>
                )}
                
                {resendError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {resendError}
                  </Alert>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={() => router.push('/register')}
                >
                  新規登録に戻る
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => router.push('/login')}
                >
                  ログインページへ
                </Button>
              </Box>
            </Box>
          )}

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link component={NextLink} href="/" variant="body2">
              ホームページに戻る
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}