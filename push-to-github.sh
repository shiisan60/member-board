#!/bin/bash

echo "======================================"
echo "GitHubへのプッシュを開始"
echo "======================================"
echo ""

# mainブランチをプッシュ
echo "1. mainブランチをプッシュ..."
git checkout main
git push -u origin main

echo ""
echo "2. feature/member-boardブランチをプッシュ..."
git checkout feature/member-board
git push -u origin feature/member-board

echo ""
echo "======================================"
echo "プッシュ完了！"
echo "======================================"
echo ""
echo "次のステップ:"
echo ""
echo "1. GitHubでプルリクエストを作成:"
echo "   https://github.com/shiisan60/member-board/compare/main...feature/member-board"
echo ""
echo "2. または GitHub CLI を使用:"
echo "   gh pr create --title \"feat: 会員認証機能の実装\" --body-file docs/PR_DESCRIPTION.md --base main"
echo ""