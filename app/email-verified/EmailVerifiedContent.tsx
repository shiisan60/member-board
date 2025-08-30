'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container, Typography, Alert, Box, Button, CircularProgress } from '@mui/material';
import { CheckCircle as CheckCircleIcon, Error as ErrorIcon } from '@mui/icons-material';
import Link from 'next/link';

interface VerificationResult {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    name: string;
    emailVerified: string;
  };
  error?: string;
}

export default function EmailVerifiedContent() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setResult({
        success: false,
        message: '認証トークンが見つかりません',
        error: 'No token provided'
      });
      setLoading(false);
      return;
    }

    // メール認証を実行
    fetch(`/api/auth/verify?token=${token}`)
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          setResult({
            success: false,
            message: data.error,
            error: data.error
          });
        } else {
          setResult({
            success: true,
            message: data.message,
            user: data.user
          });
        }
      })
      .catch(error => {
        console.error('Verification error:', error);
        setResult({
          success: false,
          message: 'メール認証中にエラーが発生しました',
          error: error.message
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchParams]);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          メールアドレスを認証中...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Box textAlign="center">
        {result?.success ? (
          <>
            <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h4" gutterBottom color="success.main">
              認証完了
            </Typography>
            <Alert severity="success" sx={{ mb: 3 }}>
              {result.message}
            </Alert>
            {result.user && (
              <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="h6">ユーザー情報</Typography>
                <Typography>メール: {result.user.email}</Typography>
                <Typography>名前: {result.user.name}</Typography>
                <Typography>
                  認証日時: {new Date(result.user.emailVerified).toLocaleString('ja-JP')}
                </Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                component={Link}
                href="/login"
                variant="contained"
                color="primary"
                size="large"
              >
                ログインする
              </Button>
              <Button
                component={Link}
                href="/"
                variant="outlined"
                size="large"
              >
                ホームに戻る
              </Button>
            </Box>
          </>
        ) : (
          <>
            <ErrorIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h4" gutterBottom color="error.main">
              認証失敗
            </Typography>
            <Alert severity="error" sx={{ mb: 3 }}>
              {result?.message}
            </Alert>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                component={Link}
                href="/register"
                variant="contained"
                color="primary"
                size="large"
              >
                新規登録
              </Button>
              <Button
                component={Link}
                href="/"
                variant="outlined"
                size="large"
              >
                ホームに戻る
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
}