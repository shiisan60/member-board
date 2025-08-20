import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWelcomeEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: '認証トークンが必要です' },
        { status: 400 }
      );
    }

    // トークンでユーザーを検索
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        tokenExpiry: {
          gte: new Date(), // 有効期限内
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: '無効または期限切れの認証トークンです' },
        { status: 400 }
      );
    }

    // 既に認証済みかチェック
    if (user.emailVerified) {
      return NextResponse.json(
        { message: 'メールアドレスは既に認証済みです' },
        { status: 200 }
      );
    }

    // メール認証完了
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null, // トークンを削除
        tokenExpiry: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
      },
    });

    // ウェルカムメールを送信
    try {
      await sendWelcomeEmail(
        updatedUser.email,
        updatedUser.name || 'ユーザー'
      );
    } catch (emailError) {
      console.error('ウェルカムメール送信エラー:', emailError);
      // ウェルカムメール送信失敗は認証成功には影響しない
    }

    return NextResponse.json(
      { 
        message: 'メールアドレスの認証が完了しました。ログインできます。',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          emailVerified: updatedUser.emailVerified,
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'メール認証処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}