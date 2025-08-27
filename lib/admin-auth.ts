import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export async function requireAdmin(): Promise<AdminUser> {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error('認証が必要です');
  }

  // データベースからユーザー情報とロールを取得
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    }
  });

  if (!user) {
    throw new Error('ユーザーが見つかりません');
  }

  if (user.role !== 'ADMIN') {
    throw new Error('管理者権限が必要です');
  }

  return user as AdminUser;
}

export function createAdminResponse(error: string, status: number = 403) {
  return NextResponse.json(
    { error, success: false },
    { status }
  );
}

export async function withAdminAuth<T = any>(
  handler: (admin: AdminUser) => Promise<NextResponse<T>>
): Promise<NextResponse<T>> {
  try {
    const admin = await requireAdmin();
    return await handler(admin);
  } catch (error: any) {
    console.error('Admin auth error:', error.message);
    
    if (error.message === '認証が必要です') {
      return createAdminResponse('認証が必要です', 401);
    } else if (error.message === '管理者権限が必要です') {
      return createAdminResponse('管理者権限が必要です', 403);
    } else {
      return createAdminResponse('アクセスエラーが発生しました', 500);
    }
  }
}