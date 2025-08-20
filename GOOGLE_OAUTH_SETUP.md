# Google OAuth設定ガイド

## Google Cloud Consoleでの設定手順

1. **Google Cloud Consoleにアクセス**
   - https://console.cloud.google.com/ にアクセス
   - Googleアカウントでログイン

2. **新しいプロジェクトを作成（または既存のプロジェクトを選択）**
   - 上部のプロジェクトセレクターから「新しいプロジェクト」を選択
   - プロジェクト名を入力して作成

3. **OAuth同意画面の設定**
   - 左側メニューから「APIとサービス」→「OAuth同意画面」を選択
   - ユーザータイプを「外部」に設定
   - 必要情報を入力：
     - アプリ名: Member Board
     - ユーザーサポートメール: あなたのメールアドレス
     - 開発者連絡先: あなたのメールアドレス
   - 保存して次へ

4. **認証情報の作成**
   - 左側メニューから「認証情報」を選択
   - 「+ 認証情報を作成」→「OAuthクライアントID」を選択
   - アプリケーションの種類: 「ウェブアプリケーション」
   - 名前: Member Board OAuth
   - 承認済みのリダイレクトURI:
     ```
     http://localhost:3000/api/auth/callback/google
     ```
   - 作成をクリック

5. **クライアントIDとシークレットを取得**
   - 作成後に表示されるクライアントIDとクライアントシークレットをコピー

## .envファイルの設定

`.env`ファイルに以下を設定：

```env
GOOGLE_CLIENT_ID=あなたのクライアントID
GOOGLE_CLIENT_SECRET=あなたのクライアントシークレット
```

## 本番環境での設定

本番環境では、リダイレクトURIを以下のように追加：
```
https://yourdomain.com/api/auth/callback/google
```

## トラブルシューティング

### エラー: "redirect_uri_mismatch"
- Google Cloud ConsoleのリダイレクトURIが正しく設定されているか確認
- URLの末尾にスラッシュがないか確認

### エラー: "Invalid client"
- クライアントIDとシークレットが正しくコピーされているか確認
- .envファイルが正しく読み込まれているか確認