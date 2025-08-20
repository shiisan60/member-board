"use client"

import React from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  IconButton,
  Chip
} from "@mui/material"
import {
  Dashboard as DashboardIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  AccountCircle as AccountIcon,
  ExitToApp as LogoutIcon,
  Home as HomeIcon,
  AdminPanelSettings as AdminIcon
} from "@mui/icons-material"

export default function Navbar() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [isAdmin, setIsAdmin] = React.useState(false)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    handleMenuClose()
    // セッションを完全にクリア
    await signOut({
      callbackUrl: "/login",
      redirect: true
    })
    // ブラウザのキャッシュもクリア
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
  }

  React.useEffect(() => {
    // Check if user has admin role in session
    if (session?.user?.role === "admin") {
      setIsAdmin(true)
    } else {
      setIsAdmin(false)
    }
  }, [session])

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  const isActive = (path: string) => pathname === path

  return (
    <AppBar position="sticky" elevation={1}>
      <Toolbar>
        {/* Logo/Title */}
        <Box 
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            cursor: "pointer",
            mr: 3
          }}
          onClick={() => handleNavigation("/")}
        >
          <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
            Member Board
          </Typography>
        </Box>

        {/* Navigation Links */}
        <Box sx={{ flexGrow: 1, display: "flex", gap: 1 }}>
          <Button
            color="inherit"
            startIcon={<HomeIcon />}
            onClick={() => handleNavigation("/")}
            sx={{
              bgcolor: isActive("/") ? "rgba(255,255,255,0.1)" : "transparent",
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" }
            }}
          >
            ホーム
          </Button>

          {session && (
            <>
              <Button
                color="inherit"
                onClick={() => handleNavigation("/posts")}
                sx={{
                  bgcolor: pathname.startsWith("/posts") ? "rgba(255,255,255,0.1)" : "transparent",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" }
                }}
              >
                投稿
              </Button>
              <Button
                color="inherit"
                startIcon={<DashboardIcon />}
                onClick={() => handleNavigation("/dashboard")}
                sx={{
                  bgcolor: isActive("/dashboard") ? "rgba(255,255,255,0.1)" : "transparent",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" }
                }}
              >
                ダッシュボード
              </Button>
              {isAdmin && (
                <Button
                  color="inherit"
                  startIcon={<AdminIcon />}
                  onClick={() => handleNavigation("/admin")}
                  sx={{
                    bgcolor: isActive("/admin") ? "rgba(255,255,255,0.1)" : "transparent",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                    color: "warning.light"
                  }}
                >
                  管理者
                </Button>
              )}
            </>
          )}
        </Box>

        {/* User Menu */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {status === "loading" ? (
            <Typography variant="body2" color="inherit">
              読み込み中...
            </Typography>
          ) : session ? (
            <>
              <Chip
                label={`${session.user?.name || "ユーザー"}`}
                variant="outlined"
                sx={{
                  color: "white",
                  borderColor: "rgba(255,255,255,0.3)",
                  "& .MuiChip-label": { color: "white" }
                }}
              />
              <IconButton
                size="large"
                edge="end"
                aria-label="account"
                aria-controls="user-menu"
                aria-haspopup="true"
                onClick={handleMenuOpen}
                color="inherit"
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: "rgba(255,255,255,0.2)",
                    fontSize: "0.875rem"
                  }}
                >
                  <AccountIcon />
                </Avatar>
              </IconButton>
              <Menu
                id="user-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    mt: 1.5,
                    minWidth: 200,
                    "& .MuiMenuItem-root": {
                      px: 2,
                      py: 1,
                    },
                  },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    ログイン中
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {session.user?.email}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={() => { handleMenuClose(); handleNavigation("/profile") }}>
                  <AccountIcon sx={{ mr: 2 }} />
                  プロフィール
                </MenuItem>
                <MenuItem onClick={() => { handleMenuClose(); handleNavigation("/dashboard") }}>
                  <DashboardIcon sx={{ mr: 2 }} />
                  ダッシュボード
                </MenuItem>
                {isAdmin && (
                  <MenuItem onClick={() => { handleMenuClose(); handleNavigation("/admin") }}>
                    <AdminIcon sx={{ mr: 2, color: "warning.main" }} />
                    管理者ダッシュボード
                  </MenuItem>
                )}
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
                  <LogoutIcon sx={{ mr: 2 }} />
                  ログアウト
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                color="inherit"
                startIcon={<LoginIcon />}
                onClick={() => handleNavigation("/login")}
                sx={{
                  bgcolor: isActive("/login") ? "rgba(255,255,255,0.1)" : "transparent",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" }
                }}
              >
                ログイン
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<PersonAddIcon />}
                onClick={() => handleNavigation("/register")}
                sx={{
                  borderColor: "rgba(255,255,255,0.3)",
                  bgcolor: isActive("/register") ? "rgba(255,255,255,0.1)" : "transparent",
                  "&:hover": { 
                    bgcolor: "rgba(255,255,255,0.1)",
                    borderColor: "rgba(255,255,255,0.5)"
                  }
                }}
              >
                新規登録
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}