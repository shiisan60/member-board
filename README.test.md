# 認証機能テストガイド

## テスト構成

### 1. ユニットテスト
- **場所**: `__tests__/unit/`
- **対象**: 個別関数のテスト
- **実行**: `npm test`

### 2. コンポーネントテスト
- **場所**: `__tests__/components/`
- **対象**: Reactコンポーネント
- **実行**: `npm test`

### 3. APIテスト
- **場所**: `__tests__/api/`
- **対象**: APIエンドポイント
- **実行**: `npm test`

### 4. E2Eテスト
- **場所**: `e2e/`
- **対象**: ユーザーフロー全体
- **実行**: `npm run test:e2e`

## テストコマンド

```bash
# すべてのユニットテストを実行
npm test

# テストをウォッチモードで実行
npm run test:watch

# カバレッジレポート付きでテスト実行
npm run test:coverage

# E2Eテストを実行
npm run test:e2e

# E2EテストをUIモードで実行
npm run test:e2e:ui

# E2Eテストをデバッグモードで実行
npm run test:e2e:debug

# すべてのテストを実行
npm run test:all
```

## テスト項目

### ✅ ユーザー登録のテスト
- 新規ユーザー登録成功
- 既存メールアドレスでのエラー
- パスワード長バリデーション
- パスワード確認の一致チェック
- 必須フィールドのバリデーション

### ✅ ログインのテスト
- 正しい認証情報でのログイン成功
- 間違ったパスワードでのエラー
- 存在しないユーザーでのエラー
- ローディング状態の表示
- ログイン済みユーザーのリダイレクト

### ✅ セッション確認のテスト
- ログイン後のセッション維持
- 新しいタブでのセッション共有
- セッションの有効期限（30日）
- 保護されたルートへのアクセス制御

### ✅ ログアウトのテスト
- ログアウト機能の動作
- ログアウト後のリダイレクト
- セッションクリア確認

### ✅ エラーハンドリングのテスト
- API エラーの適切な処理
- ネットワークエラーの処理
- バリデーションエラーの表示
- データベースエラーの処理

## 前提条件

### 必要なサービス
1. **MongoDB**: `brew services start mongodb-community`
2. **Next.js開発サーバー**: `npm run dev`

### 環境変数
`.env.local`または`.env`ファイルに以下の設定が必要：
```env
DATABASE_URL="mongodb://localhost:27017/member-board"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

## トラブルシューティング

### テストが失敗する場合
1. MongoDBが起動しているか確認
   ```bash
   brew services list | grep mongodb
   ```

2. 環境変数が正しく設定されているか確認
   ```bash
   cat .env.local
   ```

3. 依存関係が正しくインストールされているか確認
   ```bash
   npm install
   ```

4. Playwrightのブラウザがインストールされているか確認
   ```bash
   npx playwright install
   ```

### E2Eテストのデバッグ
```bash
# ヘッドレスモードを無効にして実行
npm run test:e2e:debug

# 特定のテストのみ実行
npx playwright test auth.spec.ts

# 特定のブラウザでのみ実行
npx playwright test --project=chromium
```

## カバレッジ目標
- **ライン**: 70%以上
- **ブランチ**: 70%以上
- **関数**: 70%以上
- **ステートメント**: 70%以上

## CI/CD統合
GitHub ActionsやGitLab CIで自動テストを実行する場合：

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run test:coverage
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```