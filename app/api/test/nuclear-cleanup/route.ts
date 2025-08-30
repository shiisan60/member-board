import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const problematicEmails = [
      '03shimizutaka@gmail.com',
      'himawarishimizu3d@gmail.com', 
      'himawarishimizu01@gmail.com'
    ];
    
    const results = [];
    
    // 各メールアドレスに対して削除を実行
    for (const email of problematicEmails) {
      try {
        console.log(`Attempting to delete user: ${email}`);
        
        // 1. まず関連するポストを削除（存在する場合）
        try {
          const deletedPosts = await prisma.$executeRawUnsafe(
            `DELETE FROM posts WHERE authorId IN (SELECT id FROM users WHERE email = '${email}')`
          );
          console.log(`Deleted posts for ${email}: ${deletedPosts}`);
        } catch (e) {
          console.log(`No posts to delete for ${email} or posts table doesn't exist`);
        }
        
        // 2. セッションを削除
        try {
          const deletedSessions = await prisma.$executeRawUnsafe(
            `DELETE FROM sessions WHERE userId IN (SELECT id FROM users WHERE email = '${email}')`
          );
          console.log(`Deleted sessions for ${email}: ${deletedSessions}`);
        } catch (e) {
          console.log(`No sessions to delete for ${email}`);
        }
        
        // 3. アカウントを削除
        try {
          const deletedAccounts = await prisma.$executeRawUnsafe(
            `DELETE FROM accounts WHERE userId IN (SELECT id FROM users WHERE email = '${email}')`
          );
          console.log(`Deleted accounts for ${email}: ${deletedAccounts}`);
        } catch (e) {
          console.log(`No accounts to delete for ${email}`);
        }
        
        // 4. 最後にユーザーを削除
        const deletedUsers = await prisma.$executeRawUnsafe(
          `DELETE FROM users WHERE email = '${email}'`
        );
        
        results.push({
          email,
          status: 'deleted',
          affectedRows: deletedUsers
        });
        
        console.log(`✅ Successfully deleted user: ${email}`);
        
      } catch (error: any) {
        console.error(`❌ Failed to delete user ${email}:`, error);
        results.push({
          email,
          status: 'failed', 
          error: error.message
        });
      }
    }
    
    // 最終確認：削除されたか確認
    const remainingUsers = [];
    for (const email of problematicEmails) {
      try {
        const user = await prisma.user.findUnique({
          where: { email },
          select: { email: true, name: true }
        });
        if (user) {
          remainingUsers.push(user);
        }
      } catch (e) {
        // エラーは無視（削除されている可能性）
      }
    }
    
    return NextResponse.json({
      message: 'Nuclear cleanup completed',
      results,
      remainingUsers,
      summary: {
        requested: problematicEmails.length,
        processed: results.length,
        successful: results.filter(r => r.status === 'deleted').length,
        failed: results.filter(r => r.status === 'failed').length,
        remaining: remainingUsers.length
      }
    });
    
  } catch (error: any) {
    console.error('Nuclear cleanup error:', error);
    return NextResponse.json(
      { error: 'Nuclear cleanup failed', details: error.message },
      { status: 500 }
    );
  }
}