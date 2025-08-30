import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const emailsToDelete = [
      '03shimizutaka@gmail.com',
      'himawarishimizu3d@gmail.com', 
      'himawarishimizu01@gmail.com'
    ];
    
    const results = [];
    
    for (const email of emailsToDelete) {
      try {
        // 直接MongoDBクエリでユーザーとその関連データを削除
        const deleteResult = await prisma.$runCommandRaw({
          delete: 'users',
          deletes: [{
            q: { email: email },
            limit: 1
          }]
        });
        
        // 関連データも削除
        await prisma.$runCommandRaw({
          delete: 'posts',
          deletes: [{
            q: { 'author.email': email },
            limit: 0
          }]
        });
        
        await prisma.$runCommandRaw({
          delete: 'sessions',
          deletes: [{
            q: { 'user.email': email },
            limit: 0
          }]
        });
        
        await prisma.$runCommandRaw({
          delete: 'accounts',
          deletes: [{
            q: { 'user.email': email },
            limit: 0
          }]
        });
        
        results.push({
          email,
          status: 'success',
          deletedCount: deleteResult.n || 0
        });
        
      } catch (error: any) {
        console.error(`Direct delete failed for ${email}:`, error);
        results.push({
          email,
          status: 'failed',
          error: error.message
        });
      }
    }
    
    return NextResponse.json({
      message: 'Direct cleanup completed',
      results,
      summary: {
        total: emailsToDelete.length,
        successful: results.filter(r => r.status === 'success').length,
        failed: results.filter(r => r.status === 'failed').length
      }
    });
    
  } catch (error: any) {
    console.error('Direct cleanup error:', error);
    return NextResponse.json(
      { error: 'Failed to perform direct cleanup', details: error.message },
      { status: 500 }
    );
  }
}