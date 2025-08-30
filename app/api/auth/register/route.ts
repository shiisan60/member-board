import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { checkPasswordStrength, validateEmail } from '@/lib/validators';
import { sendVerificationEmail } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';

// Ensure this route runs on Node.js runtime and is not cached
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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
    let existingUser;
    try {
      existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, name: true, password: true },
      });
    } catch (findError) {
      // 古いCUID形式のIDが原因でクエリが失敗する場合、そのユーザーを削除
      console.log(`Find user failed for ${email}, attempting cleanup...`);
      try {
        await prisma.user.delete({
          where: { email }
        });
        console.log(`✅ Deleted problematic user: ${email}`);
        existingUser = null;
      } catch (deleteError) {
        console.error(`Failed to delete problematic user ${email}:`, deleteError);
        existingUser = null;
      }
    }

    // 既に存在していて、かつパスワード未設定（例: Googleログインで作成）の場合は
    // パスワードを設定して通常ログインできるように更新する
    if (existingUser && !existingUser.password) {
      try {
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
      } catch (updateError) {
        // 更新に失敗した場合、古いユーザーを削除して新規作成を続行
        console.log(`Update failed for ${email}, deleting old user...`);
        try {
          await prisma.user.delete({
            where: { email }
          });
          console.log(`✅ Deleted and will recreate user: ${email}`);
          existingUser = null;
        } catch (deleteError) {
          console.error(`Failed to delete user ${email}:`, deleteError);
        }
      }
    }

    if (existingUser && existingUser.password) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に登録されています' },
        { status: 400 }
      );
    }

    // パスワードをハッシュ化
    const hashedPassword = await hashPassword(password);

    // メール認証用トークンの生成
    const verificationToken = uuidv4();
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24); // 24時間有効

    // ユーザーを作成（emailVerifiedはnullのまま）
    let user;
    try {
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || email.split('@')[0],
          verificationToken,
          tokenExpiry,
          emailVerified: null, // メール未認証状態
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });
    } catch (createError) {
      console.error('User creation failed:', createError);
      // 作成に失敗した場合、既存の問題のあるユーザーを削除して再試行
      try {
        await prisma.user.delete({
          where: { email }
        });
        console.log(`Deleted existing problematic user ${email}, retrying creation...`);
        
        user = await prisma.user.create({
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
        console.log(`✅ Successfully created user after cleanup: ${email}`);
      } catch (retryError) {
        console.error('Retry user creation failed:', retryError);
        throw retryError;
      }
    }

    // 確認メールを送信
    try {
      await sendVerificationEmail(
        user.email,
        user.name || 'ユーザー',
        verificationToken
      );
    } catch (emailError) {
      console.error('確認メール送信エラー:', emailError);
      // メール送信に失敗してもユーザー作成は成功とする
      // ただし、警告メッセージを含める
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
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { 
        error: '登録処理中にエラーが発生しました',
        details: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}