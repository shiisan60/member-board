# メール送信設定ガイド

## 概要
Member Boardアプリケーションは、ユーザー登録時のメール認証、パスワードリセット、通知などにメール送信機能を使用します。本番環境（Vercel）でメール送信を有効にするための設定手順を説明します。

## 必要な環境変数

### 必須設定
```bash
EMAIL_HOST=smtp.gmail.com        # SMTPサーバーホスト
EMAIL_PORT=587                   # SMTPポート番号
EMAIL_SECURE=false                # TLS/SSL設定（587の場合false）
EMAIL_USER=your-email@gmail.com  # 認証用メールアドレス
EMAIL_PASS=your-app-password     # アプリパスワード（通常パスワード不可）
EMAIL_FROM=your-email@gmail.com  # 送信元メールアドレス
EMAIL_FROM_NAME=Member Board      # 送信者名
EMAIL_ADMIN=admin@example.com    # 管理者メールアドレス
```

### オプション設定（フォールバック用）
```bash
# SendGrid（代替プロバイダー）
SENDGRID_API_KEY=your-sendgrid-api-key

# AWS SES（代替プロバイダー）
AWS_SES_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

## Gmail設定手順

### 1. Googleアカウントの2段階認証を有効化
1. [Googleアカウント設定](https://myaccount.google.com/security)にアクセス
2. 「セキュリティ」→「2段階認証プロセス」を有効化

### 2. アプリパスワードの生成
1. [アプリパスワード設定](https://myaccount.google.com/apppasswords)にアクセス
2. 「アプリを選択」→「その他（カスタム名）」を選択
3. 「Member Board」など識別しやすい名前を入力
4. 生成された16文字のパスワードをコピー（スペースは不要）

### 3. ローカル環境での設定
`.env.local`ファイルに以下を追加：
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=xxxx-xxxx-xxxx-xxxx  # アプリパスワード（スペースなし）
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Member Board
EMAIL_ADMIN=your-email@gmail.com
```

## Vercel本番環境への設定

### 方法1: 自動設定スクリプト（推奨）

1. ローカル環境でメール設定を`.env.local`に記載
2. 以下のコマンドを実行：
```bash
npm run setup:vercel:email
```
3. プロンプトに従って設定を完了

### 方法2: Vercelダッシュボードから手動設定

1. [Vercelダッシュボード](https://vercel.com/dashboard)にアクセス
2. プロジェクトを選択
3. Settings → Environment Variables
4. 以下の変数を追加：
   - 各環境変数を「Add New」で追加
   - Environment: Production を選択
   - Encrypted にチェック（パスワード等の機密情報）
5. 「Save」をクリック

### 方法3: Vercel CLIから設定

```bash
# Vercel CLIのインストール（未インストールの場合）
npm i -g vercel

# ログイン
vercel login

# 環境変数の設定（例：Gmail設定）
vercel env add EMAIL_HOST production
vercel env add EMAIL_PORT production
vercel env add EMAIL_USER production
vercel env add EMAIL_PASS production
vercel env add EMAIL_FROM production
vercel env add EMAIL_FROM_NAME production
vercel env add EMAIL_ADMIN production

# 再デプロイ
vercel --prod
```

## メール送信のテスト

### 1. ヘルスチェック
```bash
# 本番環境
curl https://member-board-week2.vercel.app/api/email/health

# ローカル環境
curl http://localhost:3000/api/email/health
```

### 2. テストメール送信
```bash
# ローカル環境でテスト
npm run test:email

# APIエンドポイントから直接テスト
curl -X POST https://member-board-week2.vercel.app/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "type": "simple"}'
```

## トラブルシューティング

### よくある問題と解決方法

#### 1. "Email configuration missing" エラー
- **原因**: 環境変数が設定されていない
- **解決**: Vercelダッシュボードで環境変数を確認し、必要な変数を追加

#### 2. "Invalid login: 535-5.7.8 Username and Password not accepted"
- **原因**: Gmailの通常パスワードを使用している
- **解決**: アプリパスワードを生成して使用

#### 3. "Connection timeout"
- **原因**: ファイアウォールやネットワーク制限
- **解決**: 
  - SendGridやAWS SESなど代替プロバイダーを設定
  - ポート465（SSL）を試す

#### 4. メールが届かない（エラーなし）
- **原因**: メールがスパムフォルダに振り分けられている
- **解決**: 
  - スパムフォルダを確認
  - SPF/DKIM設定を追加（独自ドメインの場合）

### デバッグ用コマンド

```bash
# 設定確認
npm run test:email:config

# SMTP接続テスト
npm run test:email:smtp

# 本番環境の環境変数確認
vercel env ls production
```

## セキュリティベストプラクティス

1. **アプリパスワードの使用**: Gmailの通常パスワードは使用しない
2. **環境変数の暗号化**: Vercelで`Encrypted`オプションを有効化
3. **最小権限の原則**: メール送信専用のアカウントを作成
4. **定期的な更新**: アプリパスワードを定期的に更新
5. **監視**: メール送信ログを定期的に確認

## 代替メールサービスの設定

### SendGrid
1. [SendGrid](https://sendgrid.com/)でアカウント作成
2. API Keyを生成
3. 環境変数に追加：
```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
```

### AWS SES
1. AWS ConsoleでSESを有効化
2. メールアドレスまたはドメインを検証
3. IAMユーザーを作成し、SES送信権限を付与
4. 環境変数に追加：
```bash
AWS_SES_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## サポート

問題が解決しない場合は、以下の情報と共にイシューを作成してください：
- エラーメッセージの全文
- 使用しているメールプロバイダー
- `/api/email/health`エンドポイントの応答
- 関連するログ