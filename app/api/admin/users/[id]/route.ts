import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/admin-auth';

// ユーザーの詳細情報を取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAdminAuth(async (admin) => {
    try {
      const { id } = params;

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              posts: true,
              accounts: true
            }
          }
        }
      });

      if (!user) {
        return NextResponse.json(
          { error: 'ユーザーが見つかりません', success: false },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        user
      });

    } catch (error: any) {
      console.error('User fetch error:', error);
      return NextResponse.json(
        { error: 'ユーザー情報の取得に失敗しました', success: false },
        { status: 500 }
      );
    }
  });
}

// ユーザーを削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAdminAuth(async (admin) => {
    try {
      const { id } = params;

      // 自分自身の削除を防ぐ
      if (id === admin.id) {
        return NextResponse.json(
          { error: '自分自身を削除することはできません', success: false },
          { status: 400 }
        );
      }

      // ユーザーが存在するかチェック
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          _count: {
            select: {
              posts: true,
              accounts: true
            }
          }
        }
      });

      if (!user) {
        return NextResponse.json(
          { error: 'ユーザーが見つかりません', success: false },
          { status: 404 }
        );
      }

      // トランザクションでユーザーと関連データを削除
      const result = await prisma.$transaction(async (tx) => {
        // 関連するアカウント（OAuth）を削除
        await tx.account.deleteMany({
          where: { userId: id }
        });

        // 関連するセッションを削除
        await tx.session.deleteMany({
          where: { userId: id }
        });

        // 関連する投稿を削除
        await tx.post.deleteMany({
          where: { authorId: id }
        });

        // ユーザーを削除
        const deletedUser = await tx.user.delete({
          where: { id },
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        });

        return deletedUser;
      });

      // 管理者ログ記録
      console.log(`[ADMIN] User deleted by ${admin.email} (${admin.id}): ${result.email} (${result.id})`);

      return NextResponse.json({
        success: true,
        message: `ユーザー「${result.name || result.email}」を削除しました`,
        deletedUser: {
          id: result.id,
          email: result.email,
          name: result.name,
          role: result.role
        },
        stats: {
          postsDeleted: user._count.posts,
          accountsDeleted: user._count.accounts
        }
      });

    } catch (error: any) {
      console.error('User deletion error:', error);
      
      // Prismaエラーの詳細処理
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'ユーザーが見つかりません', success: false },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: 'ユーザーの削除に失敗しました', success: false },
        { status: 500 }
      );
    }
  });
}

// ユーザー情報の更新（役割変更など）
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAdminAuth(async (admin) => {
    try {
      const { id } = params;
      const { role, emailVerified } = await request.json();

      // 自分自身のロール変更を防ぐ
      if (id === admin.id && role && role !== admin.role) {
        return NextResponse.json(
          { error: '自分自身の管理者権限を変更することはできません', success: false },
          { status: 400 }
        );
      }

      const updateData: any = {};
      
      if (role && ['USER', 'ADMIN'].includes(role)) {
        updateData.role = role;
      }
      
      if (typeof emailVerified === 'boolean') {
        updateData.emailVerified = emailVerified ? new Date() : null;
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          updatedAt: true
        }
      });

      // 管理者ログ記録
      console.log(`[ADMIN] User updated by ${admin.email} (${admin.id}): ${updatedUser.email} (${updatedUser.id}) - ${JSON.stringify(updateData)}`);

      return NextResponse.json({
        success: true,
        message: 'ユーザー情報を更新しました',
        user: updatedUser
      });

    } catch (error: any) {
      console.error('User update error:', error);
      
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'ユーザーが見つかりません', success: false },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: 'ユーザー情報の更新に失敗しました', success: false },
        { status: 500 }
      );
    }
  });
}