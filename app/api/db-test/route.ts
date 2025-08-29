import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 環境変数の完全な状態確認
    const dbEnvs = {
      DATABASE_URL: process.env.DATABASE_URL,
      DB_URL: process.env.DB_URL,
      DB_URL_POSTGRES_PRISMA_URL: process.env.DB_URL_POSTGRES_PRISMA_URL,
      DB_URL_POSTGRES_URL: process.env.DB_URL_POSTGRES_URL,
      DB_URL_POSTGRES_HOST: process.env.DB_URL_POSTGRES_HOST,
      DB_URL_POSTGRES_USER: process.env.DB_URL_POSTGRES_USER,
      DB_URL_POSTGRES_DATABASE: process.env.DB_URL_POSTGRES_DATABASE,
    };

    // PostgreSQL URLの構築を試行
    let testUrl = process.env.DATABASE_URL;
    
    if (!testUrl || testUrl.startsWith('mongodb')) {
      if (process.env.DB_URL_POSTGRES_PRISMA_URL) {
        testUrl = process.env.DB_URL_POSTGRES_PRISMA_URL;
      } else if (process.env.DB_URL_POSTGRES_URL) {
        testUrl = process.env.DB_URL_POSTGRES_URL;
      } else {
        const host = process.env.DB_URL_POSTGRES_HOST;
        const user = process.env.DB_URL_POSTGRES_USER;
        const password = process.env.DB_URL_POSTGRES_PASSWORD;
        const database = process.env.DB_URL_POSTGRES_DATABASE;
        
        if (host && user && password && database) {
          testUrl = `postgresql://${user}:${password}@${host}/${database}?sslmode=require`;
        }
      }
    }

    // 直接PostgreSQLに接続をテスト
    let connectionTest = 'Not tested';
    if (testUrl && testUrl.startsWith('postgres')) {
      try {
        // 動的にPrismaクライアントを作成
        process.env.DATABASE_URL = testUrl;
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        await prisma.$connect();
        connectionTest = 'Success';
        await prisma.$disconnect();
      } catch (error: any) {
        connectionTest = `Failed: ${error.message}`;
      }
    }

    return NextResponse.json({
      success: true,
      environmentVariables: Object.keys(dbEnvs).reduce((obj, key) => {
        const value = dbEnvs[key];
        obj[key] = value ? {
          exists: true,
          preview: value.substring(0, 30) + '...',
          protocol: value.split('://')[0] + '://'
        } : { exists: false };
        return obj;
      }, {} as any),
      testUrl: testUrl ? {
        exists: true,
        preview: testUrl.substring(0, 50) + '...',
        protocol: testUrl.split('://')[0] + '://'
      } : { exists: false },
      connectionTest,
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