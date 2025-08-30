import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const remainingEmails = [
      '03shimizutaka@gmail.com',
      'himawarishimizu3d@gmail.com',
      'himawarishimizu01@gmail.com'
    ];
    
    const deletedUsers = [];
    const errors = [];
    
    // MongoDBのネイティブクライアントを使用してrawクエリで削除
    for (const email of remainingEmails) {
      try {
        // まずユーザー情報を取得
        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
          },
        });
        
        if (!user) {
          errors.push(`User not found: ${email}`);
          continue;
        }
        
        // Raw MongoDBクエリで削除
        // @ts-ignore - Using raw MongoDB operations
        await prisma.$executeRaw`DELETE FROM posts WHERE authorId = ${user.id}`;
        await prisma.$executeRaw`DELETE FROM sessions WHERE userId = ${user.id}`;
        await prisma.$executeRaw`DELETE FROM accounts WHERE userId = ${user.id}`;
        
        // emailベースで削除を試行
        const result = await prisma.$executeRaw`DELETE FROM users WHERE email = ${email}`;
        
        deletedUsers.push({
          id: user.id,
          email: user.email,
          name: user.name,
        });
        
        console.log(`✅ Force deleted user: ${email}`);
      } catch (error: any) {
        console.error(`❌ Failed to force delete user ${email}:`, error.message);
        
        // 代替手段: MongoDBコレクションに直接アクセス
        try {
          // @ts-ignore
          const db = prisma.$queryRaw;
          await db`db.users.deleteOne({ email: "${email}" })`;
          deletedUsers.push({ email, method: 'direct_mongodb' });
          console.log(`✅ Direct MongoDB delete: ${email}`);
        } catch (directError: any) {
          errors.push(`Failed to delete ${email}: ${error.message} | Direct: ${directError.message}`);
        }
      }
    }
    
    return NextResponse.json({
      message: 'Force cleanup completed',
      deletedUsers,
      errors,
      summary: {
        requested: remainingEmails.length,
        deleted: deletedUsers.length,
        failed: errors.length,
      }
    });
  } catch (error: any) {
    console.error('Force cleanup error:', error);
    return NextResponse.json(
      { error: 'Failed to force cleanup users', details: error.message },
      { status: 500 }
    );
  }
}