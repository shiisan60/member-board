#!/bin/bash

# GitHubリポジトリ設定スクリプト
# 使用方法: ./setup-remote.sh [GitHubユーザー名]

GITHUB_USER=${1:-"your-username"}
REPO_NAME="member-board"

echo "======================================"
echo "GitHubリポジトリ設定"
echo "======================================"
echo ""
echo "GitHubユーザー名: $GITHUB_USER"
echo "リポジトリ名: $REPO_NAME"
echo ""

# リモートリポジトリの追加
echo "1. リモートリポジトリを追加..."
git remote add origin "https://github.com/${GITHUB_USER}/${REPO_NAME}.git"

# リモート設定の確認
echo ""
echo "2. リモート設定を確認..."
git remote -v

# 現在のブランチを確認
echo ""
echo "3. 現在のブランチ..."
git branch

echo ""
echo "======================================"
echo "次のステップ:"
echo "======================================"
echo ""
echo "# mainブランチをプッシュ"
echo "git checkout main"
echo "git push -u origin main"
echo ""
echo "# feature/member-boardブランチをプッシュ"
echo "git checkout feature/member-board"
echo "git push -u origin feature/member-board"
echo ""
echo "# プルリクエストを作成（GitHub CLIを使用）"
echo "gh pr create --title \"feat: 会員認証機能の実装\" --body-file docs/PR_DESCRIPTION.md --base main"
echo ""
echo "または、以下のURLにアクセスしてWebから作成:"
echo "https://github.com/${GITHUB_USER}/${REPO_NAME}/compare/main...feature/member-board"