#!/usr/bin/env node

console.log('=== Vercel本番環境でのデータベーススキーマデプロイ ===\n');

console.log('Vercelでのデータベーススキーマ設定手順:\n');

console.log('1. Vercel CLIでデータベーススキーマをプッシュ:');
console.log('   vercel env pull .env.vercel');
console.log('   npx prisma db push --force-reset');
console.log('');

console.log('2. または、Vercel Function経由でスキーマをプッシュ:');
console.log('   https://member-board-week2.vercel.app/api/push-schema');
console.log('');

console.log('3. データベースの初期化:');
console.log('   https://member-board-week2.vercel.app/api/init-db');
console.log('');

console.log('注意: PostgreSQLデータベースにテーブルが存在しない可能性があります。');
console.log('Prismaスキーマをデータベースにプッシュする必要があります。');