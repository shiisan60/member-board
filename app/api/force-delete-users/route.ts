import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const problematicEmails = [
      '03shimizutaka@gmail.com',
      'himawarishimizu3d@gmail.com',
      'himawarishimizu01@gmail.com',
      '03shimizu@gmail.com'
    ];

    const results = [];

    for (const email of problematicEmails) {
      try {
        console.log(`Force deleting user: ${email}`);
        
        const deletedUser = await prisma.user.delete({
          where: { email }
        });
        
        results.push({
          email,
          status: 'deleted',
          user: deletedUser
        });
        
        console.log(`✅ Successfully deleted: ${email}`);
        
      } catch (error: any) {
        console.error(`Failed to delete ${email}:`, error);
        
        if (error.code === 'P2025') {
          results.push({
            email,
            status: 'not_found',
            message: 'User not found'
          });
        } else {
          results.push({
            email,
            status: 'error',
            error: error.message
          });
        }
      }
    }

    // Get remaining users
    const remainingUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      message: 'Force deletion completed',
      results,
      remainingUsers,
      summary: {
        requested: problematicEmails.length,
        deleted: results.filter(r => r.status === 'deleted').length,
        notFound: results.filter(r => r.status === 'not_found').length,
        errors: results.filter(r => r.status === 'error').length,
        remaining: remainingUsers.length
      }
    });

  } catch (error: any) {
    console.error('Force deletion failed:', error);
    return NextResponse.json(
      { 
        error: 'Force deletion failed',
        details: error.message 
      },
      { status: 500 }
    );
  }
}