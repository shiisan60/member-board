import { NextResponse } from 'next/server';
import { testEmailConnection, sendNotificationEmail } from '@/lib/email';

export async function GET() {
  try {
    // Test email connection
    const connectionResult = await testEmailConnection();
    
    if (!connectionResult.success) {
      return NextResponse.json(
        { 
          success: false,
          error: connectionResult.error,
          message: 'Email connection failed'
        },
        { status: 500 }
      );
    }

    // Send test email to admin
    const adminEmail = process.env.EMAIL_ADMIN || process.env.EMAIL_FROM;
    if (!adminEmail) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No admin email configured',
          message: 'Set EMAIL_ADMIN or EMAIL_FROM environment variable'
        },
        { status: 400 }
      );
    }

    const testResult = await sendNotificationEmail(
      adminEmail,
      'Admin',
      'メール送信テスト',
      'これはMember Boardのメール送信機能のテストメールです。\\n\\nこのメールが正常に受信できていれば、メール設定は正しく動作しています。',
      `${process.env.NEXTAUTH_URL}/dashboard`,
      'ダッシュボードに移動'
    );

    if (testResult.success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${adminEmail}`,
        messageId: testResult.messageId,
        connection: 'OK'
      });
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: testResult.error,
          message: 'Test email sending failed'
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('❌ Email test error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    );
  }
}