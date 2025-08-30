import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('=== REGISTRATION DEBUG START ===');
    const { email, password, name } = await request.json();
    console.log('Request data:', { email: email, name: name, hasPassword: !!password });

    // Basic validation
    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json(
        { error: 'メールアドレスとパスワードは必須です' },
        { status: 400 }
      );
    }

    console.log('Checking existing user...');
    let existingUser;
    try {
      existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, name: true },
      });
      console.log('Existing user:', existingUser);
    } catch (findError) {
      console.log('Error finding user:', findError);
    }

    if (existingUser) {
      console.log('User already exists');
      return NextResponse.json(
        { error: 'このメールアドレスは既に登録されています' },
        { status: 400 }
      );
    }

    console.log('Hashing password...');
    const hashedPassword = await hashPassword(password);
    console.log('Password hashed successfully');

    console.log('Generating verification token...');
    const verificationToken = uuidv4();
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24);
    console.log('Token generated:', verificationToken);

    console.log('Creating user...');
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
    console.log('User created:', user);

    console.log('=== REGISTRATION DEBUG SUCCESS ===');
    return NextResponse.json(
      { 
        message: '仮登録が完了しました（デバッグモード）',
        user: user,
        debug: {
          verificationToken,
          tokenExpiry: tokenExpiry.toISOString()
        }
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('=== REGISTRATION DEBUG ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    
    return NextResponse.json(
      { 
        error: '登録処理中にエラーが発生しました',
        debug: {
          message: error.message,
          code: error.code,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
          prismaError: error.code ? 'Prisma error detected' : 'Not a Prisma error'
        }
      },
      { status: 500 }
    );
  }
}