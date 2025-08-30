import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        emailVerified: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const problematicEmails = [
      '03shimizutaka@gmail.com',
      'himawarishimizu3d@gmail.com',
      'himawarishimizu01@gmail.com'
    ];

    const problematicUsers = users.filter(user => 
      problematicEmails.includes(user.email)
    );

    return NextResponse.json({
      totalUsers: users.length,
      users: users,
      problematicUsers: problematicUsers
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to check users', details: error.message },
      { status: 500 }
    );
  }
}