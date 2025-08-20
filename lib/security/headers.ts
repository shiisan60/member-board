import { NextResponse } from 'next/server';

/**
 * セキュリティヘッダーの設定
 */
export const SECURITY_HEADERS = {
  // クリックジャッキング攻撃を防ぐ
  'X-Frame-Options': 'DENY',
  
  // MIME タイプスニッフィング攻撃を防ぐ
  'X-Content-Type-Options': 'nosniff',
  
  // HTTPS の強制（本番環境のみ）
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // リファラー情報の制御
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // 権限ポリシーの制御
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.jsで必要
    "style-src 'self' 'unsafe-inline'", // Material-UIで必要
    "img-src 'self' data: https:",
    "font-src 'self' https:",
    "connect-src 'self'",
    "media-src 'self'",
    "object-src 'none'",
    "child-src 'none'",
    "worker-src 'self'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "manifest-src 'self'"
  ].join('; ')
} as const;

/**
 * レスポンスにセキュリティヘッダーを追加
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([name, value]) => {
    response.headers.set(name, value);
  });
  
  // 開発環境では HSTS を無効にする
  if (process.env.NODE_ENV !== 'production') {
    response.headers.delete('Strict-Transport-Security');
  }
  
  return response;
}

/**
 * API レスポンス用のセキュリティヘッダー
 */
export function addAPISecurityHeaders(response: NextResponse): NextResponse {
  // 基本的なセキュリティヘッダーを追加
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'no-referrer');
  
  // API専用ヘッダー
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  
  return response;
}

/**
 * CSP違反レポートの処理
 */
export function handleCSPViolation(report: any) {
  console.warn('CSP Violation:', {
    documentURI: report['document-uri'],
    referrer: report.referrer,
    blockedURI: report['blocked-uri'],
    effectiveDirective: report['effective-directive'],
    originalPolicy: report['original-policy'],
    sourceFile: report['source-file'],
    lineNumber: report['line-number'],
    columnNumber: report['column-number'],
    timestamp: new Date().toISOString()
  });
  
  // 本番環境では監査ログに記録
  if (process.env.NODE_ENV === 'production') {
    // TODO: 監査ログシステムと連携
  }
}

/**
 * セキュリティヘッダーのテスト用ユーティリティ
 */
export function validateSecurityHeaders(headers: Headers): { 
  valid: boolean; 
  missing: string[]; 
  warnings: string[] 
} {
  const requiredHeaders = [
    'X-Frame-Options',
    'X-Content-Type-Options',
    'Referrer-Policy',
    'Content-Security-Policy'
  ];
  
  const missing: string[] = [];
  const warnings: string[] = [];
  
  requiredHeaders.forEach(header => {
    if (!headers.get(header)) {
      missing.push(header);
    }
  });
  
  // HSTS チェック（本番環境のみ）
  if (process.env.NODE_ENV === 'production' && !headers.get('Strict-Transport-Security')) {
    warnings.push('Strict-Transport-Security header is missing in production');
  }
  
  // CSP の内容チェック
  const csp = headers.get('Content-Security-Policy');
  if (csp && csp.includes("'unsafe-eval'")) {
    warnings.push('Content-Security-Policy contains unsafe-eval');
  }
  
  return {
    valid: missing.length === 0,
    missing,
    warnings
  };
}