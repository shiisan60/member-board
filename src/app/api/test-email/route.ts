import { NextRequest, NextResponse } from 'next/server';
import { testEmailConnection, sendNotificationEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const testEmail = searchParams.get('email');
    const testType = searchParams.get('type') || 'connection';

    // 環境変数の確認
    const config = {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE,
      user: process.env.EMAIL_USER,
      from: process.env.EMAIL_FROM,
      admin: process.env.EMAIL_ADMIN,
      support: process.env.EMAIL_SUPPORT,
      postmaster: process.env.EMAIL_POSTMASTER,
    };

    // 環境変数チェック
    if (testType === 'config') {
      const missingVars = [];
      if (!config.host) missingVars.push('EMAIL_HOST');
      if (!config.port) missingVars.push('EMAIL_PORT');
      if (!config.user) missingVars.push('EMAIL_USER');
      if (!process.env.EMAIL_PASS) missingVars.push('EMAIL_PASS');
      if (!config.from) missingVars.push('EMAIL_FROM');

      return NextResponse.json({
        success: missingVars.length === 0,
        config: {
          host: config.host || '未設定',
          port: config.port || '未設定',
          secure: config.secure || 'false',
          user: config.user ? `${config.user.substring(0, 3)}***` : '未設定',
          from: config.from || '未設定',
          admin: config.admin || '未設定',
          support: config.support || '未設定',
          postmaster: config.postmaster || '未設定',
        },
        missing: missingVars,
      });
    }

    // SMTP接続テスト
    const isConnected = await testEmailConnection();
    
    if (!isConnected && testType === 'connection') {
      return NextResponse.json({
        success: false,
        error: 'Email server connection failed',
        config: {
          host: config.host,
          port: config.port,
          secure: config.secure,
        }
      }, { status: 500 });
    }

    if (testType === 'connection') {
      return NextResponse.json({
        success: true,
        message: 'Email server is connected and ready',
        config: {
          host: config.host,
          port: config.port,
          secure: config.secure,
          user: config.user,
        }
      });
    }

    // メール送信テスト
    if (testType === 'send' && testEmail) {
      const testHtml = `
        <h2>メール送信テスト</h2>
        <p>これはBubunene Forumからのテストメールです。</p>
        <h3>設定情報:</h3>
        <ul>
          <li>SMTPサーバー: ${config.host}:${config.port}</li>
          <li>暗号化: ${config.secure === 'true' ? 'SSL/TLS' : 'STARTTLS'}</li>
          <li>送信元: ${config.from}</li>
          <li>送信日時: ${new Date().toLocaleString('ja-JP')}</li>
        </ul>
        <p>メール送信機能が正常に動作しています。</p>
      `;

      await sendNotificationEmail(
        testEmail,
        'Test User',
        '【テスト】Bubunene Forum メール送信テスト',
        'これはBubunene Forumからのテストメールです。',
        `${process.env.NEXTAUTH_URL}`,
        'フォーラムへ移動',
        testHtml
      );

      return NextResponse.json({
        success: true,
        message: `Test email sent to ${testEmail}`,
        timestamp: new Date().toISOString(),
      });
    }

    // 複数アドレステスト
    if (testType === 'multi') {
      const results = [];
      const addresses = [
        { email: config.admin, type: 'Admin' },
        { email: config.support, type: 'Support' },
        { email: config.postmaster, type: 'Postmaster' },
      ].filter(a => a.email);

      for (const addr of addresses) {
        try {
          await sendNotificationEmail(
            addr.email!,
            addr.type,
            `【テスト】${addr.type}アドレス確認`,
            `${addr.type}アドレスの動作確認メールです。`,
            `${process.env.NEXTAUTH_URL}`,
            'フォーラムへ移動'
          );
          results.push({ ...addr, success: true });
        } catch (error) {
          results.push({ ...addr, success: false, error: String(error) });
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Multi-address test completed',
        results,
      });
    }

    return NextResponse.json({
      error: 'Invalid test type',
      usage: {
        config: '/api/test-email?type=config',
        connection: '/api/test-email?type=connection',
        send: '/api/test-email?type=send&email=test@example.com',
        multi: '/api/test-email?type=multi',
      }
    }, { status: 400 });

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}