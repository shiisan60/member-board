import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    console.log('Sending test email to:', email);
    
    const result = await sendVerificationEmail(
      email,
      'テストユーザー',
      'test-token-12345'
    );

    console.log('Email send result:', result);

    if (result.success) {
      return NextResponse.json({
        message: 'Test email sent successfully',
        messageId: result.messageId
      });
    } else {
      return NextResponse.json({
        error: 'Failed to send email',
        details: result.error
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Test email error:', error);
    return NextResponse.json({
      error: 'Test email failed',
      details: error.message
    }, { status: 500 });
  }
}