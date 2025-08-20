import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    
    // パフォーマンス監視
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // エラー設定
    beforeSend(event, hint) {
      // 個人情報をフィルタリング
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers;
        
        // URLのクエリパラメータから機密情報を削除
        if (event.request.url) {
          const url = new URL(event.request.url);
          url.searchParams.delete('token');
          url.searchParams.delete('key');
          url.searchParams.delete('secret');
          event.request.url = url.toString();
        }
      }
      
      // ユーザー情報のサニタイズ
      if (event.user) {
        event.user = {
          id: event.user.id,
        };
      }
      
      return event;
    },
    
    // 無視するエラー
    ignoreErrors: [
      'ECONNREFUSED',
      'ENOTFOUND',
      'ETIMEDOUT',
      'ECONNRESET',
      'EPIPE',
      'EHOSTUNREACH',
      'EAI_AGAIN',
    ],
    
    // 環境設定
    environment: process.env.NODE_ENV,
    
    // リリース追跡
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    
    // トランザクション名のカスタマイズ
    beforeSendTransaction(event) {
      // 動的ルートのパラメータを削除
      if (event.transaction) {
        event.transaction = event.transaction
          .replace(/\/[a-f0-9-]{36}/gi, '/[id]')
          .replace(/\/\d+/g, '/[id]');
      }
      return event;
    },
  });
}