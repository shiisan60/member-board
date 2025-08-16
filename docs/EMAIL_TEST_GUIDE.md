# メール設定テストガイド

## 📋 テスト実行手順

### 1. 環境変数の設定確認

まず、必要な環境変数が正しく設定されているか確認します。

```bash
# 設定確認スクリプトの実行
node scripts/test-email-config.js
```

**確認項目:**
- ✅ 必須項目がすべて設定されている
- ✅ メールアドレスが正しい形式
- ✅ ポート番号と暗号化設定が一致している

### 2. SMTP接続テスト

SMTPサーバーへの接続を確認します。

```bash
# 接続テストのみ
node scripts/test-smtp-connection.js

# テストメール送信付き
node scripts/test-smtp-connection.js your-email@example.com
```

**成功時の表示:**
```
✅ SMTP接続成功！
✅ 認証成功
✅ メール送信可能な状態です
```

### 3. APIエンドポイントテスト

開発サーバーを起動して、APIエンドポイント経由でテストします。

```bash
# 開発サーバー起動
npm run dev
```

#### 3-1. 環境変数確認
```bash
curl http://localhost:3000/api/test-email?type=config
```

**レスポンス例:**
```json
{
  "success": true,
  "config": {
    "host": "your-domain.sakura.ne.jp",
    "port": "587",
    "secure": "false",
    "user": "nor***",
    "from": "noreply@bubunene.com",
    "admin": "admin@bubunene.com",
    "support": "support@bubunene.com",
    "postmaster": "postmaster@bubunene.com"
  },
  "missing": []
}
```

#### 3-2. SMTP接続確認
```bash
curl http://localhost:3000/api/test-email?type=connection
```

**レスポンス例:**
```json
{
  "success": true,
  "message": "Email server is connected and ready",
  "config": {
    "host": "your-domain.sakura.ne.jp",
    "port": "587",
    "secure": "false",
    "user": "noreply@bubunene.com"
  }
}
```

#### 3-3. テストメール送信
```bash
curl "http://localhost:3000/api/test-email?type=send&email=test@example.com"
```

**レスポンス例:**
```json
{
  "success": true,
  "message": "Test email sent to test@example.com",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### 3-4. 複数アドレステスト
```bash
curl http://localhost:3000/api/test-email?type=multi
```

設定されているadmin、support、postmasterアドレスにテストメールを送信します。

## 🔍 トラブルシューティング

### エラー別対処法

#### 1. 認証エラー (EAUTH)
```
❌ 認証エラー: ユーザー名またはパスワードが正しくありません
```

**対処法:**
- メールアドレス全体をユーザー名として使用（例: `noreply@bubunene.com`）
- パスワードを再確認（さくらのコントロールパネルで再設定）
- メールアカウントが有効か確認

#### 2. 接続エラー (ECONNECTION)
```
❌ 接続エラー: サーバーに接続できません
```

**対処法:**
- サーバー名を確認（例: `your-domain.sakura.ne.jp`）
- ポート番号を確認（587または465）
- ファイアウォール設定を確認

#### 3. タイムアウト (ETIMEDOUT)
```
❌ タイムアウト: サーバーからの応答がありません
```

**対処法:**
- ネットワーク接続を確認
- サーバー名とポート番号の組み合わせを確認
- プロキシ設定を確認

#### 4. 環境変数未設定
```
❌ Missing environment variables: ["EMAIL_HOST", "EMAIL_USER"]
```

**対処法:**
1. `.env`ファイルを作成
2. `.env.sakura.example`を参考に必要な値を設定
3. サーバーを再起動

## 📝 チェックリスト

### 初期設定
- [ ] `.env`ファイルを作成
- [ ] さくらのコントロールパネルでメールアドレスを作成
- [ ] 環境変数に正しい値を設定

### テスト項目
- [ ] 環境変数の設定確認 (`node scripts/test-email-config.js`)
- [ ] SMTP接続テスト (`node scripts/test-smtp-connection.js`)
- [ ] API経由の接続テスト (`/api/test-email?type=connection`)
- [ ] テストメール送信 (`/api/test-email?type=send&email=...`)

### セキュリティ確認
- [ ] パスワードは16文字以上の強力なものを使用
- [ ] `.env`ファイルは`.gitignore`に含まれている
- [ ] 本番環境では`EMAIL_SECURE`を適切に設定
- [ ] SPFレコードを設定（本番環境）

## 🚀 本番環境への移行

1. **環境変数の更新**
   ```bash
   NODE_ENV="production"
   NEXTAUTH_URL="https://forum.bubunene.com"
   ```

2. **DNSレコード設定**
   ```
   TXT: v=spf1 include:_spf.sakura.ne.jp ~all
   ```

3. **セキュリティ強化**
   - `tls.rejectUnauthorized`を`true`に変更
   - 強力なパスワードを使用
   - 送信ログの監視を設定

## 📞 サポート

問題が解決しない場合:

1. **さくらインターネットサポート**
   - URL: https://help.sakura.ad.jp/
   - 電話: 0120-977-080（平日10:00-18:00）

2. **ログ確認**
   ```bash
   # アプリケーションログ
   npm run dev
   
   # 詳細なSMTPデバッグ
   node scripts/test-smtp-connection.js
   ```