"use client"

import React, { useEffect } from "react"
import { signOut } from "next-auth/react"
import { Container, Typography, CircularProgress, Box } from "@mui/material"

export default function ClearSessionPage() {
  useEffect(() => {
    const clearSession = async () => {
      try {
        // NextAuthセッションをクリア
        await signOut({ redirect: false })
        
        // ローカルストレージをクリア
        if (typeof window !== "undefined") {
          localStorage.clear()
          sessionStorage.clear()
          
          // Cookieをクリア
          document.cookie.split(";").forEach((c) => {
            const eqPos = c.indexOf("=")
            const name = eqPos > -1 ? c.substr(0, eqPos) : c
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"
          })
          
          // 少し待ってからログインページにリダイレクト
          setTimeout(() => {
            window.location.href = "/login"
          }, 2000)
        }
      } catch (error) {
        console.error("セッションクリアエラー:", error)
        window.location.href = "/login"
      }
    }

    clearSession()
  }, [])

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
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="h6" component="h1" gutterBottom>
          セッションをクリア中...
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          ログイン状態を完全にリセットしています。<br />
          しばらくお待ちください。
        </Typography>
      </Box>
    </Container>
  )
}