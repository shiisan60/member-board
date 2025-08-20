"use client"

import React from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Grid,
  Paper,
  Chip,
  Alert
} from "@mui/material"
import {
  Dashboard as DashboardIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Code as CodeIcon
} from "@mui/icons-material"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const features = [
    {
      icon: <SecurityIcon color="primary" fontSize="large" />,
      title: "セキュアな認証",
      description: "NextAuth.jsとbcryptによる安全なユーザー認証システム"
    },
    {
      icon: <SpeedIcon color="primary" fontSize="large" />,
      title: "高速パフォーマンス",
      description: "Next.js 15とReact 19による最新の技術スタック"
    },
    {
      icon: <CodeIcon color="primary" fontSize="large" />,
      title: "モダンな開発環境",
      description: "TypeScript、Material-UI、Prismaを使用した開発環境"
    }
  ]

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: "center", mb: 8 }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
          Member Board
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4, maxWidth: "800px", mx: "auto" }}>
          Next.js 15とNextAuth.jsで構築された<br />
          モダンなメンバー管理システム
        </Typography>
        
        {status === "loading" ? (
          <Typography>読み込み中...</Typography>
        ) : session ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              {session.user?.name || "ユーザー"}さん、ログイン中です
            </Alert>
            <Button
              variant="contained"
              size="large"
              startIcon={<DashboardIcon />}
              onClick={() => router.push("/dashboard")}
              sx={{ px: 4, py: 1.5 }}
            >
              ダッシュボードを開く
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<LoginIcon />}
              onClick={() => router.push("/login")}
              sx={{ px: 4, py: 1.5 }}
            >
              ログイン
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<PersonAddIcon />}
              onClick={() => router.push("/register")}
              sx={{ px: 4, py: 1.5 }}
            >
              新規登録
            </Button>
          </Box>
        )}
      </Box>

      {/* Features Section */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" component="h2" textAlign="center" gutterBottom sx={{ mb: 6 }}>
          主な機能
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card elevation={2} sx={{ height: "100%", textAlign: "center", p: 2 }}>
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Tech Stack Section */}
      <Paper elevation={1} sx={{ p: 4, textAlign: "center", bgcolor: "grey.50" }}>
        <Typography variant="h5" component="h2" gutterBottom>
          技術スタック
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 1, mt: 3 }}>
          {[
            "Next.js 15",
            "React 19",
            "NextAuth.js",
            "MongoDB",
            "Prisma",
            "Material-UI",
            "TypeScript",
            "bcrypt"
          ].map((tech) => (
            <Chip
              key={tech}
              label={tech}
              variant="outlined"
              color="primary"
              sx={{ m: 0.5 }}
            />
          ))}
        </Box>
      </Paper>
    </Container>
  )
}
