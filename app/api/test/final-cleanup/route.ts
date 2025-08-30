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
        // Delete using standard Prisma operations
        const deletedUser = await prisma.user.delete({
          where: { email }
        });
        
        results.push({
          email,
          status: 'deleted',
          deletedUser: deletedUser
        });
        
        console.log(`✅ Successfully deleted user: ${email}`);
        
      } catch (error: any) {
        if (error.code === 'P2025') {
          // User not found
          results.push({
            email,
            status: 'not_found',
            message: 'User not found'
          });
        } else {
          console.error(`❌ Failed to delete user ${email}:`, error.message);
          results.push({
            email,
            status: 'failed',
            error: error.message
          });
        }
      }
    }
    
    // Verify deletion
    const remainingUsers = [];
    for (const email of emailsToDelete) {
      try {
        const user = await prisma.user.findUnique({
          where: { email },
          select: { email: true, name: true, id: true }
        });
        if (user) {
          remainingUsers.push(user);
        }
      } catch (e) {
        // User deleted successfully
      }
    }
    
    return NextResponse.json({
      message: 'Final cleanup completed',
      results,
      remainingUsers,
      summary: {
        requested: emailsToDelete.length,
        processed: results.length,
        successful: results.filter(r => r.status === 'deleted').length,
        failed: results.filter(r => r.status === 'failed').length,
        notFound: results.filter(r => r.status === 'not_found').length,
        remaining: remainingUsers.length
      }
    });
    
  } catch (error: any) {
    console.error('Final cleanup error:', error);
    return NextResponse.json(
      { error: 'Final cleanup failed', details: error.message },
      { status: 500 }
    );
  }
}