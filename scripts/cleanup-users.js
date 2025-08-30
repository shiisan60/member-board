const { PrismaClient } = require('@prisma/client');

async function cleanupUsers() {
  const prisma = new PrismaClient();
  
  try {
    const problematicEmails = [
      '03shimizutaka@gmail.com',
      'himawarishimizu3d@gmail.com',
      'himawarishimizu01@gmail.com',
      '03shimizu@gmail.com'
    ];

    console.log('Starting user cleanup...');

    for (const email of problematicEmails) {
      try {
        console.log(`Attempting to delete user: ${email}`);
        
        // Try to delete the user
        const deletedUser = await prisma.user.delete({
          where: { email }
        });
        
        console.log(`✅ Successfully deleted user: ${email}`);
      } catch (error) {
        if (error.code === 'P2025') {
          console.log(`ℹ️  User not found: ${email}`);
        } else {
          console.error(`❌ Failed to delete user ${email}:`, error.message);
        }
      }
    }

    // List remaining users
    const remainingUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    console.log(`\nRemaining users: ${remainingUsers.length}`);
    remainingUsers.forEach(user => {
      console.log(`- ${user.email} (${user.name}) - ${user.createdAt}`);
    });

  } catch (error) {
    console.error('Cleanup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupUsers();