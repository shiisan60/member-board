import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: Request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // ユーザーが存在するか確認
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // 関連データも含めてユーザーを削除
    // まず関連する投稿を削除
    await prisma.post.deleteMany({
      where: { authorId: user.id },
    });
    
    // セッションを削除
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });
    
    // アカウント情報を削除
    await prisma.account.deleteMany({
      where: { userId: user.id },
    });
    
    // 最後にユーザーを削除
    await prisma.user.delete({
      where: { id: user.id },
    });
    
    return NextResponse.json({
      message: 'User deleted successfully',
      deletedUser: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    });
  } catch (error: any) {
    console.error('User deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // DELETEメソッドのエイリアス（テスト用）
  return DELETE(request);
}