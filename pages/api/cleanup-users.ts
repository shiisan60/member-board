import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
        const deletedUser = await prisma.user.delete({
          where: { email }
        });
        
        results.push({
          email,
          status: 'deleted',
          user: deletedUser
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
            status: 'error',
            error: error.message
          });
        }
      }
    }

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

    res.status(200).json({
      message: 'Cleanup completed',
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
    console.error('Cleanup error:', error);
    res.status(500).json({
      error: 'Cleanup failed',
      details: error.message
    });
  }
}