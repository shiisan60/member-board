import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    
    // パフォーマンス監視
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // セッション追跡
    autoSessionTracking: true,
    
    // エラー設定
    beforeSend(event, hint) {
      // 個人情報をフィルタリング
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers;
      }
      
      // 開発環境では console.error も出力
      if (process.env.NODE_ENV === 'development') {
        console.error('Sentry Event:', event);
        console.error('Hint:', hint);
      }
      
      return event;
    },
    
    // 無視するエラー
    ignoreErrors: [
      'Network request failed',
      'NetworkError',
      'Failed to fetch',
      'Load failed',
      'AbortError',
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
    ],
    
    // 環境設定
    environment: process.env.NODE_ENV,
    
    // リリース追跡
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    
    // インテグレーション
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Replay設定
    replaysSessionSampleRate: 0.01,
    replaysOnErrorSampleRate: 0.1,
  });
}