import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // ユーザーを管理者に昇格（テスト用）
    const user = await prisma.user.update({
      where: { email },
      data: { 
        role: 'admin'
      },
    });
    
    return NextResponse.json({
      message: 'User promoted to admin successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('Admin promotion error:', error);
    return NextResponse.json(
      { error: 'Failed to promote to admin', details: error.message },
      { status: 500 }
    );
  }
}