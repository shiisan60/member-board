import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/admin-auth';

// ユーザー一覧を取得
export async function GET(request: NextRequest) {
  return withAdminAuth(async (admin) => {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const search = searchParams.get('search') || '';
      const role = searchParams.get('role');
      const emailVerified = searchParams.get('emailVerified');
      const sortBy = searchParams.get('sortBy') || 'createdAt';
      const sortOrder = searchParams.get('sortOrder') || 'desc';

      // 検索条件を構築
      const where: any = {};

      if (search) {
        where.OR = [
          { email: { contains: search } },
          { name: { contains: search } }
        ];
      }

      if (role && ['USER', 'ADMIN'].includes(role)) {
        where.role = role;
      }

      if (emailVerified !== null) {
        if (emailVerified === 'true') {
          where.emailVerified = { not: null };
        } else if (emailVerified === 'false') {
          where.emailVerified = null;
        }
      }

      // 並び順を構築
      const orderBy: any = {};
      orderBy[sortBy] = sortOrder;

      // ページング設定
      const offset = (page - 1) * limit;

      // ユーザー一覧とカウントを並行取得
      const [users, totalCount] = await Promise.all([
        prisma.user.findMany({
          where,
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
          },
          orderBy,
          take: limit,
          skip: offset
        }),
        prisma.user.count({ where })
      ]);

      // ページング情報
      const totalPages = Math.ceil(totalCount / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      // 統計情報
      const stats = {
        total: totalCount,
        verified: await prisma.user.count({
          where: { 
            ...where,
            emailVerified: { not: null }
          }
        }),
        unverified: await prisma.user.count({
          where: { 
            ...where,
            emailVerified: null
          }
        }),
        admins: await prisma.user.count({
          where: { 
            ...where,
            role: 'ADMIN'
          }
        })
      };

      return NextResponse.json({
        success: true,
        users,
        pagination: {
          page,
          limit,
          totalPages,
          totalCount,
          hasNext,
          hasPrev
        },
        stats,
        filters: {
          search,
          role,
          emailVerified,
          sortBy,
          sortOrder
        }
      });

    } catch (error: any) {
      console.error('Users list error:', error);
      return NextResponse.json(
        { error: 'ユーザー一覧の取得に失敗しました', success: false },
        { status: 500 }
      );
    }
  });
}