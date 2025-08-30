import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const emailsToDelete = [
      'himawarishimizu01+001@gmail.com',
      'himanishida@gmail.com',
      '03shimizutaka@gmail.com',
      'himawarishimizu3d@gmail.com',
      'himawarishimizu01@gmail.com'
    ];
    
    const deletedUsers = [];
    const errors = [];
    
    for (const email of emailsToDelete) {
      try {
        // ユーザーが存在するか確認
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
        
        // MongoDBのネイティブクエリを使用して削除
        // まず関連データを削除
        try {
          await prisma.post.deleteMany({
            where: { authorId: user.id },
          });
        } catch (e) {
          console.log(`No posts to delete for ${email}`);
        }
        
        try {
          await prisma.session.deleteMany({
            where: { userId: user.id },
          });
        } catch (e) {
          console.log(`No sessions to delete for ${email}`);
        }
        
        try {
          await prisma.account.deleteMany({
            where: { userId: user.id },
          });
        } catch (e) {
          console.log(`No accounts to delete for ${email}`);
        }
        
        // 最後にユーザーを削除
        await prisma.user.delete({
          where: { email }, // emailで直接削除
        });
        
        deletedUsers.push({
          id: user.id,
          email: user.email,
          name: user.name,
        });
        
        console.log(`✅ Deleted user: ${email}`);
      } catch (error: any) {
        console.error(`❌ Failed to delete user ${email}:`, error.message);
        errors.push(`Failed to delete ${email}: ${error.message}`);
      }
    }
    
    return NextResponse.json({
      message: 'Cleanup completed',
      deletedUsers,
      errors,
      summary: {
        requested: emailsToDelete.length,
        deleted: deletedUsers.length,
        failed: errors.length,
      }
    });
  } catch (error: any) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup users', details: error.message },
      { status: 500 }
    );
  }
}