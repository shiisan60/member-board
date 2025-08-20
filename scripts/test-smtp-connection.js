#!/usr/bin/env node

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// .env.localを優先して読み込み、なければ.envを読み込む
const envLocalPath = path.join(process.cwd(), '.env.local');
const envPath = path.join(process.cwd(), '.env');

if (fs.existsSync(envLocalPath)) {
  require('dotenv').config({ path: envLocalPath });
} else {
  require('dotenv').config({ path: envPath });
}

console.log('===================================');
console.log('🔌 SMTP接続テストスクリプト');
console.log('===================================\n');

async function testConnection() {
  const config = {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  };

  console.log('【接続設定】');
  console.log('─────────────────────────────────');
  console.log(`サーバー: ${config.host}`);
  console.log(`ポート: ${config.port}`);
  console.log(`暗号化: ${config.secure ? 'SSL/TLS' : 'STARTTLS'}`);
  console.log(`ユーザー: ${config.auth.user}`);
  console.log();

  // 必須項目チェック
  if (!config.host || !config.auth.user || !config.auth.pass) {
    console.error('❌ 必須の環境変数が設定されていません');
    console.log('\n必要な環境変数:');
    console.log('  - EMAIL_HOST');
    console.log('  - EMAIL_USER');
    console.log('  - EMAIL_PASS');
    process.exit(1);
  }

  console.log('【接続テスト開始】');
  console.log('─────────────────────────────────');

  try {
    // トランスポーター作成
    console.log('📡 SMTPサーバーに接続中...');
    const transporter = nodemailer.createTransport({
      ...config,
      logger: false, // ログ出力を無効化
      debug: false,  // デバッグ出力を無効化
      tls: {
        rejectUnauthorized: false, // 開発環境用
      },
    });

    // 接続確認
    await transporter.verify();
    console.log('✅ SMTP接続成功！');
    console.log();

    // 詳細情報取得
    console.log('【サーバー情報】');
    console.log('─────────────────────────────────');
    console.log('✅ 認証成功');
    console.log('✅ メール送信可能な状態です');
    console.log();

    // テスト送信（オプション）
    const testEmail = process.argv[2];
    if (testEmail) {
      console.log('【テストメール送信】');
      console.log('─────────────────────────────────');
      console.log(`📧 送信先: ${testEmail}`);
      
      const info = await transporter.sendMail({
        from: `"テスト送信" <${process.env.EMAIL_FROM || config.auth.user}>`,
        to: testEmail,
        subject: '【テスト】SMTP接続確認',
        text: 'このメールはSMTP接続テストから送信されました。',
        html: `
          <h2>SMTP接続テスト</h2>
          <p>このメールはSMTP接続テストから送信されました。</p>
          <p>送信日時: ${new Date().toLocaleString('ja-JP')}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            サーバー: ${config.host}:${config.port}<br>
            暗号化: ${config.secure ? 'SSL/TLS' : 'STARTTLS'}
          </p>
        `,
      });

      console.log('✅ テストメール送信成功！');
      console.log(`   Message ID: ${info.messageId}`);
      console.log(`   受理: ${info.accepted.join(', ')}`);
      if (info.rejected && info.rejected.length > 0) {
        console.log(`   拒否: ${info.rejected.join(', ')}`);
      }
    }

    // 接続を閉じる
    transporter.close();

  } catch (error) {
    console.error('❌ 接続エラーが発生しました');
    console.error();
    console.error('【エラー詳細】');
    console.error('─────────────────────────────────');
    
    if (error.code === 'EAUTH') {
      console.error('認証エラー: ユーザー名またはパスワードが正しくありません');
      console.error('確認事項:');
      console.error('  1. メールアドレス全体をユーザー名として使用しているか');
      console.error('  2. パスワードが正しいか');
      console.error('  3. メールアカウントが有効か');
    } else if (error.code === 'ECONNECTION') {
      console.error('接続エラー: サーバーに接続できません');
      console.error('確認事項:');
      console.error('  1. サーバー名が正しいか');
      console.error('  2. ポート番号が正しいか');
      console.error('  3. ファイアウォールでブロックされていないか');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('タイムアウト: サーバーからの応答がありません');
      console.error('確認事項:');
      console.error('  1. ネットワーク接続を確認');
      console.error('  2. サーバー名とポート番号を確認');
    } else {
      console.error(`エラーコード: ${error.code || 'N/A'}`);
      console.error(`メッセージ: ${error.message}`);
    }

    process.exit(1);
  }

  console.log('===================================');
  console.log('✅ すべてのテストが完了しました');
  console.log('===================================');
}

// 使用方法を表示
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('使用方法:');
  console.log('  node scripts/test-smtp-connection.js [テスト送信先メールアドレス]');
  console.log();
  console.log('例:');
  console.log('  接続テストのみ:');
  console.log('    node scripts/test-smtp-connection.js');
  console.log();
  console.log('  テストメール送信:');
  console.log('    node scripts/test-smtp-connection.js test@example.com');
  process.exit(0);
}

// テスト実行
testConnection().catch(error => {
  console.error('予期しないエラー:', error);
  process.exit(1);
});