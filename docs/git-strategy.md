# Git ブランチ戦略

## ブランチ構成

### 主要ブランチ
- **main**: 本番環境用のブランチ（保護設定推奨）
- **develop**: 開発環境用の統合ブランチ

### フィーチャーブランチ
機能ごとに以下のブランチを作成：

1. **feature/auth**
   - ユーザー登録機能
   - ログイン/ログアウト機能
   - セッション管理

2. **feature/board-crud**
   - 投稿の作成（Create）
   - 投稿の閲覧（Read）
   - 投稿の編集（Update）
   - 投稿の削除（Delete）
   - コメント機能

3. **feature/email**
   - メール送信設定
   - 登録確認メール
   - パスワードリセット
   - 通知メール

4. **feature/admin**
   - 管理者ダッシュボード
   - ユーザー管理
   - 投稿管理
   - 権限管理

### その他のブランチ
- **hotfix/**: 本番環境の緊急修正用
- **release/**: リリース準備用

## ワークフロー

1. **機能開発**
   ```bash
   # developブランチから新機能ブランチを作成
   git checkout develop
   git checkout -b feature/機能名
   
   # 開発完了後、developへマージ
   git checkout develop
   git merge feature/機能名
   ```

2. **リリース準備**
   ```bash
   # developからreleaseブランチを作成
   git checkout -b release/v1.0.0 develop
   
   # バグ修正後、mainとdevelopへマージ
   git checkout main
   git merge release/v1.0.0
   git tag v1.0.0
   
   git checkout develop
   git merge release/v1.0.0
   ```

3. **緊急修正**
   ```bash
   # mainからhotfixブランチを作成
   git checkout -b hotfix/修正内容 main
   
   # 修正後、mainとdevelopへマージ
   git checkout main
   git merge hotfix/修正内容
   
   git checkout develop
   git merge hotfix/修正内容
   ```

## コミットメッセージ規約

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type
- feat: 新機能
- fix: バグ修正
- docs: ドキュメント変更
- style: コードフォーマット
- refactor: リファクタリング
- test: テスト追加/修正
- chore: ビルド/補助ツール変更

### 例
```
feat(auth): ユーザー登録機能を実装

- メールアドレスとパスワードでの登録
- パスワードのハッシュ化
- 入力バリデーション

Closes #123
```

## 開発順序の推奨

1. **Phase 1: 認証基盤** (feature/auth)
   - 最初に実装すべき基本機能
   - 他の機能の前提条件

2. **Phase 2: 掲示板機能** (feature/board-crud)
   - アプリケーションのコア機能
   - 認証機能に依存

3. **Phase 3: 管理機能** (feature/admin)
   - ユーザーと投稿の管理
   - 認証とCRUD機能に依存

4. **Phase 4: メール機能** (feature/email)
   - 通知システム
   - 独立して開発可能

## ブランチ保護ルール

### mainブランチ
- 直接プッシュを禁止
- PRのレビュー必須
- CIテストの通過必須

### developブランチ
- 直接プッシュを禁止
- PRのレビュー推奨