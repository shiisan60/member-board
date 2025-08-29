import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { checkPasswordStrength, validateEmail } from '@/lib/validators';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // メールアドレスのバリデーション
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: '有効なメールアドレスを入力してください' },
        { status: 400 }
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: 'メールアドレスとパスワードは必須です' },
        { status: 400 }
      );
    }

    // パスワード強度チェック
    const passwordStrength = checkPasswordStrength(password);
    if (!passwordStrength.isValid) {
      return NextResponse.json(
        { 
          error: 'パスワードが要件を満たしていません',
          details: passwordStrength.feedback
        },
        { status: 400 }
      );
    }

    // 既存ユーザーの確認
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, password: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に登録されています' },
        { status: 400 }
      );
    }

    // パスワードをハッシュ化
    const hashedPassword = await hashPassword(password);

    // ユーザーを作成（メール認証済みとして作成）
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        emailVerified: new Date(), // テスト用に即座に認証済みとする
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return NextResponse.json(
      { 
        message: '登録が完了しました。ログインできます。',
        user: { id: user.id, email: user.email, name: user.name }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Test registration error:', error);
    return NextResponse.json(
      { error: '登録処理中にエラーが発生しました', details: error.message },
      { status: 500 }
    );
  }
}