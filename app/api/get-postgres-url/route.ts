import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // PostgreSQL URLの構築を試行
    const host = process.env.DB_URL_POSTGRES_HOST || process.env.DB_URL_PGHOST;
    const user = process.env.DB_URL_POSTGRES_USER || process.env.DB_URL_PGUSER;
    const password = process.env.DB_URL_POSTGRES_PASSWORD || process.env.DB_URL_PGPASSWORD;
    const database = process.env.DB_URL_POSTGRES_DATABASE || process.env.DB_URL_PGDATABASE;
    
    // 既存の完全なURL環境変数をチェック
    const existingUrls = {
      DB_URL_POSTGRES_PRISMA_URL: process.env.DB_URL_POSTGRES_PRISMA_URL,
      DB_URL_POSTGRES_URL: process.env.DB_URL_POSTGRES_URL,
      DB_URL_POSTGRES_URL_NON_POOLING: process.env.DB_URL_POSTGRES_URL_NON_POOLING,
      DB_URL_POSTGRES_URL_NO_SSL: process.env.DB_URL_POSTGRES_URL_NO_SSL
    };
    
    let recommendedUrl = null;
    
    // 優先順位で推奨URLを決定
    if (process.env.DB_URL_POSTGRES_PRISMA_URL) {
      recommendedUrl = process.env.DB_URL_POSTGRES_PRISMA_URL;
    } else if (process.env.DB_URL_POSTGRES_URL) {
      recommendedUrl = process.env.DB_URL_POSTGRES_URL;
    } else if (host && user && password && database) {
      // 手動でURLを構築
      recommendedUrl = `postgresql://${user}:${password}@${host}/${database}?sslmode=require`;
    }
    
    return NextResponse.json({
      success: true,
      message: "PostgreSQL URL information",
      components: {
        host: host ? '✓' : '✗',
        user: user ? '✓' : '✗',
        password: password ? '✓' : '✗',
        database: database ? '✓' : '✗'
      },
      existingUrls: Object.keys(existingUrls).reduce((obj, key) => {
        obj[key] = existingUrls[key] ? 'Available' : 'Not set';
        return obj;
      }, {} as any),
      recommendedUrl: recommendedUrl ? recommendedUrl.substring(0, 20) + '...[PROTECTED]' : 'Not available',
      fullRecommendedUrl: recommendedUrl, // 実際のURL（デバッグ用）
      instruction: recommendedUrl 
        ? `Copy this URL and set it as DATABASE_URL in Vercel: ${recommendedUrl}`
        : "No suitable PostgreSQL URL found in environment variables"
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}