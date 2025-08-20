const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function main() {
  const command = process.argv[2];
  const email = process.argv[3];

  switch (command) {
    case 'check':
      await checkUser(email);
      break;
    case 'create-unverified':
      await createUnverifiedUser(email);
      break;
    case 'set-expired':
      await setExpiredToken(email);
      break;
    case 'verify':
      await verifyUser(email);
      break;
    case 'reset':
      await resetUser(email);
      break;
    case 'delete':
      await deleteUser(email);
      break;
    case 'list':
      await listUsers();
      break;
    default:
      console.log(`
使用方法:
  node scripts/test-email-verification.js <command> [email]

コマンド:
  check <email>          - ユーザーの認証状態を確認
  create-unverified <email> - 未認証ユーザーを作成（テスト用）
  set-expired <email>    - トークンを期限切れに設定
  verify <email>         - ユーザーを認証済みに設定
  reset <email>          - ユーザーを未認証状態にリセット
  delete <email>         - ユーザーを削除
  list                   - 全ユーザーをリスト表示
      `);
  }
}

async function checkUser(email) {
  if (!email) {
    console.error('❌ メールアドレスを指定してください');
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      emailVerified: true,
      verificationToken: true,
      tokenExpiry: true,
      createdAt: true,
    }
  });

  if (!user) {
    console.log(`❌ ユーザーが見つかりません: ${email}`);
    return;
  }

  console.log('\n=== ユーザー情報 ===');
  console.log(`📧 Email: ${user.email}`);
  console.log(`👤 Name: ${user.name || '未設定'}`);
  console.log(`✅ 認証状態: ${user.emailVerified ? '認証済み' : '未認証'}`);
  console.log(`🎫 トークン: ${user.verificationToken ? '設定あり' : 'なし'}`);
  
  if (user.tokenExpiry) {
    const now = new Date();
    const isExpired = user.tokenExpiry < now;
    const remainingTime = Math.floor((user.tokenExpiry - now) / 1000 / 60);
    
    console.log(`⏰ トークン有効期限: ${user.tokenExpiry.toLocaleString('ja-JP')}`);
    console.log(`   状態: ${isExpired ? '期限切れ' : `有効（残り${remainingTime}分）`}`);
  }
  
  console.log(`📅 作成日時: ${user.createdAt.toLocaleString('ja-JP')}`);
  
  if (user.verificationToken) {
    console.log('\n=== テスト用認証URL ===');
    console.log(`http://localhost:3000/verify-email?token=${user.verificationToken}`);
  }
}

async function createUnverifiedUser(email) {
  if (!email) {
    console.error('❌ メールアドレスを指定してください');
    return;
  }

  try {
    // 既存ユーザーをチェック
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log(`⚠️  ユーザーは既に存在します: ${email}`);
      return;
    }

    // テスト用トークンを生成
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24時間後

    const user = await prisma.user.create({
      data: {
        email,
        name: `Test User ${Date.now()}`,
        password: '$2a$12$dummy.password.hash', // ダミーパスワードハッシュ
        verificationToken,
        tokenExpiry,
        emailVerified: null,
      }
    });

    console.log(`✅ 未認証ユーザーを作成しました: ${email}`);
    console.log(`🎫 認証トークン: ${verificationToken}`);
    console.log(`\n🔗 認証URL: http://localhost:3000/verify-email?token=${verificationToken}`);
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

async function setExpiredToken(email) {
  if (!email) {
    console.error('❌ メールアドレスを指定してください');
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log(`❌ ユーザーが見つかりません: ${email}`);
      return;
    }

    // 期限切れトークンを設定（1時間前に期限切れ）
    const expiredToken = crypto.randomBytes(32).toString('hex');
    const expiredTime = new Date(Date.now() - 60 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: {
        verificationToken: expiredToken,
        tokenExpiry: expiredTime,
        emailVerified: null,
      }
    });

    console.log(`✅ 期限切れトークンを設定しました: ${email}`);
    console.log(`⏰ 期限: ${expiredTime.toLocaleString('ja-JP')} (期限切れ)`);
    console.log(`\n🔗 テスト用URL: http://localhost:3000/verify-email?token=${expiredToken}`);
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

async function verifyUser(email) {
  if (!email) {
    console.error('❌ メールアドレスを指定してください');
    return;
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
        tokenExpiry: null,
      }
    });

    console.log(`✅ ユーザーを認証済みに設定しました: ${email}`);
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

async function resetUser(email) {
  if (!email) {
    console.error('❌ メールアドレスを指定してください');
    return;
  }

  try {
    const newToken = crypto.randomBytes(32).toString('hex');
    const newExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await prisma.user.update({
      where: { email },
      data: {
        emailVerified: null,
        verificationToken: newToken,
        tokenExpiry: newExpiry,
      }
    });

    console.log(`✅ ユーザーを未認証状態にリセットしました: ${email}`);
    console.log(`\n🔗 新しい認証URL: http://localhost:3000/verify-email?token=${newToken}`);
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

async function deleteUser(email) {
  if (!email) {
    console.error('❌ メールアドレスを指定してください');
    return;
  }

  try {
    await prisma.user.delete({ where: { email } });
    console.log(`✅ ユーザーを削除しました: ${email}`);
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

async function listUsers() {
  const users = await prisma.user.findMany({
    select: {
      email: true,
      name: true,
      emailVerified: true,
      verificationToken: true,
      tokenExpiry: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  console.log('\n=== ユーザー一覧（最新10件）===\n');
  
  users.forEach(user => {
    const status = user.emailVerified ? '✅ 認証済み' : '❌ 未認証';
    const hasToken = user.verificationToken ? '🎫' : '  ';
    let tokenStatus = '';
    
    if (user.tokenExpiry) {
      const isExpired = user.tokenExpiry < new Date();
      tokenStatus = isExpired ? '(期限切れ)' : '(有効)';
    }
    
    console.log(`${status} ${hasToken} ${user.email} ${tokenStatus}`);
  });
  
  console.log(`\n合計: ${users.length} 件`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });