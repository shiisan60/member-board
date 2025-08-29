// DB_URL環境変数のテストスクリプト

console.log('=== データベース接続環境変数のテスト ===\n');

// 環境変数の確認
console.log('1. 環境変数の確認:');
console.log('   DATABASE_URL:', process.env.DATABASE_URL ? '設定されています' : '未設定');
console.log('   DB_URL:', process.env.DB_URL ? '設定されています' : '未設定');
console.log('   DATABASE_PROVIDER:', process.env.DATABASE_PROVIDER || '未設定');

// DB_URLのフォールバック処理のテスト
if (process.env.DB_URL && !process.env.DATABASE_URL) {
  console.log('\n2. DB_URLからDATABASE_URLへのフォールバック:');
  console.log('   DB_URLが設定されていて、DATABASE_URLが未設定です');
  console.log('   → DATABASE_URLにDB_URLの値をコピーします');
  process.env.DATABASE_URL = process.env.DB_URL;
  console.log('   DATABASE_URL:', process.env.DATABASE_URL ? '設定完了' : 'エラー');
} else if (process.env.DATABASE_URL) {
  console.log('\n2. DATABASE_URLが既に設定されています');
} else {
  console.log('\n2. 警告: DATABASE_URLもDB_URLも設定されていません');
}

// Prismaクライアントの初期化テスト
console.log('\n3. Prismaクライアントの初期化テスト:');
try {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  console.log('   ✓ Prismaクライアントの初期化に成功しました');
  
  // 接続テスト（ローカル環境の場合のみ）
  if (process.env.DATABASE_PROVIDER === 'sqlite') {
    console.log('   SQLiteデータベースを使用しています（ローカル開発環境）');
  } else if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('postgresql')) {
    console.log('   PostgreSQLデータベースを使用しています（本番環境）');
  }
  
  prisma.$disconnect();
} catch (error) {
  console.error('   ✗ Prismaクライアントの初期化に失敗しました:', error.message);
}

console.log('\n=== テスト完了 ===');