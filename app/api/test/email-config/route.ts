import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const emailConfig = {
      status: 'OK',
      environment: process.env.NODE_ENV,
      emailSettings: {
        EMAIL_HOST: process.env.EMAIL_HOST ? 'Set' : 'Not set',
        EMAIL_PORT: process.env.EMAIL_PORT ? 'Set' : 'Not set',
        EMAIL_USER: process.env.EMAIL_USER ? 'Set (***masked***)' : 'Not set',
        EMAIL_PASS: process.env.EMAIL_PASS ? 'Set (***masked***)' : 'Not set',
        EMAIL_FROM: process.env.EMAIL_FROM ? 'Set' : 'Not set',
        EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME ? 'Set' : 'Not set',
        EMAIL_SECURE: process.env.EMAIL_SECURE,
      },
      actualValues: {
        EMAIL_HOST: process.env.EMAIL_HOST,
        EMAIL_PORT: process.env.EMAIL_PORT,
        EMAIL_FROM: process.env.EMAIL_FROM,
        EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,
        EMAIL_SECURE: process.env.EMAIL_SECURE,
      },
      timestamp: new Date().toISOString(),
    };
    
    return NextResponse.json(emailConfig);
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'Email config check failed',
        message: error.message,
      },
      { status: 500 }
    );
  }
}