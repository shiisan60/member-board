import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ObjectId } from 'mongodb';

export async function POST() {
  try {
    const emailsToFix = [
      '03shimizutaka@gmail.com',
      'himawarishimizu3d@gmail.com', 
      'himawarishimizu01@gmail.com'
    ];
    
    const results = [];
    
    for (const email of emailsToFix) {
      try {
        // ユーザーを検索
        const user = await prisma.user.findUnique({
          where: { email },
        });
        
        if (!user) {
          results.push({
            email,
            status: 'not_found'
          });
          continue;
        }
        
        // 新しいObjectIDを生成
        const newId = new ObjectId().toString();
        
        // MongoDBの直接更新
        await prisma.$runCommandRaw({
          update: 'users',
          updates: [{
            q: { email: email },
            u: { $set: { _id: new ObjectId(newId) } },
            multi: false
          }]
        });
        
        results.push({
          email,
          status: 'updated',
          oldId: user.id,
          newId: newId
        });
        
      } catch (error: any) {
        console.error(`ID fix failed for ${email}:`, error);
        results.push({
          email,
          status: 'failed',
          error: error.message
        });
      }
    }
    
    return NextResponse.json({
      message: 'ID fix completed',
      results,
      summary: {
        total: emailsToFix.length,
        successful: results.filter(r => r.status === 'updated').length,
        failed: results.filter(r => r.status === 'failed').length,
        notFound: results.filter(r => r.status === 'not_found').length
      }
    });
    
  } catch (error: any) {
    console.error('ID fix error:', error);
    return NextResponse.json(
      { error: 'Failed to fix user IDs', details: error.message },
      { status: 500 }
    );
  }
}