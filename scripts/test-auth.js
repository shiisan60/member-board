// node-fetchの動的インポート
const fetchModule = import('node-fetch');
let fetch;

const BASE_URL = 'http://localhost:3001';
const TEST_EMAIL = `test_${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPassword123!';
const TEST_NAME = 'Test User';

console.log('=== 認証機能の統合テスト ===\n');

// 色付きコンソール出力
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`)
};

// セッショントークンを保存
let sessionToken = null;
let userId = null;

async function testEndpoint(name, method, path, body = null, headers = {}) {
  console.log(`\n[${method}] ${path}`);
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${path}`, options);
    const data = await response.text();
    
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch {
      jsonData = data;
    }
    
    if (response.ok) {
      log.success(`${name}: ステータス ${response.status}`);
      console.log('  レスポンス:', JSON.stringify(jsonData, null, 2).substring(0, 200));
      return { success: true, data: jsonData, headers: response.headers };
    } else {
      log.error(`${name}: ステータス ${response.status}`);
      console.log('  エラー:', JSON.stringify(jsonData, null, 2).substring(0, 200));
      return { success: false, data: jsonData, status: response.status };
    }
  } catch (error) {
    log.error(`${name}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('テスト環境:');
  log.info(`URL: ${BASE_URL}`);
  log.info(`テストメール: ${TEST_EMAIL}`);
  log.info(`テストパスワード: ${TEST_PASSWORD}`);
  
  // 1. ヘルスチェック
  console.log('\n' + '='.repeat(50));
  console.log('1. API ヘルスチェック');
  console.log('='.repeat(50));
  
  const healthCheck = await testEndpoint(
    'APIヘルスチェック',
    'GET',
    '/api/test-db'
  );
  
  // 2. ユーザー登録
  console.log('\n' + '='.repeat(50));
  console.log('2. ユーザー登録');
  console.log('='.repeat(50));
  
  const registerResult = await testEndpoint(
    'ユーザー登録',
    'POST',
    '/api/auth/register',
    {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      name: TEST_NAME
    }
  );
  
  if (registerResult.success && registerResult.data.user) {
    userId = registerResult.data.user.id;
    log.info(`ユーザーID: ${userId}`);
  }
  
  // 3. 同じメールで再登録（エラーテスト）
  console.log('\n' + '='.repeat(50));
  console.log('3. 重複登録テスト');
  console.log('='.repeat(50));
  
  const duplicateResult = await testEndpoint(
    '重複メール登録',
    'POST',
    '/api/auth/register',
    {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      name: TEST_NAME
    }
  );
  
  if (duplicateResult.status === 400) {
    log.success('重複登録が正しく拒否されました');
  }
  
  // 4. ログイン
  console.log('\n' + '='.repeat(50));
  console.log('4. ログイン');
  console.log('='.repeat(50));
  
  const loginResult = await testEndpoint(
    'ログイン',
    'POST',
    '/api/auth/login',
    {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    }
  );
  
  if (loginResult.success && loginResult.data.token) {
    sessionToken = loginResult.data.token;
    log.info(`セッショントークン取得: ${sessionToken.substring(0, 20)}...`);
  }
  
  // 5. 不正なパスワードでログイン
  console.log('\n' + '='.repeat(50));
  console.log('5. 不正なパスワードでのログイン');
  console.log('='.repeat(50));
  
  const wrongPasswordResult = await testEndpoint(
    '不正なパスワード',
    'POST',
    '/api/auth/login',
    {
      email: TEST_EMAIL,
      password: 'WrongPassword123!'
    }
  );
  
  if (wrongPasswordResult.status === 401) {
    log.success('不正なパスワードが正しく拒否されました');
  }
  
  // 6. プロフィール取得（認証必要）
  console.log('\n' + '='.repeat(50));
  console.log('6. プロフィール取得');
  console.log('='.repeat(50));
  
  const profileResult = await testEndpoint(
    'プロフィール取得',
    'GET',
    '/api/profile',
    null,
    sessionToken ? { 'Authorization': `Bearer ${sessionToken}` } : {}
  );
  
  // 7. プロフィール更新
  console.log('\n' + '='.repeat(50));
  console.log('7. プロフィール更新');
  console.log('='.repeat(50));
  
  const updateResult = await testEndpoint(
    'プロフィール更新',
    'PATCH',
    '/api/profile',
    {
      name: 'Updated Test User',
      bio: 'This is a test bio'
    },
    sessionToken ? { 'Authorization': `Bearer ${sessionToken}` } : {}
  );
  
  // 8. セッション検証
  console.log('\n' + '='.repeat(50));
  console.log('8. セッション検証');
  console.log('='.repeat(50));
  
  const sessionResult = await testEndpoint(
    'セッション検証',
    'GET',
    '/api/auth/session',
    null,
    sessionToken ? { 'Authorization': `Bearer ${sessionToken}` } : {}
  );
  
  // 9. ログアウト
  console.log('\n' + '='.repeat(50));
  console.log('9. ログアウト');
  console.log('='.repeat(50));
  
  const logoutResult = await testEndpoint(
    'ログアウト',
    'POST',
    '/api/auth/logout',
    {},
    sessionToken ? { 'Authorization': `Bearer ${sessionToken}` } : {}
  );
  
  // 10. ログアウト後のプロフィールアクセス
  console.log('\n' + '='.repeat(50));
  console.log('10. ログアウト後のアクセス');
  console.log('='.repeat(50));
  
  const afterLogoutResult = await testEndpoint(
    'ログアウト後のプロフィール',
    'GET',
    '/api/profile',
    null,
    sessionToken ? { 'Authorization': `Bearer ${sessionToken}` } : {}
  );
  
  if (afterLogoutResult.status === 401 || afterLogoutResult.status === 403) {
    log.success('ログアウト後のアクセスが正しく拒否されました');
  }
  
  // テスト結果のサマリー
  console.log('\n' + '='.repeat(50));
  console.log('テスト結果サマリー');
  console.log('='.repeat(50));
  
  const results = {
    'APIヘルスチェック': healthCheck.success,
    'ユーザー登録': registerResult.success,
    '重複登録防止': duplicateResult.status === 400,
    'ログイン': loginResult.success,
    '不正パスワード拒否': wrongPasswordResult.status === 401,
    'プロフィール取得': profileResult.success,
    'プロフィール更新': updateResult.success,
    'セッション検証': sessionResult.success,
    'ログアウト': logoutResult.success,
    'ログアウト後アクセス拒否': afterLogoutResult.status === 401 || afterLogoutResult.status === 403
  };
  
  let passedCount = 0;
  let failedCount = 0;
  
  Object.entries(results).forEach(([test, passed]) => {
    if (passed) {
      log.success(test);
      passedCount++;
    } else {
      log.error(test);
      failedCount++;
    }
  });
  
  console.log('\n' + '='.repeat(50));
  console.log(`合計: ${passedCount + failedCount} テスト`);
  console.log(`${colors.green}成功: ${passedCount}${colors.reset}`);
  console.log(`${colors.red}失敗: ${failedCount}${colors.reset}`);
  console.log('='.repeat(50));
  
  if (failedCount === 0) {
    console.log(`\n${colors.green}🎉 すべてのテストが成功しました！${colors.reset}`);
  } else {
    console.log(`\n${colors.red}⚠️  ${failedCount} 個のテストが失敗しました。${colors.reset}`);
  }
}

// メイン実行
async function main() {
  // node-fetchを動的インポート
  const module = await fetchModule;
  fetch = module.default;
  
  // サーバーが起動するまで待つ
  console.log('サーバー起動を待っています...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await runTests();
}

main().catch(console.error);