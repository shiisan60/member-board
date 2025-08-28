# Vercel Postgres 設定手順（必須）

## 現在の問題
- ローカルのSQLiteデータベースはVercelで使用できません
- admin@example.comでログインできません
- 外部データベースの設定が必要です

## ステップ1: Vercel Postgresの作成

1. **Vercelダッシュボードにログイン**
   https://vercel.com/dashboard

2. **プロジェクトを選択**
   「member-board-week2」をクリック

3. **Storageタブを開く**
   上部メニューから「Storage」をクリック

4. **データベースを作成**
   - 「Create Database」ボタンをクリック
   - 「Postgres」を選択
   - データベース名: `member-board-db`（任意）
   - リージョン: 最寄りのリージョンを選択
   - 「Create」をクリック

## ステップ2: 環境変数の設定

Vercel Postgresを作成すると自動的に以下の環境変数が追加されます：
- POSTGRES_URL
- POSTGRES_PRISMA_URL
- POSTGRES_URL_NON_POOLING
- POSTGRES_USER
- POSTGRES_HOST
- POSTGRES_PASSWORD
- POSTGRES_DATABASE

### 追加で必要な環境変数

1. **Settings → Environment Variables** に移動

2. 以下の環境変数を追加：

```
Key: DATABASE_URL
Value: @POSTGRES_PRISMA_URL
（@を付けることで他の環境変数を参照）

Key: NEXTAUTH_URL
Value: https://member-board-week2.vercel.app

Key: NEXTAUTH_SECRET  
Value: jvgP7cCa+7T0tlVY6MmTaKVRCJOVtV6covVWvjtYCwM=

Key: JWT_SECRET
Value: super-secret-jwt-key-for-development-only-change-in-production

Key: NODE_ENV
Value: production
```

3. **「Save」をクリック**

## ステップ3: 再デプロイ

1. **Deployments**タブに移動
2. 最新のデプロイメントの「...」メニューをクリック
3. 「Redeploy」を選択
4. 「Redeploy」ボタンをクリック

## ステップ4: データベースの初期化

デプロイが完了したら、以下の手順で管理者ユーザーを作成：

### オプション1: Vercel CLIを使用（推奨）

```bash
# Vercel CLIのインストール
npm i -g vercel

# プロジェクトとリンク
vercel link

# 環境変数を取得
vercel env pull .env.production.local

# Prismaスキーマをプッシュ
npx prisma db push

# 管理者ユーザーを作成
node scripts/init-admin.js
```

### オプション2: Vercelの関数を使用

後述のinit-db APIを使用してブラウザから初期化

## ステップ5: 動作確認

1. **デプロイ完了を確認**
   - Vercelダッシュボードで緑色のチェックマーク

2. **データベース接続を確認**
   https://member-board-week2.vercel.app/api/test-env
   ```json
   {
     "env": "production",
     "hasDatabase": true,
     "databaseType": "PostgreSQL"
   }
   ```

3. **ログインテスト**
   - URL: https://member-board-week2.vercel.app/login
   - Email: admin@example.com
   - Password: Admin1234!

## トラブルシューティング

### test-envが404エラー
→ デプロイがまだ完了していません。数分待ってから再度アクセス

### ログインできない
→ データベースの初期化（ステップ4）を実行

### Invalid `prisma` invocationエラー
→ Prismaスキーマがデータベースにプッシュされていません
```bash
npx prisma db push
```

## 代替案: Supabase（無料）

Vercel Postgresが使用できない場合：

1. https://supabase.com でアカウント作成
2. 新規プロジェクト作成
3. Settings → Database → Connection string (URI)をコピー
4. VercelのDATABASE_URLに設定

## サポート

問題が解決しない場合は、以下を確認：
- Vercelのビルドログ
- ブラウザのコンソールエラー
- Vercelの関数ログ（Functions タブ）