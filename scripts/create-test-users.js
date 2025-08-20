const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUsers() {
  console.log('🔧 テスト用ユーザーを作成中...\n');

  try {
    // 1. 認証済みユーザー
    const hashedPassword = await bcrypt.hash('Test1234!', 12);
    
    // 既存ユーザーを削除
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['verified@example.com', 'unverified@example.com']
        }
      }
    });

    // 認証済みユーザーを作成
    const verifiedUser = await prisma.user.create({
      data: {
        email: 'verified@example.com',
        password: hashedPassword,
        name: '認証済みテストユーザー',
        emailVerified: new Date(),
        role: 'user'
      }
    });

    console.log('✅ 認証済みユーザーを作成しました:');
    console.log('   📧 Email: verified@example.com');
    console.log('   🔑 Password: Test1234!');
    console.log('   ✓ メール認証: 完了\n');

    // 2. 未認証ユーザー
    const unverifiedUser = await prisma.user.create({
      data: {
        email: 'unverified@example.com',
        password: hashedPassword,
        name: '未認証テストユーザー',
        emailVerified: null,
        verificationToken: 'test_token_123',
        tokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
        role: 'user'
      }
    });

    console.log('❌ 未認証ユーザーを作成しました:');
    console.log('   📧 Email: unverified@example.com');
    console.log('   🔑 Password: Test1234!');
    console.log('   ✗ メール認証: 未完了\n');

    console.log('========================================');
    console.log('📝 テストに使用できるアカウント:');
    console.log('========================================');
    console.log('1. 正常ログイン用:');
    console.log('   - Email: verified@example.com');
    console.log('   - Password: Test1234!');
    console.log('');
    console.log('2. 未認証エラー用:');
    console.log('   - Email: unverified@example.com');
    console.log('   - Password: Test1234!');
    console.log('');
    console.log('3. パスワードエラー用:');
    console.log('   - Email: verified@example.com');
    console.log('   - Password: WrongPassword');
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();