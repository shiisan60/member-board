import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// 環境変数の動的マッピング関数
function setupDatabaseUrl() {
  console.log('=== Database URL Setup ===');
  
  // 現在の状態を確認
  console.log('Before mapping:');
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  console.log('DB_URL exists:', !!process.env.DB_URL);
  console.log('DB_URL_POOLED exists:', !!process.env.DB_URL_POOLED);
  console.log('DB_URL_NONPOOLED exists:', !!process.env.DB_URL_NONPOOLED);
  
  // Vercel/Neonの環境変数マッピング
  // DATABASE_URLがMongoDBの場合は、PostgreSQL URLで上書き
  const currentUrl = process.env.DATABASE_URL;
  if (!currentUrl || currentUrl.startsWith('mongodb')) {
    console.log('Current DATABASE_URL is MongoDB or missing, looking for PostgreSQL URL...');
    
    // PostgreSQL用のNeon URLを探す
    const pgEnvKeys = Object.keys(process.env).filter(key => 
      key.includes('POSTGRES') || key.includes('DB_URL')
    );
    console.log('Available PostgreSQL env keys:', pgEnvKeys);
    
    // 優先順位でPostgreSQL URLを選択（Neon固有の変数を優先）
    if (process.env.DB_URL_POSTGRES_PRISMA_URL) {
      console.log('Using DB_URL_POSTGRES_PRISMA_URL for PostgreSQL connection');
      process.env.DATABASE_URL = process.env.DB_URL_POSTGRES_PRISMA_URL;
    } else if (process.env.DB_URL_POSTGRES_URL) {
      console.log('Using DB_URL_POSTGRES_URL for PostgreSQL connection');
      process.env.DATABASE_URL = process.env.DB_URL_POSTGRES_URL;
    } else if (process.env.DB_URL_POOLED) {
      console.log('Using DB_URL_POOLED for PostgreSQL connection');
      process.env.DATABASE_URL = process.env.DB_URL_POOLED;
    } else if (process.env.DB_URL_NONPOOLED) {
      console.log('Using DB_URL_NONPOOLED for PostgreSQL connection');
      process.env.DATABASE_URL = process.env.DB_URL_NONPOOLED;
    } else if (process.env.DB_URL) {
      console.log('Using DB_URL for PostgreSQL connection');
      process.env.DATABASE_URL = process.env.DB_URL;
    } else {
      // PostgreSQL URLを環境変数から探す
      for (const key of pgEnvKeys) {
        const value = process.env[key];
        if (value && (value.startsWith('postgres') || value.startsWith('postgresql'))) {
          console.log(`Using ${key} for PostgreSQL connection`);
          process.env.DATABASE_URL = value;
          break;
        }
      }
    }
  }
  
  // 結果を確認
  console.log('After mapping:');
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  console.log('DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 20) + '...');
  console.log('========================');
}

export async function GET() {
  try {
    // 環境変数を動的にセットアップ
    setupDatabaseUrl();
    
    // DATABASE_URLが設定されていない場合はエラー
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not configured after mapping attempt');
    }
    
    // Prismaクライアントを動的に作成
    const prisma = new PrismaClient();
    
    // Check database connection
    await prisma.$connect();
    
    // Check if admin exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    });

    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: 'Admin user already exists',
        adminExists: true
      });
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('Admin1234!', 10);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: 'Admin',
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: new Date(),
      }
    });

    await prisma.$disconnect();
    
    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      adminEmail: admin.email
    });
  } catch (error: any) {
    console.error('Database initialization error:', error);
    
    // より詳細なエラー情報
    const errorInfo = {
      message: error.message,
      code: error.code,
      meta: error.meta,
      envCheck: {
        DATABASE_URL_exists: !!process.env.DATABASE_URL,
        DATABASE_URL_preview: process.env.DATABASE_URL?.substring(0, 30) + '...',
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
      }
    };
    
    return NextResponse.json({
      success: false,
      error: error.message,
      debug: errorInfo,
      hint: 'Check Vercel logs for detailed environment variable information'
    }, { status: 500 });
  }
}