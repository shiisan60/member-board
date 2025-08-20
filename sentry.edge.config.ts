import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    
    // Edge環境用の設定
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // エラー設定
    beforeSend(event) {
      // Edge環境では制限されたAPIを使用
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers;
      }
      return event;
    },
    
    // 環境設定
    environment: process.env.NODE_ENV,
    
    // リリース追跡
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  });
}