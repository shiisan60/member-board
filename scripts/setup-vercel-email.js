#!/usr/bin/env node

/**
 * Vercel環境変数設定スクリプト - メール設定用
 * 
 * 使い方:
 * 1. .env.localファイルにメール設定を記載
 * 2. npm run setup:vercel:email を実行
 * 3. Vercelにログイン済みであることを確認
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

// 必須のメール環境変数
const REQUIRED_EMAIL_VARS = [
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_SECURE',
  'EMAIL_USER',
  'EMAIL_PASS',
  'EMAIL_FROM',
  'EMAIL_FROM_NAME',
  'EMAIL_ADMIN'
];

// オプションのメール環境変数
const OPTIONAL_EMAIL_VARS = [
  'EMAIL_SUPPORT',
  'EMAIL_POSTMASTER',
  'EMAIL_REPLY_TO',
  'EMAIL_MAX_RETRIES',
  'EMAIL_RETRY_DELAY'
];

async function main() {
  console.log('===================================');
  console.log('📧 Vercel メール設定セットアップ');
  console.log('===================================\n');

  try {
    // Vercelにログインしているか確認
    try {
      execSync('vercel whoami', { stdio: 'pipe' });
      console.log('✅ Vercelにログイン済み\n');
    } catch {
      console.error('❌ Vercelにログインしていません');
      console.log('以下のコマンドでログインしてください:');
      console.log('  vercel login\n');
      process.exit(1);
    }

    // プロジェクト名を取得
    const projectName = await question('Vercelプロジェクト名を入力 (member-board-week2): ');
    const project = projectName.trim() || 'member-board-week2';

    // .env.localファイルを読み込む
    const envPath = path.join(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) {
      console.error('❌ .env.localファイルが見つかりません');
      process.exit(1);
    }

    const envContent = fs.readFileSync(envPath, 'utf-8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          envVars[key.trim()] = value.trim();
        }
      }
    });

    console.log('\n📋 メール設定の確認:');
    console.log('─────────────────────────────────\n');

    // 必須変数のチェック
    const missingVars = [];
    for (const varName of REQUIRED_EMAIL_VARS) {
      if (!envVars[varName]) {
        missingVars.push(varName);
        console.log(`❌ ${varName}: 未設定`);
      } else {
        const displayValue = varName === 'EMAIL_PASS' 
          ? '***' + envVars[varName].slice(-3)
          : envVars[varName];
        console.log(`✅ ${varName}: ${displayValue}`);
      }
    }

    if (missingVars.length > 0) {
      console.error('\n❌ 必須の環境変数が不足しています:', missingVars.join(', '));
      console.log('\n.env.localファイルに以下の変数を追加してください:');
      missingVars.forEach(v => console.log(`  ${v}=your_value_here`));
      process.exit(1);
    }

    // オプション変数の確認
    console.log('\n📋 オプション設定:');
    console.log('─────────────────────────────────\n');
    for (const varName of OPTIONAL_EMAIL_VARS) {
      if (envVars[varName]) {
        console.log(`✅ ${varName}: ${envVars[varName]}`);
      }
    }

    // 環境の選択
    console.log('\n🎯 デプロイ環境の選択:');
    console.log('  1. Production (本番環境)');
    console.log('  2. Preview (プレビュー環境)');
    console.log('  3. Development (開発環境)');
    const envChoice = await question('\n環境を選択 (1-3) [1]: ');
    
    const environments = {
      '1': 'production',
      '2': 'preview', 
      '3': 'development',
      '': 'production'
    };
    const targetEnv = environments[envChoice] || 'production';

    // 設定の確認
    console.log('\n===================================');
    console.log('📝 以下の設定でVercelに環境変数を追加します:');
    console.log(`  プロジェクト: ${project}`);
    console.log(`  環境: ${targetEnv}`);
    console.log('===================================\n');

    const proceed = await question('続行しますか？ (y/N): ');
    if (proceed.toLowerCase() !== 'y') {
      console.log('キャンセルしました');
      process.exit(0);
    }

    // Vercel環境変数を設定
    console.log('\n🚀 環境変数を設定中...\n');

    const allEmailVars = [...REQUIRED_EMAIL_VARS, ...OPTIONAL_EMAIL_VARS];
    let successCount = 0;
    let errorCount = 0;

    for (const varName of allEmailVars) {
      if (envVars[varName]) {
        try {
          // 既存の変数を削除（更新のため）
          try {
            execSync(
              `vercel env rm ${varName} ${targetEnv} --yes`,
              { stdio: 'pipe', cwd: process.cwd() }
            );
          } catch {
            // 変数が存在しない場合はエラーになるが無視
          }

          // 新しい値を設定
          const value = envVars[varName];
          // vercel env addコマンドで値を直接パイプで渡す
          execSync(
            `echo "${value}" | vercel env add ${varName} ${targetEnv}`,
            { shell: true, cwd: process.cwd(), stdio: 'pipe' }
          );
          
          const displayName = varName === 'EMAIL_PASS' ? `${varName} (masked)` : varName;
          console.log(`✅ ${displayName} を設定しました`);
          successCount++;
        } catch (error) {
          console.error(`❌ ${varName} の設定に失敗:`, error.message);
          errorCount++;
        }
      }
    }

    console.log('\n===================================');
    console.log('📊 設定結果:');
    console.log(`  成功: ${successCount} 個`);
    console.log(`  失敗: ${errorCount} 個`);
    console.log('===================================\n');

    if (successCount > 0) {
      console.log('✅ メール環境変数の設定が完了しました！\n');
      console.log('次のステップ:');
      console.log('1. Vercelダッシュボードで環境変数を確認');
      console.log('   https://vercel.com/dashboard/project/' + project + '/settings/environment-variables');
      console.log('2. 再デプロイを実行:');
      console.log('   vercel --prod');
      console.log('3. 本番環境でメール送信をテスト\n');
    }

  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();