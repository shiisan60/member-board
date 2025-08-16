# さくらインターネット メール設定ガイド

## 1. メールアドレス作成手順

### コントロールパネルでの作業

1. **ログイン**
   - URL: https://secure.sakura.ad.jp/rs/cp/
   - 会員IDとパスワードでログイン

2. **メールアドレスの作成**
   ```
   メール → メールアドレスの管理 → 新規追加
   ```

3. **必要なメールアドレス一覧**

   | アドレス | 用途 | 優先度 | パスワード強度 |
   |---------|------|--------|-------------|
   | **admin@bubunene.com** | 管理者用（システム通知・重要な連絡） | 必須 | 強力（16文字以上） |
   | **noreply@bubunene.com** | 自動送信用（パスワードリセット・確認メール） | 必須 | 強力（16文字以上） |
   | **postmaster@bubunene.com** | メールシステム管理（バウンス・エラー通知） | 推奨 | 強力（16文字以上） |
   | **support@bubunene.com** | ユーザーサポート（問い合わせ対応） | 任意 | 強力（16文字以上） |

   **役割説明：**
   - **admin@**: システム管理者が受け取る重要な通知用
   - **noreply@**: ユーザーから返信不要の自動メール送信用
   - **postmaster@**: RFC準拠のメールシステム管理用アドレス
   - **support@**: ユーザーからの問い合わせ受付用

## 2. メールサーバー設定情報

### 初期ドメインの確認方法
```
コントロールパネル → 契約情報 → サーバ情報
初期ドメイン: xxxxx.sakura.ne.jp
```

### 受信設定（IMAP）
| 項目 | 値 |
|-----|-----|
| IMAPサーバー | your-domain.sakura.ne.jp |
| ポート | 993 |
| 暗号化 | SSL/TLS |
| 認証 | 必要 |

### 送信設定（SMTP）
| 項目 | 値 |
|-----|-----|
| SMTPサーバー | your-domain.sakura.ne.jp |
| ポート（STARTTLS） | 587 |
| ポート（SSL/TLS） | 465 |
| 暗号化 | STARTTLS（ポート587）/ SSL/TLS（ポート465） |
| 認証方式 | SMTP AUTH |
| ユーザー名 | メールアドレス全体 |

## 3. 環境変数の設定

`.env`ファイルを以下のように更新：

```bash
# さくらインターネット SMTP設定（送信）
EMAIL_HOST="your-domain.sakura.ne.jp"
EMAIL_PORT="587"
EMAIL_SECURE="false"  # STARTTLSが自動適用

# 送信用メールアドレスと認証情報（noreplyを使用）
EMAIL_USER="noreply@bubunene.com"  # 自動送信用
EMAIL_PASS="設定したパスワード"

# IMAP設定（受信 - 必要に応じて）
# IMAP_HOST="your-domain.sakura.ne.jp"
# IMAP_PORT="993"
# IMAP_SECURE="true"  # SSL/TLS暗号化

# メールアドレス設定
EMAIL_FROM="noreply@bubunene.com"  # システムからの自動送信元
EMAIL_FROM_NAME="Bubunene Forum"
EMAIL_ADMIN="admin@bubunene.com"  # 管理者通知用
EMAIL_SUPPORT="support@bubunene.com"  # サポート用
EMAIL_POSTMASTER="postmaster@bubunene.com"  # メールエラー通知用
```

## 4. 接続テスト

### 開発環境でのテスト

1. **環境変数の確認**
   ```bash
   npm run dev
   ```

2. **接続テスト**
   ```bash
   # メールサーバー接続確認
   curl http://localhost:3000/api/test-email
   
   # テストメール送信
   curl "http://localhost:3000/api/test-email?email=テスト送信先@example.com"
   ```

3. **レスポンス例**
   ```json
   {
     "message": "Test email sent to テスト送信先@example.com"
   }
   ```

## 5. トラブルシューティング

### よくある問題と解決方法

| エラー | 原因 | 解決方法 |
|-------|------|---------|
| Connection refused | サーバー名が間違っている | 初期ドメインを再確認 |
| Authentication failed | パスワードが間違っている | コントロールパネルでパスワード再設定 |
| 550 5.7.1 | 送信制限 | SPF/DKIM設定、または送信数制限確認 |
| Timeout | ポート番号が間違っている | 587または465を確認 |

### さくらインターネット特有の制限

1. **送信数制限**
   - 1時間あたり: 100通程度
   - 1日あたり: 1000通程度
   - プランにより異なる

2. **送信元制限**
   - From アドレスは作成したメールアドレスのみ使用可能
   - なりすまし防止のため厳格

3. **推奨事項**
   - SPFレコードの設定
   - 大量送信の場合は事前にさくらに相談

## 6. 本番環境への移行

1. **環境変数の更新**
   ```bash
   NODE_ENV="production"
   NEXTAUTH_URL="https://forum.bubunene.com"
   NEXTAUTH_SECRET="本番用の安全な値"  # openssl rand -base64 32
   JWT_SECRET="本番用の安全な値"
   ```

2. **DNSレコード設定（推奨）**
   ```
   TXTレコード（SPF）:
   v=spf1 include:_spf.sakura.ne.jp ~all
   ```

3. **監視設定**
   - メール送信エラーの監視
   - 送信数の監視
   - バウンスメールの処理

## 7. メールアドレスの使い分け

### 各アドレスの詳細説明

| アドレス | 使用場面 | 受信設定 | 送信設定 |
|---------|---------|---------|----------|
| **admin@bubunene.com** | ・システムエラー通知<br>・新規ユーザー登録通知<br>・重要なアラート | 必要 | 不要 |
| **noreply@bubunene.com** | ・パスワードリセット<br>・メールアドレス確認<br>・自動通知 | 不要 | 必要 |
| **postmaster@bubunene.com** | ・バウンスメール受信<br>・SPF/DKIMエラー<br>・メール配送エラー | 必要 | 不要 |
| **support@bubunene.com** | ・ユーザー問い合わせ<br>・フィードバック<br>・サポート依頼 | 必要 | 必要 |

## 8. セキュリティ対策

- パスワードは定期的に変更
- 送信ログの保管
- 不正利用の監視
- SSL/TLS通信の使用（ポート587または465）

## サポート

さくらインターネットのサポート：
- URL: https://help.sakura.ad.jp/
- 電話: 0120-977-080（平日10:00-18:00）