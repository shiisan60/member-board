import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('=== MINIMAL REGISTER START ===');
    
    const { email, password, name } = await request.json();
    console.log('Request received for:', email);

    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Force delete problematic users
    const problematicEmails = [
      '03shimizutaka@gmail.com',
      'himawarishimizu3d@gmail.com', 
      'himawarishimizu01@gmail.com',
      '03shimizu@gmail.com'
    ];

    if (problematicEmails.includes(email)) {
      try {
        console.log('Deleting problematic user:', email);
        await prisma.user.delete({ where: { email } });
        console.log('Successfully deleted:', email);
      } catch (e) {
        console.log('Delete failed or user not found:', email);
      }
    }

    // Check for existing user
    console.log('Checking for existing user...');
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true }
    });

    if (existingUser) {
      console.log('User already exists:', email);
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Create user with minimal data
    console.log('Creating new user...');
    const user = await prisma.user.create({
      data: {
        email,
        password: password, // Plain text for testing - NOT SECURE
        name: name || email.split('@')[0],
        verificationToken: uuidv4(),
        tokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
        emailVerified: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    console.log('User created successfully:', user);
    console.log('=== MINIMAL REGISTER SUCCESS ===');

    return NextResponse.json({
      message: 'Registration successful (minimal)',
      user: user,
      note: 'Password stored as plain text for testing - NOT SECURE'
    }, { status: 201 });

  } catch (error: any) {
    console.error('=== MINIMAL REGISTER ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);

    return NextResponse.json({
      error: 'Registration failed',
      details: error.message,
      code: error.code
    }, { status: 500 });
  }
}