#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('=== 本番環境用のPrismaスキーマセットアップ ===\n');

// PostgreSQL用のスキーマに切り替え
const postgresqlSchemaPath = path.join(__dirname, '..', 'prisma', 'schema.postgresql.prisma');
const targetSchemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');

if (fs.existsSync(postgresqlSchemaPath)) {
  try {
    const content = fs.readFileSync(postgresqlSchemaPath, 'utf8');
    fs.writeFileSync(targetSchemaPath, content);
    console.log('✅ PostgreSQL用のスキーマに切り替えました');
  } catch (error) {
    console.error('❌ スキーマの切り替えに失敗しました:', error.message);
    process.exit(1);
  }
} else {
  console.error('❌ PostgreSQLスキーマファイルが見つかりません');
  process.exit(1);
}

console.log('\n次のステップ:');
console.log('1. git add prisma/schema.prisma');
console.log('2. git commit -m "Switch to PostgreSQL schema for production"');
console.log('3. git push');
console.log('4. Vercelが自動デプロイを実行します');