import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    
    // データベース接続テスト
    let dbStatus = 'unknown';
    let userCount = 0;
    try {
      await prisma.$connect();
      userCount = await prisma.user.count();
      dbStatus = 'connected';
      await prisma.$disconnect();
    } catch (dbError) {
      dbStatus = `error: ${dbError.message}`;
    }
    
    // 環境変数チェック
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'not set',
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      AUTH_SECRET: !!process.env.AUTH_SECRET,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
    };
    
    // プロバイダー設定チェック
    const providerCheck = {
      googleClientId: !!process.env.AUTH_GOOGLE_ID,
      googleClientSecret: !!process.env.AUTH_GOOGLE_SECRET,
    };
    
    return NextResponse.json({
      success: true,
      session: session ? {
        user: {
          id: session.user?.id,
          email: session.user?.email,
          name: session.user?.name,
          role: session.user?.role,
        },
        expires: session.expires
      } : null,
      database: {
        status: dbStatus,
        userCount: userCount,
        url: process.env.DATABASE_URL ? 
          process.env.DATABASE_URL.substring(0, 20) + '...' : 
          'not set'
      },
      environment: envCheck,
      providers: providerCheck,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Auth debug error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}