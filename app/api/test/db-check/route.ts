import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 環境変数の確認
    const hasDbUrl = !!process.env.DATABASE_URL;
    const dbUrlPrefix = process.env.DATABASE_URL?.substring(0, 20) + '...';
    
    // データベース接続テスト
    let connectionStatus = 'Not tested';
    let userCount = -1;
    
    try {
      // シンプルなクエリでデータベース接続を確認
      const users = await prisma.user.count();
      userCount = users;
      connectionStatus = 'Connected';
    } catch (dbError: any) {
      connectionStatus = `Failed: ${dbError.message}`;
    }
    
    return NextResponse.json({
      status: 'OK',
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        hasDbUrl,
        dbUrlPrefix,
        authTrustHost: process.env.AUTH_TRUST_HOST,
        nextAuthUrl: process.env.NEXTAUTH_URL,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      },
      database: {
        connectionStatus,
        userCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'Database check failed',
        message: error.message,
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          hasDbUrl: !!process.env.DATABASE_URL,
        }
      },
      { status: 500 }
    );
  }
}