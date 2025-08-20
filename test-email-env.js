// 環境変数テストスクリプト
const dotenv = require('dotenv');
const path = require('path');

// .env.localを読み込み
const result = dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

if (result.error) {
  console.log('❌ .env.localが読み込めません:', result.error.message);
  
  // .envを読み込み
  const envResult = dotenv.config({ path: path.resolve(process.cwd(), '.env') });
  if (envResult.error) {
    console.log('❌ .envも読み込めません:', envResult.error.message);
  } else {
    console.log('✅ .envを読み込みました');
  }
} else {
  console.log('✅ .env.localを読み込みました');
}

console.log('\n環境変数の状態:');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST || '未設定');
console.log('EMAIL_PORT:', process.env.EMAIL_PORT || '未設定');
console.log('EMAIL_USER:', process.env.EMAIL_USER || '未設定');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***設定済み***' : '未設定');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM || '未設定');