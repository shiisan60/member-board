# Vercel環境変数設定ガイド

## 重要：Vercelではローカルのデータベースファイルは使用できません

Vercelでアプリケーションを動作させるには、外部のデータベースサービスを使用する必要があります。

## 推奨データベースオプション

### 1. Vercel Postgres（推奨）
Vercelダッシュボードから簡単に設定できます：
1. Vercelダッシュボード → Storage → Create Database
2. Postgresを選択
3. 自動的に環境変数が設定されます

### 2. Supabase（無料プランあり）
1. https://supabase.com でアカウント作成
2. 新しいプロジェクトを作成
3. Settings → Database から接続文字列を取得

### 3. Neon Database（無料プランあり）
1. https://neon.tech でアカウント作成
2. データベースを作成
3. 接続文字列を取得

## Vercelで設定する環境変数

以下の環境変数をVercelダッシュボードで設定してください：

```
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
NEXTAUTH_URL=https://member-board-week2.vercel.app
NEXTAUTH_SECRET=jvgP7cCa+7T0tlVY6MmTaKVRCJOVtV6covVWvjtYCwM=
JWT_SECRET=super-secret-jwt-key-for-development-only-change-in-production
NODE_ENV=production

# Google OAuth
GOOGLE_CLIENT_ID=[Your Google Client ID]
GOOGLE_CLIENT_SECRET=[Your Google Client Secret]

# Email設定（オプション）
EMAIL_HOST=bubunene.sakura.ne.jp
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=admin@bubunene.com
EMAIL_PASS=実際のパスワード
EMAIL_FROM=admin@bubunene.com
EMAIL_FROM_NAME=Member Board
```

## セットアップ手順

1. **Vercelダッシュボードにアクセス**
   - https://vercel.com/dashboard
   - プロジェクトを選択

2. **Settings → Environment Variables**
   - 上記の環境変数を追加

3. **データベースのマイグレーション**
   ```bash
   npx prisma migrate deploy
   ```

4. **管理者ユーザーの初期化**
   ```bash
   node scripts/init-admin.js
   ```

5. **再デプロイ**
   - Vercelダッシュボードから「Redeploy」をクリック

## トラブルシューティング

- エラー: "Cannot find module 'bcryptjs'"
  → package.jsonのdependenciesにbcryptjsが含まれているか確認

- エラー: "Database connection failed"
  → DATABASE_URLが正しく設定されているか確認

- ログインできない
  → 管理者ユーザーの初期化スクリプトを実行したか確認