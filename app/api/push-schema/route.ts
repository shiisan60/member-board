import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

export async function POST() {
  try {
    console.log('Starting database schema push...');
    
    // 環境変数の設定確認
    if (!process.env.DATABASE_URL) {
      // DB_URLから設定を試行
      if (process.env.DB_URL_POSTGRES_PRISMA_URL) {
        process.env.DATABASE_URL = process.env.DB_URL_POSTGRES_PRISMA_URL;
      } else if (process.env.DB_URL_POSTGRES_URL) {
        process.env.DATABASE_URL = process.env.DB_URL_POSTGRES_URL;
      } else {
        throw new Error('DATABASE_URL not configured');
      }
    }

    console.log('DATABASE_URL configured:', !!process.env.DATABASE_URL);
    
    // Prisma db push を実行
    let pushResult;
    try {
      pushResult = execSync('npx prisma db push --force-reset --accept-data-loss', {
        encoding: 'utf8',
        env: {
          ...process.env,
          DATABASE_URL: process.env.DATABASE_URL
        },
        timeout: 30000 // 30秒タイムアウト
      });
      console.log('Schema push result:', pushResult);
    } catch (execError: any) {
      console.error('Schema push failed:', execError.message);
      throw new Error(`Schema push failed: ${execError.message}`);
    }

    // テーブル作成確認
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
      await prisma.$connect();
      
      // ユーザーテーブルの存在確認
      const userCount = await prisma.user.count();
      console.log('User table accessible, current count:', userCount);
      
      await prisma.$disconnect();
      
      return NextResponse.json({
        success: true,
        message: 'Database schema pushed successfully',
        schemaOutput: pushResult,
        userTableCount: userCount,
        timestamp: new Date().toISOString()
      });
      
    } catch (dbError: any) {
      console.error('Database connection test failed:', dbError.message);
      await prisma.$disconnect();
      throw new Error(`Database test failed: ${dbError.message}`);
    }

  } catch (error: any) {
    console.error('Schema push error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      hint: 'Make sure DATABASE_URL is properly configured for PostgreSQL',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to push database schema',
    endpoint: '/api/push-schema',
    method: 'POST',
    description: 'This endpoint will push the Prisma schema to the connected PostgreSQL database'
  });
}