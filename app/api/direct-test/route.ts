import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // すべての環境変数を完全に表示（デバッグ用）
    const allEnv = Object.keys(process.env)
      .filter(key => 
        key.includes('DB_URL') || 
        key.includes('DATABASE') || 
        key.includes('POSTGRES')
      )
      .reduce((obj, key) => {
        // 値も表示（本番では削除する必要があります）
        obj[key] = process.env[key]?.substring(0, 50) + '...';
        return obj;
      }, {} as any);

    return NextResponse.json({
      success: true,
      allDbEnvVars: allEnv,
      totalEnvVarsFound: Object.keys(allEnv).length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}