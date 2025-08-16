import nodemailer from 'nodemailer';
import dns from 'dns/promises';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

// さくらメールの設定に合わせて更新
const SMTP_CONFIG = {
  host: 'bubunene.sakura.ne.jp',
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER || 'admin@bubunene.com',
    pass: process.env.MAIL_PASS || '',
  },
};

// テスト用のメールアドレス（実際のアドレスに変更してください）
const TEST_RECIPIENT = 'test@gmail.com'; // GmailなどDKIM検証が確認できるアドレス
const DOMAIN = 'bubunene.com';

async function checkDNSRecords() {
  console.log('=== DNS Records Check ===\n');
  
  // DKIMレコード確認（さくらメールのデフォルトセレクタ）
  const selectors = ['sakuramail', 'default', 'selector1', 'selector2'];
  
  for (const selector of selectors) {
    const recordName = `${selector}._domainkey.${DOMAIN}`;
    try {
      const records = await dns.resolveTxt(recordName);
      if (records.length > 0) {
        console.log(`✅ DKIM record found for ${selector}:`);
        console.log(`   ${recordName}`);
        console.log(`   Value: ${records[0].join('')}\n`);
      }
    } catch (error) {
      console.log(`❌ No DKIM record for selector: ${selector}`);
    }
  }
  
  // SPFレコード確認
  try {
    const spfRecords = await dns.resolveTxt(DOMAIN);
    const spfRecord = spfRecords.find(r => r[0].startsWith('v=spf1'));
    if (spfRecord) {
      console.log(`✅ SPF record found:`);
      console.log(`   ${spfRecord.join('')}\n`);
    } else {
      console.log(`❌ No SPF record found\n`);
    }
  } catch (error) {
    console.log(`❌ Error checking SPF record: ${error}\n`);
  }
  
  // DMARCレコード確認
  try {
    const dmarcRecords = await dns.resolveTxt(`_dmarc.${DOMAIN}`);
    if (dmarcRecords.length > 0) {
      console.log(`✅ DMARC record found:`);
      console.log(`   ${dmarcRecords[0].join('')}\n`);
    }
  } catch (error) {
    console.log(`❌ No DMARC record found\n`);
  }
}

async function sendTestEmail() {
  console.log('=== Sending Test Email ===\n');
  
  if (!SMTP_CONFIG.auth.pass) {
    console.error('❌ Please set MAIL_PASS environment variable');
    return null;
  }
  
  const transporter = nodemailer.createTransporter(SMTP_CONFIG);
  
  try {
    // 接続テスト
    await transporter.verify();
    console.log('✅ SMTP connection successful\n');
    
    // テストメール送信
    const info = await transporter.sendMail({
      from: `"DKIM Test" <${SMTP_CONFIG.auth.user}>`,
      to: TEST_RECIPIENT,
      subject: `DKIM Test - ${new Date().toISOString()}`,
      text: 'This is a test email to verify DKIM signing.',
      html: `
        <h2>DKIM Test Email</h2>
        <p>This email was sent to test DKIM configuration.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
        <p>Domain: ${DOMAIN}</p>
        <hr>
        <p><small>Please check the email headers to verify DKIM signature.</small></p>
      `,
      headers: {
        'X-Test-Header': 'DKIM-Test',
        'X-Mailer': 'NodeMailer-DKIM-Test',
      },
    });
    
    console.log('✅ Email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   To: ${TEST_RECIPIENT}\n`);
    
    return info;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return null;
  }
}

async function verifyWithOnlineTools() {
  console.log('=== Online Verification Tools ===\n');
  console.log('You can verify DKIM using these tools:\n');
  console.log('1. Mail-Tester: https://www.mail-tester.com/');
  console.log('   - Send an email to the provided address');
  console.log('   - Check the detailed report for DKIM status\n');
  console.log('2. DKIM Validator: https://dkimvalidator.com/');
  console.log('   - Send an email to the provided address');
  console.log('   - Get instant DKIM validation results\n');
  console.log('3. MX Toolbox: https://mxtoolbox.com/dkim.aspx');
  console.log('   - Enter your domain and selector to verify DNS records\n');
}

async function checkEmailHeaders(messageId?: string) {
  console.log('=== How to Check Email Headers ===\n');
  
  console.log('Gmail:');
  console.log('1. Open the test email');
  console.log('2. Click the three dots menu (⋮)');
  console.log('3. Select "Show original"');
  console.log('4. Look for these headers:\n');
  console.log('   - DKIM-Signature: Should be present');
  console.log('   - Authentication-Results: Should show "dkim=pass"\n');
  
  console.log('Outlook:');
  console.log('1. Open the test email');
  console.log('2. File → Properties → Internet headers');
  console.log('3. Look for DKIM-Signature header\n');
  
  if (messageId) {
    console.log(`Your test email Message-ID: ${messageId}`);
    console.log('Use this to identify your test email in the inbox.\n');
  }
}

async function main() {
  console.log('========================================');
  console.log('        DKIM Configuration Test         ');
  console.log('========================================\n');
  
  // 1. DNS レコードの確認
  await checkDNSRecords();
  
  // 2. テストメール送信
  console.log('Do you want to send a test email? (Requires MAIL_PASS environment variable)');
  console.log(`Test email will be sent to: ${TEST_RECIPIENT}`);
  console.log('Press Ctrl+C to skip, or wait 5 seconds to continue...\n');
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const emailInfo = await sendTestEmail();
  
  // 3. 検証方法の説明
  await verifyWithOnlineTools();
  
  // 4. ヘッダー確認方法
  await checkEmailHeaders(emailInfo?.messageId);
  
  console.log('========================================');
  console.log('           Test Complete!               ');
  console.log('========================================\n');
  
  console.log('Summary:');
  console.log('1. Check DNS records above for DKIM configuration');
  console.log('2. If email was sent, check recipient inbox');
  console.log('3. Verify DKIM signature in email headers');
  console.log('4. Use online tools for detailed verification\n');
}

// 環境変数を読み込み
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// スクリプト実行
main().catch(console.error);