# Vercel本番環境セットアップガイド

## 現在の問題
SQLiteデータベース（file:./dev.db）はVercelでは使用できません。
Vercelで動作させるには、外部のデータベースサービスが必要です。

## ステップ1: 環境変数の確認
まず、現在の環境変数設定を確認します：
1. https://member-board-week2.vercel.app/api/test-env にアクセス
2. 表示される情報を確認

## ステップ2: Vercel Postgresのセットアップ（推奨・無料）

### 2-1. Vercel Postgresの作成
1. [Vercelダッシュボード](https://vercel.com/dashboard)にログイン
2. プロジェクト「member-board-week2」を選択
3. 「Storage」タブをクリック
4. 「Create Database」をクリック
5. 「Postgres」を選択
6. データベース名を入力（例：member-board-db）
7. 「Create」をクリック

### 2-2. 自動的に追加される環境変数
Vercel Postgresを作成すると、以下の環境変数が自動的に追加されます：
- POSTGRES_URL
- POSTGRES_PRISMA_URL
- POSTGRES_URL_NON_POOLING
- POSTGRES_USER
- POSTGRES_HOST
- POSTGRES_PASSWORD
- POSTGRES_DATABASE

### 2-3. DATABASE_URLの設定
1. Settings → Environment Variables
2. 「Add New」をクリック
3. 以下を追加：
   - Key: `DATABASE_URL`
   - Value: `@POSTGRES_PRISMA_URL`（@を付けると他の環境変数を参照できます）

## ステップ3: その他の必要な環境変数を追加

Vercelダッシュボード → Settings → Environment Variables で以下を追加：

```
NEXTAUTH_URL=https://member-board-week2.vercel.app
NEXTAUTH_SECRET=jvgP7cCa+7T0tlVY6MmTaKVRCJOVtV6covVWvjtYCwM=
JWT_SECRET=super-secret-jwt-key-for-development-only-change-in-production
NODE_ENV=production

# Google OAuth（オプション）
GOOGLE_CLIENT_ID=[Your Google Client ID]
GOOGLE_CLIENT_SECRET=[Your Google Client Secret]

# メール設定（オプション）
EMAIL_HOST=bubunene.sakura.ne.jp
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=admin@bubunene.com
EMAIL_PASS=[実際のパスワード]
EMAIL_FROM=admin@bubunene.com
EMAIL_FROM_NAME=Member Board
```

## ステップ4: Prismaスキーマの更新

1. ローカルで以下のコマンドを実行：
```bash
git add .
git commit -m "Add test-env API and setup guide"
git push
```

2. Vercelが自動的にデプロイを開始

## ステップ5: データベースマイグレーション

Vercelのデプロイが完了したら：

1. ローカルターミナルで以下を実行：
```bash
# Vercel CLIのインストール（未インストールの場合）
npm i -g vercel

# Vercelプロジェクトとリンク
vercel link

# 本番環境の環境変数を取得
vercel env pull .env.production

# データベースマイグレーション実行
DATABASE_URL=$(grep POSTGRES_PRISMA_URL .env.production | cut -d '=' -f2) npx prisma migrate deploy

# 管理者ユーザーの作成
DATABASE_URL=$(grep POSTGRES_PRISMA_URL .env.production | cut -d '=' -f2) node scripts/init-admin.js
```

## ステップ6: 動作確認

1. https://member-board-week2.vercel.app/api/test-env にアクセス
   - `hasDatabase: true`
   - `databaseType: "PostgreSQL"`
   が表示されることを確認

2. https://member-board-week2.vercel.app/login にアクセス
   - Email: admin@example.com
   - Password: admin123
   でログイン

## トラブルシューティング

### エラー: "Invalid `prisma.user.findUnique()` invocation"
→ データベースマイグレーションが実行されていません。ステップ5を実行してください。

### エラー: "FetchError"
→ 環境変数が正しく設定されていません。ステップ3を確認してください。

### ログインできない
→ 管理者ユーザーが作成されていません。ステップ5の最後のコマンドを実行してください。

## 代替オプション：Supabase（Vercel Postgresが使えない場合）

1. [Supabase](https://supabase.com)でアカウント作成
2. 新しいプロジェクトを作成
3. Settings → Database → Connection string をコピー
4. VercelのDATABASE_URLに設定