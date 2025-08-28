# Vercel環境変数設定リスト

## 必須の環境変数

以下の環境変数をVercelダッシュボードで設定してください：

### 1. データベース設定

```
Key: DATABASE_PROVIDER
Value: postgresql
```

```
Key: DATABASE_URL  
Value: @POSTGRES_PRISMA_URL
```
（注：@を付けることでVercel Postgresの環境変数を参照）

### 2. 認証設定

```
Key: NEXTAUTH_URL
Value: https://member-board-week2.vercel.app
```

```
Key: NEXTAUTH_SECRET
Value: jvgP7cCa+7T0tlVY6MmTaKVRCJOVtV6covVWvjtYCwM=
```

```
Key: JWT_SECRET
Value: super-secret-jwt-key-for-development-only-change-in-production
```

### 3. 環境設定

```
Key: NODE_ENV
Value: production
```

## オプションの環境変数

### メール設定（必要に応じて）

```
Key: EMAIL_HOST
Value: bubunene.sakura.ne.jp
```

```
Key: EMAIL_PORT
Value: 587
```

```
Key: EMAIL_SECURE
Value: false
```

```
Key: EMAIL_USER
Value: admin@bubunene.com
```

```
Key: EMAIL_PASS
Value: [実際のパスワード]
```

```
Key: EMAIL_FROM
Value: admin@bubunene.com
```

```
Key: EMAIL_FROM_NAME
Value: Member Board
```

## 設定手順

1. Vercelダッシュボードにログイン
2. プロジェクトを選択
3. Settings → Environment Variables
4. 上記の環境変数を一つずつ追加
5. 「Save」をクリック
6. Redeployを実行

## 重要な注意事項

- DATABASE_PROVIDERを「postgresql」に設定することが重要
- DATABASE_URLは@POSTGRES_PRISMA_URLとして、Vercel Postgresの環境変数を参照
- Vercel Postgresを先に作成してから環境変数を設定してください