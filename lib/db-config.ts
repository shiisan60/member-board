// データベース設定のヘルパー
// Vercel環境でDB_URLをDATABASE_URLにマッピング

export function initDatabaseConfig() {
  // Vercel/Neonの環境変数マッピング
  // DB_URL_POOLEDまたはDB_URL_NONPOOLEDが設定されている場合
  if (!process.env.DATABASE_URL) {
    if (process.env.DB_URL_POOLED) {
      console.log('[DB Config] Mapping DB_URL_POOLED to DATABASE_URL');
      process.env.DATABASE_URL = process.env.DB_URL_POOLED;
    } else if (process.env.DB_URL_NONPOOLED) {
      console.log('[DB Config] Mapping DB_URL_NONPOOLED to DATABASE_URL');
      process.env.DATABASE_URL = process.env.DB_URL_NONPOOLED;
    } else if (process.env.DB_URL) {
      console.log('[DB Config] Mapping DB_URL to DATABASE_URL');
      process.env.DATABASE_URL = process.env.DB_URL;
    }
  }
  
  // デバッグログ（本番環境でも一時的に出力）
  console.log('[DB Config] Environment variables:');
  console.log('  DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
  console.log('  DB_URL:', process.env.DB_URL ? 'Set' : 'Not set');
  console.log('  DB_URL_POOLED:', process.env.DB_URL_POOLED ? 'Set' : 'Not set');
  console.log('  DB_URL_NONPOOLED:', process.env.DB_URL_NONPOOLED ? 'Set' : 'Not set');
  
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