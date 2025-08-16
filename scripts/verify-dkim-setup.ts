#!/usr/bin/env node

/**
 * DKIM設定検証スクリプト
 * さくらインターネットのDKIM設定を包括的にチェックします
 */

import dns from 'dns/promises';
import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

// 環境変数を読み込み
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// 設定
const CONFIG = {
  domain: process.env.MAIL_DOMAIN || 'example.com',
  selector: 'sakuramail', // さくらインターネットのデフォルトセレクタ
  smtpHost: process.env.MAIL_HOST || process.env.SMTP_HOST || 'example.sakura.ne.jp',
  smtpPort: parseInt(process.env.MAIL_PORT || process.env.SMTP_PORT || '587'),
  smtpUser: process.env.MAIL_USER || process.env.SMTP_USER || '',
  smtpPass: process.env.MAIL_PASS || process.env.SMTP_PASS || '',
  testRecipient: process.env.TEST_EMAIL || 'test@gmail.com',
};

// カラー出力用のヘルパー
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg: string) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg: string) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg: string) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg: string) => console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`),
  header: (msg: string) => console.log(`\n${colors.blue}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}\n`),
};

/**
 * DKIMレコードの確認
 */
async function checkDKIMRecord(): Promise<boolean> {
  log.header('1. DKIM DNSレコード確認');
  
  const dkimRecord = `${CONFIG.selector}._domainkey.${CONFIG.domain}`;
  
  try {
    const records = await dns.resolveTxt(dkimRecord);
    const dkimValue = records.map(r => r.join('')).join('');
    
    if (dkimValue.includes('v=DKIM1')) {
      log.success(`DKIMレコードが見つかりました`);
      log.info(`レコード名: ${dkimRecord}`);
      
      // 公開鍵の存在確認
      if (dkimValue.includes('p=') && !dkimValue.includes('p=;')) {
        const keyMatch = dkimValue.match(/p=([A-Za-z0-9+/=]+)/);
        if (keyMatch) {
          const keyLength = keyMatch[1].length;
          log.success(`公開鍵が設定されています (長さ: ${keyLength}文字)`);
        }
      } else {
        log.error('公開鍵が見つかりません');
        return false;
      }
      
      // アルゴリズムの確認
      if (dkimValue.includes('k=rsa')) {
        log.success('RSA暗号化が設定されています');
      }
      
      console.log(`\n📝 レコード値:\n${dkimValue.substring(0, 100)}...`);
      return true;
    } else {
      log.error('有効なDKIMレコードではありません');
      return false;
    }
  } catch (error) {
    log.error(`DKIMレコードが見つかりません: ${dkimRecord}`);
    log.info('対処法: さくらコントロールパネルでDKIMを有効化し、DNSレコードを設定してください');
    return false;
  }
}

/**
 * SPFレコードの確認
 */
async function checkSPFRecord(): Promise<boolean> {
  log.header('2. SPF DNSレコード確認');
  
  try {
    const records = await dns.resolveTxt(CONFIG.domain);
    const spfRecord = records.find(r => r[0].startsWith('v=spf1'));
    
    if (spfRecord) {
      const spfValue = spfRecord.join('');
      log.success('SPFレコードが見つかりました');
      
      // さくらインターネットのSPFが含まれているか確認
      if (spfValue.includes('include:_spf.sakura.ne.jp')) {
        log.success('さくらインターネットのSPFが含まれています');
      } else {
        log.warning('さくらインターネットのSPFが含まれていません');
        log.info('推奨: "include:_spf.sakura.ne.jp" を追加してください');
      }
      
      console.log(`\n📝 SPFレコード: ${spfValue}`);
      return true;
    } else {
      log.error('SPFレコードが見つかりません');
      log.info('推奨SPF: v=spf1 include:_spf.sakura.ne.jp ~all');
      return false;
    }
  } catch (error) {
    log.error('SPFレコードの確認中にエラーが発生しました');
    return false;
  }
}

/**
 * DMARCレコードの確認
 */
async function checkDMARCRecord(): Promise<boolean> {
  log.header('3. DMARC DNSレコード確認');
  
  const dmarcRecord = `_dmarc.${CONFIG.domain}`;
  
  try {
    const records = await dns.resolveTxt(dmarcRecord);
    const dmarcValue = records.map(r => r.join('')).join('');
    
    if (dmarcValue.includes('v=DMARC1')) {
      log.success('DMARCレコードが見つかりました');
      
      // ポリシーの確認
      const policyMatch = dmarcValue.match(/p=(none|quarantine|reject)/);
      if (policyMatch) {
        const policy = policyMatch[1];
        log.info(`ポリシー: ${policy}`);
        
        if (policy === 'none') {
          log.info('現在は監視モードです（推奨初期設定）');
        } else if (policy === 'quarantine') {
          log.warning('疑わしいメールは隔離されます');
        } else if (policy === 'reject') {
          log.warning('認証失敗メールは拒否されます（最も厳格）');
        }
      }
      
      // レポート送信先の確認
      if (dmarcValue.includes('rua=')) {
        log.success('集約レポート送信先が設定されています');
      }
      
      console.log(`\n📝 DMARCレコード: ${dmarcValue}`);
      return true;
    } else {
      log.error('有効なDMARCレコードではありません');
      return false;
    }
  } catch (error) {
    log.warning('DMARCレコードが見つかりません（オプション）');
    log.info('推奨DMARC: v=DMARC1; p=none; rua=mailto:postmaster@' + CONFIG.domain);
    return false;
  }
}

/**
 * SMTP接続テスト
 */
async function testSMTPConnection(): Promise<boolean> {
  log.header('4. SMTPサーバー接続テスト');
  
  if (!CONFIG.smtpUser || !CONFIG.smtpPass) {
    log.error('SMTP認証情報が設定されていません');
    log.info('環境変数 MAIL_USER と MAIL_PASS を設定してください');
    return false;
  }
  
  const transporter = nodemailer.createTransporter({
    host: CONFIG.smtpHost,
    port: CONFIG.smtpPort,
    secure: CONFIG.smtpPort === 465,
    auth: {
      user: CONFIG.smtpUser,
      pass: CONFIG.smtpPass,
    },
  });
  
  try {
    await transporter.verify();
    log.success('SMTPサーバーへの接続成功');
    log.info(`サーバー: ${CONFIG.smtpHost}:${CONFIG.smtpPort}`);
    log.info(`ユーザー: ${CONFIG.smtpUser}`);
    return true;
  } catch (error: any) {
    log.error('SMTPサーバーへの接続失敗');
    log.error(`エラー: ${error.message}`);
    return false;
  }
}

/**
 * テストメール送信
 */
async function sendTestEmail(): Promise<void> {
  log.header('5. テストメール送信');
  
  if (!CONFIG.smtpUser || !CONFIG.smtpPass) {
    log.warning('SMTP認証情報が未設定のため、テストメール送信をスキップします');
    return;
  }
  
  console.log(`\n📧 テストメールを ${CONFIG.testRecipient} に送信しますか？`);
  console.log('  （5秒後に自動送信、Ctrl+Cでキャンセル）\n');
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const transporter = nodemailer.createTransporter({
    host: CONFIG.smtpHost,
    port: CONFIG.smtpPort,
    secure: CONFIG.smtpPort === 465,
    auth: {
      user: CONFIG.smtpUser,
      pass: CONFIG.smtpPass,
    },
  });
  
  try {
    const info = await transporter.sendMail({
      from: `"DKIM Test" <${CONFIG.smtpUser}>`,
      to: CONFIG.testRecipient,
      subject: `DKIM Test [${new Date().toLocaleString('ja-JP')}]`,
      text: 'DKIMテストメール（プレーンテキスト）',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>🔐 DKIM設定テスト</h2>
          <p>このメールはDKIM署名のテストのために送信されました。</p>
          <hr>
          <h3>設定情報:</h3>
          <ul>
            <li>ドメイン: ${CONFIG.domain}</li>
            <li>セレクタ: ${CONFIG.selector}</li>
            <li>送信時刻: ${new Date().toLocaleString('ja-JP')}</li>
            <li>SMTPサーバー: ${CONFIG.smtpHost}</li>
          </ul>
          <hr>
          <h3>確認方法:</h3>
          <ol>
            <li>このメールのヘッダーを表示</li>
            <li>DKIM-Signatureヘッダーの存在を確認</li>
            <li>Authentication-Resultsでdkim=passを確認</li>
          </ol>
        </div>
      `,
      headers: {
        'X-Mailer': 'DKIM-Verification-Script',
        'X-Test-ID': Date.now().toString(),
      },
    });
    
    log.success('テストメール送信成功！');
    log.info(`Message ID: ${info.messageId}`);
    log.info(`送信先: ${CONFIG.testRecipient}`);
    
    console.log('\n📋 次のステップ:');
    console.log('1. 受信メールを確認');
    console.log('2. メールヘッダーを表示（Gmailの場合: 3点メニュー → メッセージのソースを表示）');
    console.log('3. DKIM-Signatureヘッダーの存在を確認');
    console.log('4. Authentication-Resultsでdkim=passを確認');
  } catch (error: any) {
    log.error('テストメール送信失敗');
    log.error(`エラー: ${error.message}`);
  }
}

/**
 * オンラインツールの案内
 */
function showOnlineTools(): void {
  log.header('6. オンライン検証ツール');
  
  console.log('以下のツールで詳細な検証ができます:\n');
  
  console.log('📊 Mail-Tester (総合スコア)');
  console.log('   URL: https://www.mail-tester.com/');
  console.log('   使い方: 表示されたアドレスにメール送信\n');
  
  console.log('🔍 DKIM Validator (DKIM専門)');
  console.log('   URL: https://dkimvalidator.com/');
  console.log('   使い方: 提供アドレスにメール送信\n');
  
  console.log('🛠 MX Toolbox (DNS検証)');
  console.log('   URL: https://mxtoolbox.com/SuperTool.aspx');
  console.log(`   使い方: "dkim:${CONFIG.selector}:${CONFIG.domain}" を入力\n`);
  
  console.log('📧 Google Postmaster Tools (Gmail配信分析)');
  console.log('   URL: https://postmaster.google.com/');
  console.log('   使い方: ドメインを登録して配信状況を監視\n');
}

/**
 * レポート生成
 */
function generateReport(results: {
  dkim: boolean;
  spf: boolean;
  dmarc: boolean;
  smtp: boolean;
}): void {
  log.header('検証結果サマリー');
  
  const totalScore = Object.values(results).filter(v => v).length;
  const maxScore = Object.keys(results).length;
  
  console.log('📊 設定状況:\n');
  console.log(`  DKIM設定:  ${results.dkim ? '✅ 設定済み' : '❌ 未設定'}`);
  console.log(`  SPF設定:   ${results.spf ? '✅ 設定済み' : '⚠️  未設定（推奨）'}`);
  console.log(`  DMARC設定: ${results.dmarc ? '✅ 設定済み' : '⚠️  未設定（オプション）'}`);
  console.log(`  SMTP接続:  ${results.smtp ? '✅ 成功' : '❌ 失敗'}`);
  
  console.log(`\n📈 スコア: ${totalScore}/${maxScore}`);
  
  if (!results.dkim) {
    console.log('\n🚨 重要: DKIMが未設定です！');
    console.log('   1. さくらコントロールパネルでDKIMを有効化');
    console.log('   2. 公開鍵を取得');
    console.log(`   3. DNSに sakuramail._domainkey.${CONFIG.domain} TXTレコードを追加`);
  }
  
  if (!results.spf) {
    console.log('\n⚠️  推奨: SPFレコードを設定してください');
    console.log(`   DNSに追加: v=spf1 include:_spf.sakura.ne.jp ~all`);
  }
  
  if (!results.dmarc) {
    console.log('\n💡 オプション: DMARCレコードで監視を強化できます');
    console.log(`   DNSに追加: v=DMARC1; p=none; rua=mailto:postmaster@${CONFIG.domain}`);
  }
  
  if (totalScore === maxScore) {
    console.log('\n🎉 完璧です！すべての設定が正しく構成されています。');
  }
}

/**
 * メイン処理
 */
async function main() {
  console.clear();
  console.log(`${colors.cyan}
╔══════════════════════════════════════════════════════════╗
║         さくらインターネット DKIM設定検証ツール          ║
╚══════════════════════════════════════════════════════════╝
${colors.reset}`);
  
  console.log(`\n🔍 検証対象ドメイン: ${colors.yellow}${CONFIG.domain}${colors.reset}`);
  console.log(`📌 DKIMセレクタ: ${colors.yellow}${CONFIG.selector}${colors.reset}\n`);
  
  const results = {
    dkim: await checkDKIMRecord(),
    spf: await checkSPFRecord(),
    dmarc: await checkDMARCRecord(),
    smtp: await testSMTPConnection(),
  };
  
  await sendTestEmail();
  showOnlineTools();
  generateReport(results);
  
  console.log('\n' + '='.repeat(60));
  console.log('検証完了！問題がある場合は上記の指示に従って設定してください。');
  console.log('='.repeat(60) + '\n');
}

// エラーハンドリング
process.on('unhandledRejection', (error: any) => {
  console.error('予期しないエラー:', error.message);
  process.exit(1);
});

// 実行
if (require.main === module) {
  main().catch(console.error);
}