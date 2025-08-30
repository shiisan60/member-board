import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // すべてのユーザーの詳細情報を取得
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        emailVerified: true,
        verificationToken: true,
        password: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // 特定の問題のあるメールアドレスをチェック
    const problematicEmails = [
      '03shimizutaka@gmail.com',
      'himawarishimizu3d@gmail.com',
      'himawarishimizu01@gmail.com'
    ];

    const problematicUsers = users.filter(user => 
      problematicEmails.includes(user.email)
    );

    const idFormats = users.map(user => ({
      email: user.email,
      id: user.id,
      idLength: user.id.length,
      isObjectId: user.id.length === 24 && /^[a-f\d]{24}$/i.test(user.id),
      isCuid: user.id.length === 25 && user.id.startsWith('c')
    }));

    return NextResponse.json({
      totalUsers: users.length,
      users: users,
      problematicUsers: problematicUsers,
      idFormats: idFormats,
      summary: {
        objectIdCount: idFormats.filter(u => u.isObjectId).length,
        cuidCount: idFormats.filter(u => u.isCuid).length,
        otherFormats: idFormats.filter(u => !u.isObjectId && !u.isCuid).length
      }
    });

  } catch (error: any) {
    console.error('Detailed user check error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check users', 
        details: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}