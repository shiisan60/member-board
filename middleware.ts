import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { checkRateLimit, addRateLimitHeaders } from "@/lib/security/rateLimiter"
import { addSecurityHeaders, addAPISecurityHeaders } from "@/lib/security/headers"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // レート制限チェック（全リクエストに適用）
  const rateLimitResponse = checkRateLimit(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  // APIルートの場合
  if (pathname.startsWith('/api/')) {
    let response = NextResponse.next()
    
    // APIセキュリティヘッダーを追加
    response = addAPISecurityHeaders(response)
    
    // レート制限ヘッダーを追加
    response = addRateLimitHeaders(response, request)
    
    return response
  }

  // NextAuth関連のルートはスキップ
  if (pathname.startsWith('/auth/')) {
    return NextResponse.next()
  }

  // 認証済みユーザーがアクセスすべきでないルート
  const authRoutes = ['/login', '/register']
  
  // 認証が必要なルートの定義
  const protectedRoutes = [
    '/dashboard',
    '/profile', 
    '/posts/create',
    '/posts/new',
    '/posts/edit',
    '/admin'
  ]
  
  const session = await auth()

  // 認証ルートの場合（ログイン、登録）
  if (authRoutes.some(route => pathname === route)) {
    if (session) {
      // 認証済みの場合はホームにリダイレクト
      return NextResponse.redirect(new URL('/', request.url))
    }
    // 未認証の場合はそのまま表示
    return NextResponse.next()
  }

  // ホームページの場合
  if (pathname === '/') {
    if (!session) {
      // 未認証の場合はログインページにリダイレクト
      return NextResponse.redirect(new URL('/login', request.url))
    }
    // 認証済みの場合はそのまま表示
    return NextResponse.next()
  }

  // 保護されたルートの場合
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!session) {
      // 未認証の場合はログインページにリダイレクト
      const url = new URL('/login', request.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }

    // 管理者ページの場合、roleチェック
    if (pathname.startsWith('/admin')) {
      if (session.user?.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
  }

  // 通常のページリクエストにセキュリティヘッダーを追加
  let response = NextResponse.next()
  response = addSecurityHeaders(response)
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}