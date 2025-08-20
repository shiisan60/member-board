const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setAdminRole() {
  const email = process.argv[2];
  const role = process.argv[3] || 'admin';

  if (!email) {
    console.log('使用方法: node scripts/set-admin-role.js <email> [role]');
    console.log('例: node scripts/set-admin-role.js verified@example.com admin');
    console.log('例: node scripts/set-admin-role.js verified@example.com user');
    return;
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role },
      select: {
        email: true,
        name: true,
        role: true,
      }
    });

    console.log(`✅ ユーザーロールを更新しました:`);
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   👤 Name: ${user.name}`);
    console.log(`   🔑 Role: ${user.role}`);
  } catch (error) {
    console.error('❌ エラー:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

setAdminRole();