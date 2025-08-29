import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // 環境変数の状態を確認
    const envStatus = {
      DATABASE_URL: process.env.DATABASE_URL ? '設定済み' : '未設定',
      DB_URL: process.env.DB_URL ? '設定済み' : '未設定',
      DATABASE_PROVIDER: process.env.DATABASE_PROVIDER || '未設定',
      NODE_ENV: process.env.NODE_ENV || '未設定'
    };

    // データベース接続のテスト
    let dbConnectionStatus = 'テスト未実行';
    let userCount = null;
    
    try {
      // ユーザー数を取得してデータベース接続を確認
      userCount = await prisma.user.count();
      dbConnectionStatus = '接続成功';
    } catch (error) {
      dbConnectionStatus = `接続失敗: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    // データベースタイプの判定
    let databaseType = 'Unknown';
    if (process.env.DATABASE_URL) {
      if (process.env.DATABASE_URL.includes('postgresql')) {
        databaseType = 'PostgreSQL';
      } else if (process.env.DATABASE_URL.includes('file:')) {
        databaseType = 'SQLite';
      } else if (process.env.DATABASE_URL.includes('mysql')) {
        databaseType = 'MySQL';
      }
    }

    return NextResponse.json({
      success: true,
      message: 'データベース接続テスト',
      environment: envStatus,
      database: {
        type: databaseType,
        status: dbConnectionStatus,
        userCount: userCount
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}