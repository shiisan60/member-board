import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { checkPasswordStrength, validateEmail } from '@/lib/validators';
import { sendVerificationEmail } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

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

    // Delete any existing problematic users first
    const problematicEmails = [
      '03shimizutaka@gmail.com',
      'himawarishimizu3d@gmail.com', 
      'himawarishimizu01@gmail.com',
      '03shimizu@gmail.com'
    ];

    if (problematicEmails.includes(email)) {
      try {
        await prisma.user.delete({
          where: { email }
        });
        console.log(`Deleted problematic user: ${email}`);
      } catch (deleteError) {
        console.log(`User ${email} not found or already deleted`);
      }
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, password: true },
    });

    if (existingUser && !existingUser.password) {
      const hashedPassword = await hashPassword(password);
      const updated = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          password: hashedPassword,
          name: existingUser.name || name || email.split('@')[0],
        },
        select: { id: true, email: true, name: true },
      });

      return NextResponse.json(
        {
          message: '既存アカウントにパスワードを設定しました。ログインできます。',
          user: { id: updated.id, email: updated.email, name: updated.name },
        },
        { status: 200 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に登録されています' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const verificationToken = uuidv4();
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        verificationToken,
        tokenExpiry,
        emailVerified: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    try {
      await sendVerificationEmail(
        user.email,
        user.name || 'ユーザー',
        verificationToken
      );
    } catch (emailError) {
      console.error('確認メール送信エラー:', emailError);
      return NextResponse.json(
        { 
          message: '登録は完了しましたが、確認メールの送信に失敗しました。',
          user: { id: user.id, email: user.email, name: user.name },
          warning: 'メール送信に失敗しました。後ほど再送信してください。'
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { 
        message: '仮登録が完了しました。確認メールをご確認ください。',
        user: { id: user.id, email: user.email, name: user.name },
        requiresEmailVerification: true
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { 
        error: '登録処理中にエラーが発生しました',
        details: error.message
      },
      { status: 500 }
    );
  }
}