import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'working',
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    hasDatabase: !!process.env.DATABASE_URL,
    databaseType: process.env.DATABASE_URL?.includes('mongodb') ? 'mongodb' : 
                  process.env.DATABASE_URL?.includes('postgresql') ? 'postgresql' : 
                  process.env.DATABASE_URL?.includes('file:') ? 'sqlite' : 'unknown'
  });
}