import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET() {
  try {
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