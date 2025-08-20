"use client"

import { useEffect, useState } from "react"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material"
import Navbar from "@/components/Navbar"

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
})

interface ClientLayoutProps {
  children: React.ReactNode
  session: any
}

export default function ClientLayout({ children, session }: ClientLayoutProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // サーバーサイドレンダリング時は簡単なローディング表示
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <div style={{ height: "64px", backgroundColor: "#1976d2" }}></div>
        <main style={{ flexGrow: 1, padding: "20px" }}>読み込み中...</main>
      </div>
    )
  }

  return (
    <SessionProvider session={session}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          <Navbar />
          <main style={{ flexGrow: 1, padding: "20px" }}>
            {children}
          </main>
        </div>
      </ThemeProvider>
    </SessionProvider>
  )
}