#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('===================================');
console.log('📧 メール設定確認スクリプト');
console.log('===================================\n');

// .envファイルの読み込み
const envPath = path.join(process.cwd(), '.env');
const envExamplePath = path.join(process.cwd(), '.env.sakura.example');

if (!fs.existsSync(envPath)) {
  console.error('❌ .envファイルが見つかりません');
  console.log('💡 .env.sakura.exampleを参考に.envファイルを作成してください\n');
  process.exit(1);
}

// 環境変数の読み込み
require('dotenv').config();

// 必須設定項目
const requiredVars = [
  { key: 'EMAIL_HOST', desc: 'SMTPサーバー' },
  { key: 'EMAIL_PORT', desc: 'ポート番号' },
  { key: 'EMAIL_SECURE', desc: '暗号化設定' },
  { key: 'EMAIL_USER', desc: '認証ユーザー' },
  { key: 'EMAIL_PASS', desc: 'パスワード' },
  { key: 'EMAIL_FROM', desc: '送信元アドレス' },
];

// オプション設定項目
const optionalVars = [
  { key: 'EMAIL_FROM_NAME', desc: '送信者名' },
  { key: 'EMAIL_ADMIN', desc: '管理者アドレス' },
  { key: 'EMAIL_SUPPORT', desc: 'サポートアドレス' },
  { key: 'EMAIL_POSTMASTER', desc: 'Postmasterアドレス' },
  { key: 'IMAP_HOST', desc: 'IMAPサーバー' },
  { key: 'IMAP_PORT', desc: 'IMAPポート' },
  { key: 'IMAP_SECURE', desc: 'IMAP暗号化' },
];

console.log('【必須設定項目】');
console.log('─────────────────────────────────');
let hasError = false;

requiredVars.forEach(({ key, desc }) => {
  const value = process.env[key];
  if (value) {
    // パスワードは一部マスク
    const displayValue = key === 'EMAIL_PASS' 
      ? '***' + value.slice(-3) 
      : value;
    console.log(`✅ ${desc} (${key}): ${displayValue}`);
  } else {
    console.log(`❌ ${desc} (${key}): 未設定`);
    hasError = true;
  }
});

console.log('\n【オプション設定項目】');
console.log('─────────────────────────────────');

optionalVars.forEach(({ key, desc }) => {
  const value = process.env[key];
  if (value) {
    console.log(`✅ ${desc} (${key}): ${value}`);
  } else {
    console.log(`⚪ ${desc} (${key}): 未設定`);
  }
});

// 設定値の検証
console.log('\n【設定値の検証】');
console.log('─────────────────────────────────');

// ポート番号チェック
const port = process.env.EMAIL_PORT;
if (port) {
  if (port === '587') {
    console.log('✅ ポート587 (STARTTLS) - 推奨設定');
    if (process.env.EMAIL_SECURE === 'true') {
      console.log('⚠️  注意: ポート587ではEMAIL_SECURE=falseを推奨');
    }
  } else if (port === '465') {
    console.log('✅ ポート465 (SSL/TLS)');
    if (process.env.EMAIL_SECURE !== 'true') {
      console.log('⚠️  注意: ポート465ではEMAIL_SECURE=trueを推奨');
    }
  } else if (port === '25') {
    console.log('⚠️  ポート25 - セキュリティ上推奨されません');
  } else {
    console.log(`❓ ポート${port} - 標準的でないポート番号`);
  }
}

// メールアドレス形式チェック
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const emailFields = ['EMAIL_FROM', 'EMAIL_ADMIN', 'EMAIL_SUPPORT', 'EMAIL_POSTMASTER'];

emailFields.forEach(field => {
  const value = process.env[field];
  if (value && !emailRegex.test(value)) {
    console.log(`❌ ${field}: 無効なメールアドレス形式 (${value})`);
    hasError = true;
  }
});

// さくらインターネット用の設定チェック
if (process.env.EMAIL_HOST && process.env.EMAIL_HOST.includes('sakura.ne.jp')) {
  console.log('\n【さくらインターネット固有の設定】');
  console.log('─────────────────────────────────');
  console.log('✅ さくらインターネットのサーバーを検出');
  
  if (process.env.EMAIL_USER && !process.env.EMAIL_USER.includes('@')) {
    console.log('⚠️  注意: さくらではメールアドレス全体をユーザー名として使用');
  }
  
  console.log('📝 推奨設定:');
  console.log('   - ポート: 587 (STARTTLS)');
  console.log('   - EMAIL_SECURE: false');
  console.log('   - ユーザー名: メールアドレス全体');
}

// 結果サマリー
console.log('\n===================================');
if (hasError) {
  console.log('❌ 設定に問題があります。上記のエラーを修正してください。');
  process.exit(1);
} else {
  console.log('✅ 基本的な設定は完了しています！');
  console.log('\n次のステップ:');
  console.log('1. npm run dev でサーバーを起動');
  console.log('2. 以下のURLでテストを実行:');
  console.log('   - 設定確認: http://localhost:3000/api/test-email?type=config');
  console.log('   - 接続テスト: http://localhost:3000/api/test-email?type=connection');
  console.log('   - 送信テスト: http://localhost:3000/api/test-email?type=send&email=your-email@example.com');
}
console.log('===================================');