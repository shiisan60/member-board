import { LRUCache } from 'lru-cache';
import { NextRequest, NextResponse } from 'next/server';

// レート制限設定
interface RateLimit {
  requests: number;
  window: number; // ミリ秒
}

const RATE_LIMITS: Record<string, RateLimit> = {
  // 投稿関連
  'POST:/api/posts': { requests: 5, window: 60000 }, // 1分間に5回
  'PUT:/api/posts': { requests: 10, window: 60000 }, // 1分間に10回
  'DELETE:/api/posts': { requests: 10, window: 60000 }, // 1分間に10回
  
  // 認証関連
  'POST:/api/auth/login': { requests: 5, window: 300000 }, // 5分間に5回
  'POST:/api/auth/register': { requests: 3, window: 300000 }, // 5分間に3回
  
  // デフォルト
  'default': { requests: 100, window: 60000 } // 1分間に100回
};

// LRU Cacheでレート制限データを管理
const cache = new LRUCache<string, number[]>({
  max: 10000, // 最大10,000エントリ
  ttl: 300000 // 5分でTTL
});

/**
 * IPアドレスを取得
 */
function getClientIP(request: NextRequest): string {
  // Vercelや他のプロキシ環境でのIPアドレス取得
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  // フォールバック
  return request.ip || '127.0.0.1';
}

/**
 * レート制限キーを生成
 */
function getRateLimitKey(ip: string, method: string, pathname: string): string {
  // パスのパラメータを正規化（例: /api/posts/123 → /api/posts/[id]）
  const normalizedPath = pathname.replace(/\/[a-zA-Z0-9-_]+$/, '/[id]');
  const endpoint = `${method}:${normalizedPath}`;
  
  return `${ip}:${endpoint}`;
}

/**
 * レート制限チェック
 */
export function checkRateLimit(request: NextRequest): NextResponse | null {
  const ip = getClientIP(request);
  const method = request.method;
  const pathname = request.nextUrl.pathname;
  
  // レート制限設定を取得
  const normalizedPath = pathname.replace(/\/[a-zA-Z0-9-_]+$/, '/[id]');
  const endpoint = `${method}:${normalizedPath}`;
  const rateLimit = RATE_LIMITS[endpoint] || RATE_LIMITS.default;
  
  // キャッシュキーを生成
  const key = getRateLimitKey(ip, method, pathname);
  
  // 現在時刻
  const now = Date.now();
  const windowStart = now - rateLimit.window;
  
  // 既存のリクエスト履歴を取得
  let requests = cache.get(key) || [];
  
  // ウィンドウ外のリクエストを除外
  requests = requests.filter(timestamp => timestamp > windowStart);
  
  // リクエスト制限チェック
  if (requests.length >= rateLimit.requests) {
    // 429 Too Many Requests
    return NextResponse.json(
      {
        error: 'レート制限に達しました。しばらく時間をおいてから再試行してください。',
        retryAfter: Math.ceil(rateLimit.window / 1000)
      },
      { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil(rateLimit.window / 1000).toString(),
          'X-RateLimit-Limit': rateLimit.requests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(now + rateLimit.window).toISOString()
        }
      }
    );
  }
  
  // 新しいリクエストを記録
  requests.push(now);
  cache.set(key, requests);
  
  // 制限内の場合はnullを返す（処理続行）
  return null;
}

/**
 * レート制限情報をヘッダーに追加
 */
export function addRateLimitHeaders(response: NextResponse, request: NextRequest): NextResponse {
  const ip = getClientIP(request);
  const method = request.method;
  const pathname = request.nextUrl.pathname;
  
  const normalizedPath = pathname.replace(/\/[a-zA-Z0-9-_]+$/, '/[id]');
  const endpoint = `${method}:${normalizedPath}`;
  const rateLimit = RATE_LIMITS[endpoint] || RATE_LIMITS.default;
  
  const key = getRateLimitKey(ip, method, pathname);
  const now = Date.now();
  const windowStart = now - rateLimit.window;
  
  const requests = (cache.get(key) || []).filter(timestamp => timestamp > windowStart);
  const remaining = Math.max(0, rateLimit.requests - requests.length);
  
  response.headers.set('X-RateLimit-Limit', rateLimit.requests.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', new Date(now + rateLimit.window).toISOString());
  
  return response;
}

/**
 * レート制限統計の取得（管理者用）
 */
export function getRateLimitStats(): any {
  const stats = {
    totalEntries: cache.size,
    cacheStats: {
      max: cache.max,
      ttl: cache.ttl
    },
    rateLimits: RATE_LIMITS
  };
  
  return stats;
}