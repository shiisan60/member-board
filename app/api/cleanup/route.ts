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
        const deletedUser = await prisma.user.delete({
          where: { email }
        });
        
        results.push({
          email,
          status: 'deleted',
          deletedUser: {
            id: deletedUser.id,
            name: deletedUser.name,
            email: deletedUser.email
          }
        });
        
      } catch (error: any) {
        if (error.code === 'P2025') {
          results.push({
            email,
            status: 'not_found'
          });
        } else {
          results.push({
            email,
            status: 'failed',
            error: error.message
          });
        }
      }
    }
    
    return NextResponse.json({
      message: 'Cleanup completed',
      results,
      summary: {
        total: emailsToDelete.length,
        deleted: results.filter(r => r.status === 'deleted').length,
        failed: results.filter(r => r.status === 'failed').length,
        notFound: results.filter(r => r.status === 'not_found').length
      }
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Cleanup failed', details: error.message },
      { status: 500 }
    );
  }
}