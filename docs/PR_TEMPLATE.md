# プルリクエスト作成手順

## 1. GitHubリポジトリの作成
1. GitHubにログイン
2. 新しいリポジトリを作成（member-board）
3. 初期設定はスキップ（READMEなし）

## 2. リモートリポジトリの設定
```bash
# リモートリポジトリを追加
git remote add origin https://github.com/[あなたのユーザー名]/member-board.git

# 現在のブランチを確認
git branch
# -> feature/member-board であることを確認

# リモートにプッシュ
git push -u origin feature/member-board
```

## 3. プルリクエストの作成

### オプションA: GitHub CLI使用（推奨）
```bash
# GitHub CLIのインストール（まだの場合）
brew install gh

# 認証
gh auth login

# PRを作成
gh pr create \
  --title "feat: 会員認証機能の実装" \
  --body-file docs/PR_DESCRIPTION.md \
  --base main \
  --head feature/member-board
```

### オプションB: GitHubウェブサイトから作成
1. https://github.com/[あなたのユーザー名]/member-board にアクセス
2. "Pull requests" タブをクリック
3. "New pull request" ボタンをクリック
4. base: main ← compare: feature/member-board を選択
5. "Create pull request" をクリック
6. タイトル: `feat: 会員認証機能の実装`
7. 説明文: `docs/PR_DESCRIPTION.md` の内容をコピー＆ペースト
8. "Create pull request" をクリック

## 4. スクリーンショットの追加（オプション）

### ローカルでスクリーンショットを撮る場合
```bash
# 開発サーバーを起動
npm run dev

# ブラウザでアクセスしてスクリーンショットを撮影
# - http://localhost:3000/login
# - http://localhost:3000/register

# スクリーンショットを保存
mkdir -p docs/screenshots
# 画像をdocs/screenshots/に保存
```

### PRにスクリーンショットを追加
1. PR作成後、コメント欄で画像をドラッグ＆ドロップ
2. または、画像をクリップボードからペースト

## 5. レビュワーの設定
1. PRページの右側サイドバー
2. "Reviewers" をクリック
3. レビュワーを選択

## 6. ラベルの追加
- `enhancement` - 新機能
- `security` - セキュリティ関連
- `documentation` - ドキュメント更新

## チェックポイント
- [ ] コミットメッセージは規約に従っているか
- [ ] PRの説明は十分詳細か
- [ ] テストは実行したか
- [ ] セキュリティの考慮はしたか
- [ ] コードレビューの準備はできているか