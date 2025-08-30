import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Starting force cleanup...');

    // Delete ALL users to start fresh
    const deleteAllResult = await prisma.user.deleteMany({});
    console.log(`Deleted ${deleteAllResult.count} users`);

    // Verify deletion
    const remainingUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    res.status(200).json({
      message: 'Force cleanup completed',
      deletedUsers: deleteAllResult.count,
      remainingUsers: remainingUsers,
      summary: {
        deleted: deleteAllResult.count,
        remaining: remainingUsers.length
      }
    });

  } catch (error: any) {
    console.error('Force cleanup error:', error);
    res.status(500).json({
      error: 'Force cleanup failed',
      details: error.message
    });
  }
}