# さくらインターネット DKIM完全設定ガイド

## 📋 前提条件

- さくらインターネットのレンタルサーバー契約
- 独自ドメインの管理権限
- さくらのコントロールパネルへのアクセス権限

## 🔐 DKIM設定の全体像

DKIMは以下の3つの要素で構成されます：

1. **秘密鍵** - メールサーバー側で保管（さくら側で自動生成）
2. **公開鍵** - DNSレコードとして公開
3. **DKIM署名** - 送信メールに自動付与

## 📝 Step 1: さくらコントロールパネルでDKIM有効化

### 1.1 コントロールパネルにログイン
```
URL: https://secure.sakura.ad.jp/rs/cp/
```

### 1.2 メール設定画面へ移動
1. 左メニューから「メール」を選択
2. 「メール一覧」をクリック
3. 対象ドメイン（example.com）の「設定」ボタンをクリック

### 1.3 送信ドメイン認証の設定
1. 「送信ドメイン認証」タブを選択
2. DKIM署名の設定：
   - **DKIM署名**: 「利用する」を選択
   - **署名アルゴリズム**: RSA-SHA256（推奨）
   - **セレクタ名**: `sakuramail`（デフォルト）
3. 「保存」をクリック

### 1.4 公開鍵の取得
保存後、以下の情報が表示されます：
```
セレクタ: sakuramail
公開鍵: MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...（長い文字列）
```

この公開鍵をメモしておきます。

## 📝 Step 2: DNSレコードの設定

### 2.1 さくらのドメインコントロールパネル

さくらでドメインも管理している場合：

1. [ドメインコントロールパネル](https://secure.sakura.ad.jp/domain/)にログイン
2. 対象ドメインの「ゾーン編集」をクリック
3. 以下のレコードを追加：

#### DKIMレコード
```
種別: TXT
名前: sakuramail._domainkey
データ: v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...（取得した公開鍵）
TTL: 3600
```

#### SPFレコード（推奨）
```
種別: TXT
名前: @ （ルートドメイン）
データ: v=spf1 include:_spf.sakura.ne.jp ~all
TTL: 3600
```

#### DMARCレコード（推奨）
```
種別: TXT
名前: _dmarc
データ: v=DMARC1; p=none; rua=mailto:postmaster@example.com; ruf=mailto:postmaster@example.com; pct=100
TTL: 3600
```

### 2.2 他社DNSサービスの場合

#### Cloudflareの例
```bash
# DKIMレコード
Type: TXT
Name: sakuramail._domainkey
Content: v=DKIM1; k=rsa; p=[公開鍵]
TTL: Auto

# SPFレコード
Type: TXT
Name: @
Content: v=spf1 include:_spf.sakura.ne.jp ~all
TTL: Auto

# DMARCレコード
Type: TXT
Name: _dmarc
Content: v=DMARC1; p=none; rua=mailto:postmaster@example.com
TTL: Auto
```

#### Route53の例
```json
{
  "Name": "sakuramail._domainkey.example.com",
  "Type": "TXT",
  "TTL": 3600,
  "ResourceRecords": [
    {
      "Value": "\"v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...\""
    }
  ]
}
```

## 📝 Step 3: メールサーバー設定の確認

### 3.1 SMTP設定
```env
# さくらインターネットのSMTP設定
SMTP_HOST=example.sakura.ne.jp  # あなたのサーバー名
SMTP_PORT=587
SMTP_SECURE=STARTTLS
SMTP_USER=info@example.com      # メールアドレス
SMTP_PASS=your-password          # メールパスワード
```

### 3.2 送信元アドレスの設定
```javascript
// 送信元メールアドレスがDKIM設定したドメインと一致することを確認
const mailOptions = {
  from: 'noreply@example.com',  // DKIMを設定したドメイン
  to: recipient,
  subject: subject,
  html: content
};
```

## 🔍 Step 4: 設定の検証

### 4.1 DNS反映の確認（設定後1-24時間待つ）

```bash
# DKIMレコードの確認
dig TXT sakuramail._domainkey.example.com +short

# 期待される出力
"v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC..."

# SPFレコードの確認
dig TXT example.com +short | grep spf

# DMARCレコードの確認
dig TXT _dmarc.example.com +short
```

### 4.2 オンライン検証ツール

#### Mail-Tester（推奨）
1. https://www.mail-tester.com/ にアクセス
2. 表示されたメールアドレスにテストメール送信
3. スコアとDKIM状態を確認

#### DKIMValidator
1. https://dkimvalidator.com/ にアクセス
2. 提供されたアドレスにメール送信
3. DKIM署名の詳細を確認

#### MX Toolbox
1. https://mxtoolbox.com/SuperTool.aspx にアクセス
2. `dkim:sakuramail:example.com` を入力
3. DKIMレコードの検証結果を確認

### 4.3 メールヘッダーでの確認

Gmailに送信してヘッダーを確認：

1. テストメールをGmailに送信
2. メールを開く → 3点メニュー → 「メッセージのソースを表示」
3. 以下を確認：

```
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed;
        d=example.com; s=sakuramail;
        h=date:from:to:subject:message-id;
        bh=abcdef123456...;
        b=SIGNATURE_HERE...

Authentication-Results: mx.google.com;
       dkim=pass header.i=@example.com header.s=sakuramail header.b=SIGNATURE;
       spf=pass (google.com: domain of noreply@example.com designates xxx.xxx.xxx.xxx as permitted sender);
       dmarc=pass (p=NONE sp=NONE dis=NONE) header.from=example.com
```

## ⚙️ Step 5: アプリケーション設定

### 5.1 Node.js (Nodemailer)の例

```javascript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: 'example.sakura.ne.jp',
  port: 587,
  secure: false,
  auth: {
    user: 'info@example.com',
    pass: process.env.SMTP_PASSWORD
  },
  // DKIMはサーバー側で自動付与されるため、追加設定不要
});

// メール送信
await transporter.sendMail({
  from: '"Your Service" <noreply@example.com>',
  to: 'user@gmail.com',
  subject: 'Test Email',
  html: '<p>This email should have DKIM signature</p>'
});
```

### 5.2 環境変数の設定

`.env`ファイル：
```env
# さくらインターネット メール設定
MAIL_DOMAIN=example.com
MAIL_HOST=example.sakura.ne.jp
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=info@example.com
MAIL_PASS=your-password
MAIL_FROM=noreply@example.com
MAIL_FROM_NAME=Your Service Name

# DKIM設定情報（参照用）
DKIM_SELECTOR=sakuramail
DKIM_ENABLED=true
```

## 🔧 トラブルシューティング

### 問題1: DKIMレコードが見つからない
```bash
# 確認コマンド
nslookup -type=TXT sakuramail._domainkey.example.com

# 原因と対策
- DNS反映待ち（最大24時間）
- レコード名の誤り → sakuramail._domainkey を確認
- ドメイン名の誤り → example.com を確認
```

### 問題2: DKIM署名が付与されない
```bash
# 確認事項
1. さくらコントロールパネルでDKIMが「利用する」になっているか
2. 送信元メールアドレスのドメインが正しいか
3. SMTPサーバーが正しいさくらのサーバーか
```

### 問題3: DKIM検証が失敗する（dkim=fail）
```bash
# 確認事項
1. 公開鍵が正しくDNSに設定されているか
2. From:ヘッダーのドメインとDKIMドメインが一致しているか
3. メール本文が改変されていないか（転送時など）
```

### 問題4: SPF/DMARCも失敗する
```bash
# SPF確認
dig TXT example.com | grep spf
# → v=spf1 include:_spf.sakura.ne.jp ~all が設定されているか

# DMARC確認
dig TXT _dmarc.example.com
# → v=DMARC1; p=none; ... が設定されているか
```

## 📊 設定後のベストプラクティス

### 1. 定期的な監視
- DMARCレポートの確認（rua/rufで指定したアドレス）
- メール配信率の監視
- ブラックリストチェック

### 2. 段階的なDMARC強化
```
初期: p=none    # 監視のみ
3ヶ月後: p=quarantine  # 疑わしいメールを隔離
6ヶ月後: p=reject      # 不正メールを拒否
```

### 3. セキュリティの維持
- DKIMキーの定期的な更新（年1回推奨）
- SPFレコードの見直し
- 送信IPアドレスの管理

## 📚 参考リンク

- [さくらインターネット公式マニュアル - 送信ドメイン認証](https://help.sakura.ad.jp/mail/2156/)
- [DKIM.org - DomainKeys Identified Mail](http://www.dkim.org/)
- [Google Postmaster Tools](https://postmaster.google.com/)
- [Microsoft SNDS](https://sendersupport.olc.protection.outlook.com/snds/)

## 🎯 チェックリスト

- [ ] さくらコントロールパネルでDKIM有効化
- [ ] 公開鍵を取得
- [ ] DKIMレコードをDNSに追加
- [ ] SPFレコードをDNSに追加
- [ ] DMARCレコードをDNSに追加
- [ ] DNS反映を確認（1-24時間待つ）
- [ ] テストメール送信
- [ ] Mail-Testerでスコア確認
- [ ] Gmailでヘッダー確認
- [ ] 本番環境への適用