"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn, getSession } from "next-auth/react"
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  Link,
  CircularProgress,
  Divider
} from "@mui/material"
import { Google as GoogleIcon } from "@mui/icons-material"
import NextLink from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const mapNextAuthError = (code: string) => {
    switch (code) {
      case "CredentialsSignin":
        return "メールアドレスまたはパスワードが正しくありません"
      case "OAuthAccountNotLinked":
        return "このメールアドレスは他のログイン方法で既に登録されています。メール/パスワードで作成した場合はその方法でログインしてください"
      case "OAuthSignin":
      case "OAuthCallback":
        return "外部プロバイダでのログインに失敗しました。時間をおいて再度お試しください"
      case "Configuration":
        return "サーバ設定エラーです。NEXTAUTH_SECRET/NEXTAUTH_URL を確認してください"
      default:
        return "ログインに失敗しました"
    }
  }

  useEffect(() => {
    // Check if user is already logged in
    getSession().then((session) => {
      if (session) {
        const callbackUrl = searchParams.get("callbackUrl") || "/"
        router.push(callbackUrl)
      }
    })

    const err = searchParams.get("error")
    if (err) {
      setError(mapNextAuthError(err))
    }

    // 初期表示時は必ず空にする（ブラウザのオートフィル対策）
    setEmail("")
    setPassword("")
  }, [router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        // メール未認証エラーをチェック
        if (result.error.includes("メールアドレスの認証が完了していません")) {
          setError("メールアドレスの認証が完了していません。確認メールをご確認ください。")
        } else {
          setError("メールアドレスまたはパスワードが正しくありません")
        }
      } else if (result?.ok) {
        // ログイン成功時のリダイレクト処理
        const callbackUrl = searchParams.get("callbackUrl") || "/"
        router.push(callbackUrl)
      }
    } catch (err) {
      setError("ログインに失敗しました")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      // アカウント選択を強制して、キャッシュされたアカウントを回避
      await signIn("google", { 
        callbackUrl: "/",
        prompt: "select_account" // Googleアカウント選択画面を表示
      })
    } catch (err) {
      setError("Googleログインに失敗しました")
      setLoading(false)
    }
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Typography component="h1" variant="h4" sx={{ mb: 3 }}>
            ログイン
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
              {error}
              {error.includes("メールアドレスの認証が完了していません") && (
                <Box sx={{ mt: 1 }}>
                  <Link 
                    component={NextLink} 
                    href="/verify-email" 
                    variant="body2"
                    sx={{ color: "error.main", textDecoration: "underline" }}
                  >
                    認証メールを再送信する
                  </Link>
                </Box>
              )}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ mt: 1, width: "100%" }}
            autoComplete="off"
            noValidate
          >
            {/* ブラウザの自動入力を避けるためのダミーフィールド */}
            <input type="text" name="fake-username" autoComplete="username" style={{ display: "none" }} />
            <input type="password" name="fake-password" autoComplete="new-password" style={{ display: "none" }} />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="メールアドレス"
              name="email"
              autoComplete="off"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              inputProps={{ autoComplete: "off" }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="パスワード"
              type="password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              inputProps={{ autoComplete: "new-password" }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? "ログイン中..." : "ログイン"}
            </Button>

            <Divider sx={{ my: 2 }}>または</Divider>

            <Button
              fullWidth
              variant="outlined"
              onClick={handleGoogleLogin}
              disabled={loading}
              startIcon={<GoogleIcon />}
              sx={{ 
                mb: 2,
                borderColor: "#4285f4",
                color: "#4285f4",
                "&:hover": {
                  borderColor: "#357ae8",
                  backgroundColor: "rgba(66, 133, 244, 0.04)"
                }
              }}
            >
              Googleでログイン
            </Button>

            <Box sx={{ textAlign: "center" }}>
              <Link component={NextLink} href="/register" variant="body2">
                アカウントをお持ちでない方はこちら
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}