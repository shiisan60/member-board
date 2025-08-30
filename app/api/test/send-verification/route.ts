import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // ユーザーを検索
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        verificationToken: true,
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    if (user.emailVerified) {
      return NextResponse.json(
        { message: 'Email already verified' },
        { status: 200 }
      );
    }
    
    if (!user.verificationToken) {
      return NextResponse.json(
        { error: 'No verification token found' },
        { status: 400 }
      );
    }
    
    // 確認メールを再送信
    const result = await sendVerificationEmail(
      user.email,
      user.name || 'ユーザー',
      user.verificationToken
    );
    
    if (result.success) {
      return NextResponse.json({
        message: 'Verification email sent successfully',
        messageId: result.messageId
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Send verification email error:', error);
    return NextResponse.json(
      { error: 'Failed to send verification email', details: error.message },
      { status: 500 }
    );
  }
}