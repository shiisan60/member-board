// Node.js 18以降ではfetchは標準搭載

const BASE_URL = 'http://localhost:3000';

/**
 * セキュリティテストスクリプト
 */

console.log('🔒 セキュリティテストを開始します...\n');

// テスト結果の記録
const testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

function logTest(name, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${name}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${name} - ${details}`);
  }
}

/**
 * レート制限テスト
 */
async function testRateLimit() {
  console.log('📊 レート制限テスト');
  
  try {
    const promises = [];
    
    // 6回の同時リクエスト（制限は5回）
    for (let i = 0; i < 6; i++) {
      promises.push(
        fetch(`${BASE_URL}/api/posts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: `テスト投稿 ${i}`,
            content: 'テスト内容'
          })
        })
      );
    }
    
    const responses = await Promise.all(promises);
    
    // 最後のリクエストは429エラーになるはず
    const lastResponse = responses[responses.length - 1];
    const rateLimitTriggered = lastResponse.status === 429;
    
    logTest('レート制限（429エラー）', rateLimitTriggered, 
      `Status: ${lastResponse.status}, Expected: 429`);
    
    // Retry-Afterヘッダーの確認
    const retryAfter = lastResponse.headers.get('Retry-After');
    logTest('Retry-Afterヘッダー', !!retryAfter, 
      retryAfter ? `Found: ${retryAfter}` : 'Missing header');
    
  } catch (error) {
    logTest('レート制限テスト', false, error.message);
  }
}

/**
 * XSS攻撃テスト
 */
async function testXSSProtection() {
  console.log('\n🚫 XSS攻撃テスト');
  
  const xssPayloads = [
    '<script>alert("XSS")</script>',
    'javascript:alert("XSS")',
    '<img src="x" onerror="alert(1)">',
    '<svg onload="alert(1)">',
    '"><script>alert(1)</script>'
  ];
  
  for (const payload of xssPayloads) {
    try {
      const response = await fetch(`${BASE_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: payload,
          content: 'テスト内容'
        })
      });
      
      // 400エラーが返されることを期待（入力検証エラー）
      const blocked = response.status === 400;
      logTest(`XSS対策 - ${payload.substring(0, 20)}...`, blocked,
        blocked ? '' : `Status: ${response.status}, Expected: 400`);
      
    } catch (error) {
      logTest(`XSS対策テスト`, false, error.message);
    }
  }
}

/**
 * NoSQLインジェクションテスト
 */
async function testNoSQLInjection() {
  console.log('\n💉 NoSQLインジェクションテスト');
  
  const injectionPayloads = [
    { title: { $gt: "" }, content: "テスト" },
    { title: { $ne: null }, content: "テスト" },
    { title: "テスト", content: { $where: "function() { return true; }" } },
    { $or: [{ title: "テスト" }, { content: "テスト" }] }
  ];
  
  for (const payload of injectionPayloads) {
    try {
      const response = await fetch(`${BASE_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      // 400エラーまたは500エラーが返されることを期待
      const blocked = response.status >= 400;
      logTest(`NoSQLインジェクション対策`, blocked,
        blocked ? '' : `Status: ${response.status}, Payload accepted`);
      
    } catch (error) {
      logTest(`NoSQLインジェクションテスト`, false, error.message);
    }
  }
}

/**
 * セキュリティヘッダーテスト
 */
async function testSecurityHeaders() {
  console.log('\n🛡️ セキュリティヘッダーテスト');
  
  try {
    const response = await fetch(`${BASE_URL}/`);
    const headers = response.headers;
    
    const expectedHeaders = {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': 'default-src \'self\''
    };
    
    for (const [headerName, expectedValue] of Object.entries(expectedHeaders)) {
      const headerValue = headers.get(headerName);
      const hasHeader = !!headerValue;
      const correctValue = headerValue && headerValue.includes(expectedValue);
      
      logTest(`${headerName}ヘッダー存在`, hasHeader,
        hasHeader ? `Found: ${headerValue}` : 'Header missing');
      
      if (hasHeader) {
        logTest(`${headerName}ヘッダー値`, correctValue,
          correctValue ? '' : `Got: ${headerValue}, Expected: ${expectedValue}`);
      }
    }
    
  } catch (error) {
    logTest('セキュリティヘッダーテスト', false, error.message);
  }
}

/**
 * 文字数制限テスト
 */
async function testInputValidation() {
  console.log('\n📏 入力値検証テスト');
  
  // 長すぎるタイトル（21文字）
  try {
    const response = await fetch(`${BASE_URL}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'あ'.repeat(21), // 20文字制限を超過
        content: 'テスト内容'
      })
    });
    
    const rejected = response.status === 400;
    logTest('タイトル文字数制限', rejected,
      rejected ? '' : `Status: ${response.status}, Expected: 400`);
    
  } catch (error) {
    logTest('タイトル文字数制限テスト', false, error.message);
  }
  
  // 長すぎる本文（201文字）
  try {
    const response = await fetch(`${BASE_URL}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'テストタイトル',
        content: 'あ'.repeat(201) // 200文字制限を超過
      })
    });
    
    const rejected = response.status === 400;
    logTest('本文文字数制限', rejected,
      rejected ? '' : `Status: ${response.status}, Expected: 400`);
    
  } catch (error) {
    logTest('本文文字数制限テスト', false, error.message);
  }
}

/**
 * メインテスト実行
 */
async function runSecurityTests() {
  await testRateLimit();
  await testXSSProtection();
  await testNoSQLInjection();
  await testSecurityHeaders();
  await testInputValidation();
  
  console.log('\n📊 テスト結果:');
  console.log(`総テスト数: ${testResults.total}`);
  console.log(`✅ 成功: ${testResults.passed}`);
  console.log(`❌ 失敗: ${testResults.failed}`);
  
  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
  console.log(`成功率: ${successRate}%`);
  
  if (testResults.failed > 0) {
    console.log('\n⚠️ 失敗したテストがあります。セキュリティ設定を確認してください。');
    process.exit(1);
  } else {
    console.log('\n🎉 全てのセキュリティテストが通過しました！');
  }
}

// テスト実行
runSecurityTests().catch(console.error);