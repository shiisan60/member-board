#!/usr/bin/env node

/**
 * 管理者ユーザーを作成するスクリプト
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('管理者ユーザーを作成しています...');
    
    // 既存の管理者ユーザーを確認
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      console.log('✅ 既存の管理者ユーザーが見つかりました:', existingAdmin.email);
      return;
    }

    // admin@example.comのユーザーが存在するかチェック
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    });

    if (adminUser) {
      // 既存のユーザーを管理者に昇格
      const updatedUser = await prisma.user.update({
        where: { email: 'admin@example.com' },
        data: { 
          role: 'ADMIN',
          emailVerified: new Date() // 管理者は認証済みにする
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true
        }
      });

      console.log('✅ 既存ユーザーを管理者に昇格しました:', updatedUser);
    } else {
      // 新しい管理者ユーザーを作成
      const hashedPassword = await bcrypt.hash('Admin123!@#$', 12);
      
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@example.com',
          name: 'System Administrator',
          password: hashedPassword,
          role: 'ADMIN',
          emailVerified: new Date()
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true
        }
      });

      console.log('✅ 新しい管理者ユーザーを作成しました:', newAdmin);
    }

    // 全ユーザーの一覧を表示
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true
      }
    });

    console.log('\n📋 現在のユーザー一覧:');
    allUsers.forEach(user => {
      const verified = user.emailVerified ? '✅' : '❌';
      const admin = user.role === 'ADMIN' ? '👑' : '👤';
      console.log(`  ${admin} ${verified} ${user.email} (${user.name || '名前なし'})`);
    });

    console.log('\n🎉 セットアップ完了！');
    console.log('管理者ログイン情報:');
    console.log('  メールアドレス: admin@example.com');
    console.log('  パスワード: Admin123!@#$');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();