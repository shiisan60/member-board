import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Vercelの本番環境でDB_URLを使用する場合のフォールバック
if (process.env.DB_URL && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DB_URL;
}

const prisma = new PrismaClient();

export async function GET() {
  try {
    // デバッグ情報を追加
    console.log('Environment check:');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('DB_URL exists:', !!process.env.DB_URL);
    
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

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      adminEmail: admin.email
    });
  } catch (error: any) {
    console.error('Database initialization error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      hint: 'Make sure DATABASE_URL is configured and Prisma schema is pushed to database'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}