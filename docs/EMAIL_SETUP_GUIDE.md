# メール送信機能設定ガイド

## 概要

Member Boardのメール送信機能は以下をサポートします：

- ✅ ユーザー登録確認メール
- ✅ パスワードリセットメール  
- ✅ ウェルカムメール
- ✅ 通知メール
- ✅ React EmailによるHTMLテンプレート
- ✅ Gmail/SMTP/SendGrid対応
- ✅ 自動リトライ機能
- ✅ エラーハンドリング

## 1. Gmail設定（推奨）

### 1.1 Googleアカウントでアプリパスワードを生成

1. Googleアカウントにログイン
2. [Googleアカウント管理](https://myaccount.google.com/) → セキュリティ
3. 「2段階認証プロセス」を有効化
4. 「アプリパスワード」を生成
   - アプリ: 「メール」
   - デバイス: 「その他（カスタム名）」→ 「Member Board」

### 1.2 環境変数設定

`.env`ファイルに以下を追加：

```env
# Gmail SMTP設定
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-specific-password"

# 送信者情報
EMAIL_FROM="your-email@gmail.com"
EMAIL_FROM_NAME="Member Board"
EMAIL_ADMIN="your-email@gmail.com"
```

## 2. 開発環境設定

### 2.1 Mailtrap（推奨）

開発環境では[Mailtrap](https://mailtrap.io/)を推奨：

```env
# Mailtrap設定
EMAIL_HOST="sandbox.smtp.mailtrap.io"
EMAIL_PORT="2525"
EMAIL_SECURE="false"
EMAIL_USER="your-mailtrap-user"
EMAIL_PASS="your-mailtrap-password"

EMAIL_FROM="noreply@member-board.dev"
EMAIL_FROM_NAME="Member Board (Dev)"
EMAIL_ADMIN="admin@member-board.dev"
```

### 2.2 MailHog（ローカル開発）

Dockerでローカルメールサーバー：

```bash
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog
```

```env
# MailHog設定
EMAIL_HOST="localhost"
EMAIL_PORT="1025"
EMAIL_SECURE="false"
EMAIL_USER=""
EMAIL_PASS=""

EMAIL_FROM="noreply@localhost"
EMAIL_FROM_NAME="Member Board (Local)"
EMAIL_ADMIN="admin@localhost"
```

## 3. 本番環境設定

### 3.1 SendGrid

```env
# SendGrid設定
EMAIL_HOST="smtp.sendgrid.net"
EMAIL_PORT="587"
EMAIL_SECURE="false"
EMAIL_USER="apikey"
EMAIL_PASS="your-sendgrid-api-key"

EMAIL_FROM="noreply@yourdomain.com"
EMAIL_FROM_NAME="Member Board"
EMAIL_ADMIN="admin@yourdomain.com"
```

### 3.2 Amazon SES

```env
# Amazon SES設定
EMAIL_HOST="email-smtp.us-east-1.amazonaws.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
EMAIL_USER="your-ses-smtp-username"
EMAIL_PASS="your-ses-smtp-password"

EMAIL_FROM="noreply@yourdomain.com"
EMAIL_FROM_NAME="Member Board"
EMAIL_ADMIN="admin@yourdomain.com"
```

## 4. API使用方法

### 4.1 メール送信API

```typescript
// 認証確認メール
const response = await fetch('/api/email/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'verification',
    email: 'user@example.com',
    data: {
      username: 'ユーザー名',
      token: 'verification-token'
    }
  })
});

// パスワードリセットメール
const response = await fetch('/api/email/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'password-reset',
    email: 'user@example.com',
    data: {
      username: 'ユーザー名',
      token: 'reset-token'
    }
  })
});

// ウェルカムメール
const response = await fetch('/api/email/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'welcome',
    email: 'user@example.com',
    data: {
      username: 'ユーザー名'
    }
  })
});

// 通知メール
const response = await fetch('/api/email/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'notification',
    email: 'user@example.com',
    data: {
      username: 'ユーザー名',
      subject: '重要なお知らせ',
      message: 'メッセージ内容',
      actionUrl: 'https://example.com/action',
      actionText: 'アクションボタン'
    }
  })
});
```

### 4.2 接続テスト

```bash
# メール接続テスト
curl http://localhost:3000/api/email/test
```

## 5. ライブラリから直接使用

```typescript
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendNotificationEmail,
  testEmailConnection
} from '@/lib/email';

// 接続テスト
const connectionResult = await testEmailConnection();
console.log(connectionResult); // { success: true }

// 認証メール送信
const result = await sendVerificationEmail(
  'user@example.com',
  'ユーザー名',
  'verification-token'
);

if (result.success) {
  console.log('メール送信成功:', result.messageId);
} else {
  console.error('メール送信失敗:', result.error);
}
```

## 6. 環境変数一覧

| 変数名 | 必須 | 説明 | 例 |
|--------|------|------|-----|
| `EMAIL_HOST` | ✅ | SMTPサーバーホスト | `smtp.gmail.com` |
| `EMAIL_PORT` | ✅ | SMTPポート | `587` |
| `EMAIL_SECURE` | ✅ | SSL/TLS使用 | `false` |
| `EMAIL_USER` | ✅ | SMTP認証ユーザー | `user@gmail.com` |
| `EMAIL_PASS` | ✅ | SMTP認証パスワード | `app-password` |
| `EMAIL_FROM` | ✅ | 送信者メールアドレス | `noreply@example.com` |
| `EMAIL_FROM_NAME` | ❌ | 送信者名 | `Member Board` |
| `EMAIL_ADMIN` | ❌ | 管理者メールアドレス | `admin@example.com` |
| `NEXTAUTH_URL` | ✅ | アプリケーションURL | `http://localhost:3000` |

## 7. トラブルシューティング

### 7.1 接続エラー

```bash
# 接続テスト実行
npm run test:email:config
npm run test:email:smtp
```

### 7.2 Gmail認証エラー

- アプリパスワードが正しく生成されているか確認
- 2段階認証が有効になっているか確認
- `EMAIL_SECURE="false"`になっているか確認

### 7.3 メール送信失敗

1. ログを確認：
   ```bash
   tail -f logs/email.log
   ```

2. 環境変数を確認：
   ```bash
   echo $EMAIL_HOST
   echo $EMAIL_USER
   ```

3. 手動テスト：
   ```bash
   curl -X GET http://localhost:3000/api/email/test
   ```

## 8. セキュリティ注意事項

- 🔒 本番環境では必ず環境変数を使用
- 🔒 メールパスワードは絶対にコミットしない
- 🔒 SMTP認証情報を暗号化して保存
- 🔒 送信レート制限を設定
- 🔒 メール送信ログを監視

## 9. 次のステップ

- [ ] メール送信キューの実装
- [ ] メール配信分析の追加
- [ ] マルチ言語対応
- [ ] メールテンプレートエディター
- [ ] 一括メール送信機能