import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json(
    { message: 'ログアウトしました' },
    { status: 200 }
  );

  // クッキーを削除
  response.cookies.delete('token');

  return response;
}