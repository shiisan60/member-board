import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';
import { hashPassword } from '../../lib/auth';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, name } = req.body;
    console.log('Test registration request:', { email, name });

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Delete problematic users first
    const problematicEmails = [
      '03shimizutaka@gmail.com',
      'himawarishimizu3d@gmail.com',
      'himawarishimizu01@gmail.com',
      '03shimizu@gmail.com'
    ];

    if (problematicEmails.includes(email)) {
      try {
        await prisma.user.delete({ where: { email } });
        console.log('Deleted problematic user:', email);
      } catch (e) {
        console.log('User not found or already deleted:', email);
      }
    }

    // Check existing user
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        verificationToken: uuidv4(),
        tokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
        emailVerified: new Date(), // Auto-verify for testing
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    console.log('User created successfully:', user);

    res.status(201).json({
      message: 'Registration successful (test mode)',
      user: user,
      note: 'Email auto-verified for testing'
    });

  } catch (error: any) {
    console.error('Test registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      details: error.message,
      code: error.code
    });
  }
}