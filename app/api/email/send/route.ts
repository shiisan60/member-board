import { NextRequest, NextResponse } from 'next/server';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendNotificationEmail,
  testEmailConnection,
  validateEmailTemplate,
  SendEmailResult
} from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, email, data } = body;

    // Validate required fields
    if (!type || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: type, email' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    let result: SendEmailResult;

    switch (type) {
      case 'verification':
        if (!validateEmailTemplate('verification', data)) {
          return NextResponse.json(
            { error: 'Invalid data for verification email' },
            { status: 400 }
          );
        }
        result = await sendVerificationEmail(email, data.username, data.token);
        break;

      case 'password-reset':
        if (!validateEmailTemplate('password-reset', data)) {
          return NextResponse.json(
            { error: 'Invalid data for password reset email' },
            { status: 400 }
          );
        }
        result = await sendPasswordResetEmail(email, data.username, data.token);
        break;

      case 'welcome':
        if (!validateEmailTemplate('welcome', data)) {
          return NextResponse.json(
            { error: 'Invalid data for welcome email' },
            { status: 400 }
          );
        }
        result = await sendWelcomeEmail(email, data.username);
        break;

      case 'notification':
        if (!validateEmailTemplate('notification', data)) {
          return NextResponse.json(
            { error: 'Invalid data for notification email' },
            { status: 400 }
          );
        }
        result = await sendNotificationEmail(
          email,
          data.username,
          data.subject,
          data.message,
          data.actionUrl,
          data.actionText
        );
        break;

      default:
        return NextResponse.json(
          { error: `Unknown email type: ${type}` },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: `${type} email sent successfully`
      });
    } else {
      return NextResponse.json(
        { 
          error: `Failed to send ${type} email: ${result.error}`,
          success: false 
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('❌ Email API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Test email connection endpoint
export async function GET() {
  try {
    const result = await testEmailConnection();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Email connection test successful'
      });
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: result.error,
          message: 'Email connection test failed'
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('❌ Email connection test error:', error);
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