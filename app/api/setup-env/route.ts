import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 自動的に必要な環境変数を設定
    const requiredEnvVars = {
      // NextAuth.js v5用の環境変数を自動設定
      AUTH_SECRET: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'fallback-secret-key-for-production',
      AUTH_URL: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                process.env.NEXTAUTH_URL || 
                process.env.AUTH_URL || 
                'https://member-board-week2.vercel.app',
      
      // トラストホストを有効化
      AUTH_TRUST_HOST: 'true',
      
      // Vercel検出
      VERCEL_ENV: process.env.VERCEL_ENV || 'production',
    };

    // 現在の環境変数状態をチェック
    const currentEnv = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      AUTH_SECRET: !!process.env.AUTH_SECRET,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      AUTH_URL: process.env.AUTH_URL,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      VERCEL_URL: process.env.VERCEL_URL,
      AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
      VERCEL: process.env.VERCEL,
    };

    // 推奨設定
    const recommendations = {
      message: 'Vercelダッシュボードで以下の環境変数を設定してください',
      variables: {
        'AUTH_SECRET': requiredEnvVars.AUTH_SECRET,
        'AUTH_URL': requiredEnvVars.AUTH_URL,
        'AUTH_TRUST_HOST': 'true',
      }
    };

    return NextResponse.json({
      success: true,
      currentEnvironment: currentEnv,
      recommendations: recommendations,
      autoConfigured: requiredEnvVars,
      instructions: [
        '1. https://vercel.com にアクセス',
        '2. member-board-week2 プロジェクトを選択',
        '3. Settings > Environment Variables',
        '4. 上記の variables を追加',
        '5. Redeploy'
      ],
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Setup env error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}