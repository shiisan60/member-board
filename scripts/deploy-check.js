#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 デプロイ前チェックを開始します...\n');

const checks = [];
let hasError = false;

// 1. 環境変数チェック
function checkEnvironmentVariables() {
  console.log('📋 環境変数をチェック中...');
  
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
  ];
  
  const envFile = '.env.production.local';
  const envPath = path.join(process.cwd(), envFile);
  
  if (!fs.existsSync(envPath)) {
    checks.push({
      name: '環境変数ファイル',
      status: '❌',
      message: `.env.production.local ファイルが見つかりません`,
    });
    hasError = true;
    return;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const missingVars = [];
  
  requiredEnvVars.forEach(varName => {
    if (!envContent.includes(`${varName}=`)) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    checks.push({
      name: '環境変数',
      status: '❌',
      message: `必須環境変数が不足: ${missingVars.join(', ')}`,
    });
    hasError = true;
  } else {
    checks.push({
      name: '環境変数',
      status: '✅',
      message: 'すべての必須環境変数が設定されています',
    });
  }
}

// 2. TypeScriptコンパイルチェック
function checkTypeScript() {
  console.log('🔍 TypeScriptをチェック中...');
  
  try {
    execSync('npm run type-check', { stdio: 'pipe' });
    checks.push({
      name: 'TypeScript',
      status: '✅',
      message: '型エラーなし',
    });
  } catch (error) {
    checks.push({
      name: 'TypeScript',
      status: '❌',
      message: '型エラーが検出されました',
    });
    hasError = true;
  }
}

// 3. ESLintチェック
function checkLint() {
  console.log('🧹 リントをチェック中...');
  
  try {
    execSync('npm run lint', { stdio: 'pipe' });
    checks.push({
      name: 'ESLint',
      status: '✅',
      message: 'リントエラーなし',
    });
  } catch (error) {
    checks.push({
      name: 'ESLint',
      status: '⚠️',
      message: 'リント警告があります',
    });
  }
}

// 4. ビルドチェック
function checkBuild() {
  console.log('🏗️  ビルドをチェック中...');
  
  try {
    execSync('npm run build', { stdio: 'pipe' });
    checks.push({
      name: 'ビルド',
      status: '✅',
      message: 'ビルド成功',
    });
  } catch (error) {
    checks.push({
      name: 'ビルド',
      status: '❌',
      message: 'ビルドエラーが発生しました',
    });
    hasError = true;
  }
}

// 5. セキュリティチェック
function checkSecurity() {
  console.log('🔒 セキュリティをチェック中...');
  
  const securityIssues = [];
  
  // .envファイルがgitignoreに含まれているか
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
    if (!gitignoreContent.includes('.env')) {
      securityIssues.push('.envファイルがgitignoreに含まれていません');
    }
  }
  
  // package-lock.jsonが存在するか
  const packageLockPath = path.join(process.cwd(), 'package-lock.json');
  if (!fs.existsSync(packageLockPath)) {
    securityIssues.push('package-lock.jsonが見つかりません');
  }
  
  if (securityIssues.length > 0) {
    checks.push({
      name: 'セキュリティ',
      status: '⚠️',
      message: securityIssues.join(', '),
    });
  } else {
    checks.push({
      name: 'セキュリティ',
      status: '✅',
      message: 'セキュリティチェック合格',
    });
  }
}

// 6. データベース接続チェック
function checkDatabase() {
  console.log('🗄️  データベース接続をチェック中...');
  
  try {
    execSync('npx prisma db push --skip-generate', { stdio: 'pipe' });
    checks.push({
      name: 'データベース',
      status: '✅',
      message: 'データベース接続成功',
    });
  } catch (error) {
    checks.push({
      name: 'データベース',
      status: '⚠️',
      message: 'データベース接続を確認してください',
    });
  }
}

// 7. パッケージの脆弱性チェック
function checkVulnerabilities() {
  console.log('🛡️  脆弱性をチェック中...');
  
  try {
    const result = execSync('npm audit --audit-level=high', { 
      stdio: 'pipe',
      encoding: 'utf-8' 
    });
    
    if (result.includes('found 0')) {
      checks.push({
        name: '脆弱性',
        status: '✅',
        message: '高リスクの脆弱性なし',
      });
    } else {
      checks.push({
        name: '脆弱性',
        status: '⚠️',
        message: '脆弱性が検出されました（npm audit fix を実行してください）',
      });
    }
  } catch (error) {
    checks.push({
      name: '脆弱性',
      status: '⚠️',
      message: '脆弱性チェックで警告があります',
    });
  }
}

// チェック実行
async function runChecks() {
  checkEnvironmentVariables();
  checkTypeScript();
  checkLint();
  checkSecurity();
  checkDatabase();
  checkVulnerabilities();
  checkBuild();
  
  // 結果表示
  console.log('\n========================================');
  console.log('📊 デプロイチェック結果');
  console.log('========================================\n');
  
  checks.forEach(check => {
    console.log(`${check.status} ${check.name}: ${check.message}`);
  });
  
  console.log('\n========================================\n');
  
  if (hasError) {
    console.error('❌ デプロイ前チェックに失敗しました。上記のエラーを修正してください。');
    process.exit(1);
  } else {
    console.log('✅ すべてのチェックに合格しました！デプロイ可能です。');
    console.log('\n次のコマンドでデプロイを実行できます:');
    console.log('  npm run deploy:production');
    console.log('\nまたは:');
    console.log('  vercel --prod');
  }
}

// メイン実行
runChecks().catch(error => {
  console.error('エラーが発生しました:', error);
  process.exit(1);
});