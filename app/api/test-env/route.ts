import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    env: process.env.NODE_ENV,
    hasDatabase: !!process.env.DATABASE_URL,
    hasNextAuth: !!process.env.NEXTAUTH_SECRET,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    databaseType: process.env.DATABASE_URL?.includes('postgresql') ? 'PostgreSQL' : 
                   process.env.DATABASE_URL?.includes('file:') ? 'SQLite' : 
                   'Unknown',
  });
}