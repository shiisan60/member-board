#!/usr/bin/env node

console.log('=== Vercel環境変数チェックリスト ===\n');

const requiredEnvVars = [
  {
    name: 'DB_URL',
    description: 'Neonデータベースの接続URL',
    example: 'postgresql://user:password@host/database?sslmode=require',
    vercel: true
  },
  {
    name: 'NEXTAUTH_URL',
    description: '本番環境のURL',
    example: 'https://your-app.vercel.app',
    vercel: true
  },
  {
    name: 'NEXTAUTH_SECRET',
    description: 'NextAuth.js用のシークレット',
    example: 'openssl rand -base64 32で生成',
    vercel: true
  },
  {
    name: 'JWT_SECRET',
    description: 'JWT署名用のシークレット',
    example: 'ランダムな文字列',
    vercel: true
  },
  {
    name: 'GOOGLE_CLIENT_ID',
    description: 'Google OAuth クライアントID',
    example: '数字-文字列.apps.googleusercontent.com',
    vercel: true
  },
  {
    name: 'GOOGLE_CLIENT_SECRET',
    description: 'Google OAuth クライアントシークレット',
    example: 'GOCSPX-で始まる文字列',
    vercel: true
  },
  {
    name: 'EMAIL_HOST',
    description: 'SMTPサーバーのホスト',
    example: 'smtp.example.com',
    vercel: true
  },
  {
    name: 'EMAIL_PORT',
    description: 'SMTPポート番号',
    example: '587',
    vercel: true
  },
  {
    name: 'EMAIL_USER',
    description: 'SMTP認証ユーザー',
    example: 'admin@example.com',
    vercel: true
  },
  {
    name: 'EMAIL_PASS',
    description: 'SMTP認証パスワード',
    example: 'your-email-password',
    vercel: true
  },
  {
    name: 'EMAIL_FROM',
    description: '送信元メールアドレス',
    example: 'noreply@example.com',
    vercel: true
  }
];

console.log('Vercelの環境変数設定で以下の変数が設定されているか確認してください:\n');

requiredEnvVars.forEach((envVar, index) => {
  console.log(`${index + 1}. ${envVar.name}`);
  console.log(`   説明: ${envVar.description}`);
  console.log(`   例: ${envVar.example}`);
  console.log('');
});

console.log('=== 設定方法 ===');
console.log('1. Vercelダッシュボードにログイン');
console.log('2. プロジェクトを選択');
console.log('3. Settings → Environment Variables');
console.log('4. 上記の変数を追加（Production, Preview, Development全てにチェック）');
console.log('5. Save');
console.log('');
console.log('重要: DB_URLはNeonから自動的に設定されているはずです。');
console.log('重要: NEXTAUTH_SECRETは必ず強力なランダム値に変更してください！');
console.log('');
console.log('コマンド例:');
console.log('  openssl rand -base64 32  # NEXTAUTH_SECRET生成用');