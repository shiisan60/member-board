# 📋 本番デプロイチェックリスト

## 事前準備

### 1. MongoDB Atlas設定
- [ ] 本番用クラスターを作成（M10以上推奨）
- [ ] IPホワイトリストにVercelのIPを追加
- [ ] データベースユーザーを作成
- [ ] 接続文字列を取得
- [ ] バックアップ設定を有効化

### 2. 環境変数設定
- [ ] `.env.production.local`ファイルを作成
- [ ] DATABASE_URLを本番用に設定
- [ ] NEXTAUTH_URLを本番ドメインに設定
- [ ] NEXTAUTH_SECRETを強力な値に設定
- [ ] Google OAuth認証情報を本番用に設定
- [ ] メール送信設定を確認

### 3. Google OAuth設定
- [ ] Google Cloud ConsoleでOAuth 2.0クライアントIDを作成
- [ ] 承認済みのJavaScript生成元に本番URLを追加
- [ ] 承認済みのリダイレクトURIに`https://your-domain.com/api/auth/callback/google`を追加

### 4. Vercelアカウント設定
- [ ] Vercelアカウントを作成/ログイン
- [ ] Vercel CLIをインストール（`npm i -g vercel`）
- [ ] `vercel login`でログイン

## デプロイ前チェック

### 5. コード品質
- [ ] `npm run type-check` - 型エラーがないことを確認
- [ ] `npm run lint` - リントエラーがないことを確認
- [ ] `npm run test` - すべてのテストが成功
- [ ] `npm run build` - ビルドが成功

### 6. セキュリティ
- [ ] `npm audit` - 高リスクの脆弱性がないことを確認
- [ ] すべての環境変数が適切に設定されている
- [ ] セキュリティヘッダーが設定されている
- [ ] CSP（Content Security Policy）が適切に設定されている

### 7. デプロイチェック実行
```bash
npm run deploy:check
```

## デプロイ実行

### 8. 初回デプロイ
```bash
# プロジェクトをVercelに接続
vercel

# 本番環境にデプロイ
vercel --prod
```

### 9. Vercel環境変数設定
Vercelダッシュボード（https://vercel.com/dashboard）で：
- [ ] Environment Variablesセクションで全環境変数を追加
- [ ] Production環境用に設定
- [ ] 環境変数を保存

### 10. データベースマイグレーション
```bash
# 本番データベースにスキーマを適用
npm run db:migrate:prod
```

## デプロイ後の確認

### 11. 機能テスト
- [ ] トップページが正常に表示される
- [ ] ユーザー登録が可能
- [ ] ログイン/ログアウトが正常に動作
- [ ] Google OAuth認証が動作
- [ ] メール送信が正常に動作
- [ ] 投稿の作成/編集/削除が可能

### 12. パフォーマンス確認
- [ ] Lighthouse Scoreを確認（目標: 90+）
- [ ] Core Web Vitalsを確認
- [ ] 画像の最適化を確認

### 13. セキュリティ確認
- [ ] HTTPSが有効
- [ ] セキュリティヘッダーが適用されている
- [ ] CSRFトークンが正常に動作
- [ ] Rate Limitingが動作

### 14. 監視設定
- [ ] Vercel Analyticsが有効
- [ ] Sentryエラー監視が動作
- [ ] アラート通知が設定されている

## カスタムドメイン設定（オプション）

### 15. ドメイン設定
- [ ] Vercelダッシュボードでドメインを追加
- [ ] DNSレコードを設定（CNAME or Aレコード）
- [ ] SSL証明書が自動発行される
- [ ] wwwサブドメインのリダイレクト設定

### 16. 最終確認
- [ ] カスタムドメインでアクセス可能
- [ ] HTTPSリダイレクトが動作
- [ ] すべての機能が正常に動作

## トラブルシューティング

### よくある問題と解決方法

1. **ビルドエラー**
   - 環境変数が正しく設定されているか確認
   - `node_modules`を削除して再インストール

2. **データベース接続エラー**
   - MongoDB AtlasのIPホワイトリストを確認
   - 接続文字列が正しいか確認

3. **認証エラー**
   - NEXTAUTH_URLが正しく設定されているか確認
   - Google OAuthのリダイレクトURIを確認

4. **メール送信エラー**
   - メールサービスのAPIキーを確認
   - 送信元メールアドレスのドメイン認証

## サポート

問題が発生した場合：
1. Vercelのログを確認
2. Sentryのエラーレポートを確認
3. `vercel logs`コマンドでログを確認

## 次のステップ

デプロイ成功後：
1. 定期的なバックアップを設定
2. 監視アラートの閾値を調整
3. パフォーマンス最適化を継続
4. セキュリティアップデートを定期的に適用