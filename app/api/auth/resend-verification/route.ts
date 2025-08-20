import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'メールアドレスが必要です' },
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
        tokenExpiry: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    // 既に認証済みかチェック
    if (user.emailVerified) {
      return NextResponse.json(
        { message: 'メールアドレスは既に認証済みです' },
        { status: 200 }
      );
    }

    // 前回の送信から最低5分経過しているかチェック（スパム防止）
    if (user.tokenExpiry) {
      const lastSent = new Date(user.tokenExpiry.getTime() - 24 * 60 * 60 * 1000); // 有効期限から24時間引いて送信時刻を推定
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      if (lastSent > fiveMinutesAgo) {
        const waitTime = Math.ceil((lastSent.getTime() - fiveMinutesAgo.getTime()) / 1000 / 60);
        return NextResponse.json(
          { error: `再送信は${waitTime}分後に可能です` },
          { status: 429 }
        );
      }
    }

    // 新しいトークンを生成
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24時間後

    // ユーザー情報を更新
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        tokenExpiry,
      },
    });

    // 認証メールを送信
    try {
      await sendVerificationEmail(
        user.email,
        user.name || 'ユーザー',
        verificationToken
      );
    } catch (emailError) {
      console.error('メール送信エラー:', emailError);
      
      // トークンをクリア
      await prisma.user.update({
        where: { id: user.id },
        data: {
          verificationToken: null,
          tokenExpiry: null,
        },
      });

      return NextResponse.json(
        { error: 'メール送信に失敗しました。しばらく後にお試しください。' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: '認証メールを再送信しました。メールをご確認ください。',
        email: user.email,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: '認証メール再送信中にエラーが発生しました' },
      { status: 500 }
    );
  }
}