"use client"

import { useEffect, useState } from "react"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
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
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1分間はデータをfreshとみなす
            gcTime: 5 * 60 * 1000, // 5分間キャッシュを保持
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

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
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Navbar />
            <main style={{ flexGrow: 1, padding: "20px" }}>
              {children}
            </main>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  )
}