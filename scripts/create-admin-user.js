const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔧 管理者ユーザーを作成中...\n');

    const hashedPassword = await bcrypt.hash('Admin1234!', 12);
    
    // 既存の管理者ユーザーを削除
    await prisma.user.deleteMany({
      where: {
        email: 'admin@example.com'
      }
    });

    // 管理者ユーザーを作成
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: hashedPassword,
        name: '管理者ユーザー',
        role: 'ADMIN',
        emailVerified: new Date(),
      }
    });

    console.log('✅ 管理者ユーザーを作成しました:');
    console.log('   📧 Email: admin@example.com');
    console.log('   🔑 Password: Admin1234!');
    console.log('   👑 Role: ADMIN');
    console.log('   ✓ メール認証: 完了\n');

    console.log('========================================');
    console.log('📝 権限テスト用アカウント:');
    console.log('========================================');
    console.log('1. 管理者ユーザー:');
    console.log('   - Email: admin@example.com');
    console.log('   - Password: Admin1234!');
    console.log('   - 権限: 全ての投稿を編集・削除可能');
    console.log('');
    console.log('2. 一般ユーザー1:');
    console.log('   - Email: test1@example.com');
    console.log('   - Password: Test1234!');
    console.log('   - 権限: 自分の投稿のみ編集・削除可能');
    console.log('');
    console.log('3. 一般ユーザー2:');
    console.log('   - Email: test2@example.com');
    console.log('   - Password: Test1234!');
    console.log('   - 権限: 自分の投稿のみ編集・削除可能');
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();