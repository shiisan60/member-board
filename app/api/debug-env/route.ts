import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 環境変数の詳細デバッグ
    const envDebug = {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      DATABASE_URL_exists: !!process.env.DATABASE_URL,
      DATABASE_URL_length: process.env.DATABASE_URL?.length || 0,
      DATABASE_URL_starts_with: process.env.DATABASE_URL?.substring(0, 20) + '...',
      DB_URL_exists: !!process.env.DB_URL,
      DB_URL_POOLED_exists: !!process.env.DB_URL_POOLED,
      DB_URL_NONPOOLED_exists: !!process.env.DB_URL_NONPOOLED,
      all_env_keys: Object.keys(process.env).filter(key => 
        key.includes('DATABASE') || key.includes('DB_URL')
      ),
    };

    console.log('=== Environment Debug ===');
    console.log(JSON.stringify(envDebug, null, 2));

    return NextResponse.json({
      success: true,
      debug: envDebug,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}