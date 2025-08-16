# DKIM設定状況と設定手順

## 現在の状況

### DNSレコード確認結果
- **DKIMレコード**: ❌ 未設定
- **SPFレコード**: ❌ 未設定  
- **DMARCレコード**: ❌ 未設定

現在、bubunene.comドメインにDKIM、SPF、DMARCレコードが設定されていません。

## さくらインターネットでのDKIM設定手順

### 1. さくらのコントロールパネルでDKIM有効化

1. [さくらのコントロールパネル](https://secure.sakura.ad.jp/rs/cp/)にログイン
2. 「メール」→「メール一覧」を選択
3. 対象ドメイン（bubunene.com）の「設定」をクリック
4. 「送信ドメイン認証」タブを選択
5. 「DKIM署名」を「利用する」に設定

### 2. DKIM公開鍵の取得

さくらインターネットでDKIMを有効にすると、以下の情報が表示されます：
- **セレクタ名**: 通常 `sakuramail` 
- **公開鍵**: 長い文字列が表示される

### 3. DNSレコードの設定

#### さくらのドメインコントロールパネルで設定する場合

1. [ドメインコントロールパネル](https://secure.sakura.ad.jp/domain/)にログイン
2. 対象ドメインの「ゾーン編集」をクリック
3. 以下のレコードを追加：

**DKIMレコード**
```
種別: TXT
名前: sakuramail._domainkey
データ: v=DKIM1; k=rsa; p=[公開鍵をここに貼り付け]
```

**SPFレコード**
```
種別: TXT
名前: @（またはbubunene.com）
データ: v=spf1 include:_spf.sakura.ne.jp ~all
```

**DMARCレコード**（オプション）
```
種別: TXT
名前: _dmarc
データ: v=DMARC1; p=none; rua=mailto:admin@bubunene.com
```

### 4. 設定の反映確認

DNSレコードの反映には通常1〜24時間かかります。

## 確認方法

### テストスクリプトの実行

```bash
# DKIMテストスクリプトを実行
npx tsx scripts/test-dkim.ts
```

### 手動確認コマンド

```bash
# DKIMレコード確認
dig TXT sakuramail._domainkey.bubunene.com

# SPFレコード確認
dig TXT bubunene.com | grep spf

# DMARCレコード確認  
dig TXT _dmarc.bubunene.com
```

### メールヘッダーでの確認

1. テストメールを送信
2. 受信したメールのヘッダーを確認
3. 以下を確認：
   - `DKIM-Signature:` ヘッダーが存在する
   - `Authentication-Results:` に `dkim=pass` が表示される

## トラブルシューティング

### DKIMレコードが見つからない場合
- DNS反映待ち（最大24時間）
- セレクタ名の確認（sakuramailが正しいか）
- ドメイン名の確認

### メール送信時にDKIM署名されない場合
- さくらコントロールパネルでDKIMが有効になっているか確認
- SMTPサーバーがbubunene.sakura.ne.jpであることを確認

### DKIM検証が失敗する場合  
- 公開鍵が正しくDNSに設定されているか確認
- From:アドレスのドメインとDKIMドメインが一致しているか確認

## 参考リンク

- [さくらインターネット DKIM設定マニュアル](https://help.sakura.ad.jp/mail/2156/)
- [Mail-Tester（DKIM検証ツール）](https://www.mail-tester.com/)
- [MX Toolbox DKIM Validator](https://mxtoolbox.com/dkim.aspx)