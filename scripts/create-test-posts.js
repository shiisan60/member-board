const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestData() {
  try {
    console.log('🚀 テストデータの作成を開始します...');

    // テストユーザー1の作成
    const hashedPassword1 = await bcrypt.hash('Test1234!', 10);
    const user1 = await prisma.user.upsert({
      where: { email: 'test1@example.com' },
      update: {},
      create: {
        email: 'test1@example.com',
        password: hashedPassword1,
        name: 'テストユーザー1',
        emailVerified: new Date(),
      },
    });
    console.log('✅ テストユーザー1を作成しました:', user1.email);

    // テストユーザー2の作成
    const hashedPassword2 = await bcrypt.hash('Test1234!', 10);
    const user2 = await prisma.user.upsert({
      where: { email: 'test2@example.com' },
      update: {},
      create: {
        email: 'test2@example.com',
        password: hashedPassword2,
        name: 'テストユーザー2',
        emailVerified: new Date(),
      },
    });
    console.log('✅ テストユーザー2を作成しました:', user2.email);

    // テスト投稿の作成
    const post1 = await prisma.post.create({
      data: {
        title: 'テスト投稿1 - ユーザー1の投稿',
        content: 'これはテストユーザー1が作成した投稿です。編集・削除のテストに使用します。',
        authorId: user1.id,
      },
    });
    console.log('✅ テスト投稿1を作成しました');

    const post2 = await prisma.post.create({
      data: {
        title: 'テスト投稿2 - ユーザー2の投稿',
        content: 'これはテストユーザー2が作成した投稿です。他人の投稿として権限テストに使用します。',
        authorId: user2.id,
      },
    });
    console.log('✅ テスト投稿2を作成しました');

    console.log('\n📝 テストアカウント情報:');
    console.log('================================');
    console.log('ユーザー1:');
    console.log('  メール: test1@example.com');
    console.log('  パスワード: Test1234!');
    console.log('\nユーザー2:');
    console.log('  メール: test2@example.com');
    console.log('  パスワード: Test1234!');
    console.log('================================\n');

  } catch (error) {
    console.error('エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();