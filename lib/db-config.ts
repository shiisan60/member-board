// データベース設定のヘルパー
// Vercel環境でDB_URLをDATABASE_URLにマッピング

export function initDatabaseConfig() {
  // DB_URLが設定されていてDATABASE_URLが未設定の場合
  if (process.env.DB_URL && !process.env.DATABASE_URL) {
    console.log('[DB Config] Mapping DB_URL to DATABASE_URL');
    process.env.DATABASE_URL = process.env.DB_URL;
  }
  
  // デバッグログ（本番環境でも一時的に出力）
  console.log('[DB Config] Environment variables:');
  console.log('  DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
  console.log('  DB_URL:', process.env.DB_URL ? 'Set' : 'Not set');
  
  // DATABASE_URLの検証
  if (!process.env.DATABASE_URL) {
    console.error('[DB Config] WARNING: DATABASE_URL is not set!');
    
    // フォールバック: ローカル開発用のSQLite
    if (process.env.NODE_ENV === 'development') {
      console.log('[DB Config] Using local SQLite database for development');
      process.env.DATABASE_URL = 'file:./dev.db';
    }
  } else {
    // URLの形式を確認
    const url = process.env.DATABASE_URL;
    if (url.startsWith('postgresql://') || url.startsWith('postgres://')) {
      console.log('[DB Config] PostgreSQL database configured');
    } else if (url.startsWith('file:')) {
      console.log('[DB Config] SQLite database configured');
    } else {
      console.warn('[DB Config] Unknown database URL format');
    }
  }
}

// 自動初期化
initDatabaseConfig();