import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// パスワード変更
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const { currentPassword, newPassword } = await request.json()

    // バリデーション
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: '現在のパスワードと新しいパスワードの両方を入力してください' },
        { status: 400 }
      )
    }

    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
      return NextResponse.json(
        { error: 'パスワードは文字列で入力してください' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: '新しいパスワードは8文字以上で入力してください' },
        { status: 400 }
      )
    }

    if (newPassword.length > 128) {
      return NextResponse.json(
        { error: 'パスワードは128文字以内で入力してください' },
        { status: 400 }
      )
    }

    // パスワード強度チェック
    const hasUpperCase = /[A-Z]/.test(newPassword)
    const hasLowerCase = /[a-z]/.test(newPassword)
    const hasNumbers = /\d/.test(newPassword)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)

    const strengthCount = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length

    if (strengthCount < 3) {
      return NextResponse.json(
        { error: 'パスワードは大文字、小文字、数字、特殊文字のうち少なくとも3種類を含む必要があります' },
        { status: 400 }
      )
    }

    // 現在のユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        password: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    if (!user.password) {
      return NextResponse.json(
        { error: 'ソーシャルログインユーザーのパスワード変更はできません' },
        { status: 400 }
      )
    }

    // 現在のパスワードを確認
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: '現在のパスワードが正しくありません' },
        { status: 400 }
      )
    }

    // 新しいパスワードと現在のパスワードが同じかチェック
    const isSamePassword = await bcrypt.compare(newPassword, user.password)

    if (isSamePassword) {
      return NextResponse.json(
        { error: '新しいパスワードは現在のパスワードと異なるものを設定してください' },
        { status: 400 }
      )
    }

    // 新しいパスワードをハッシュ化
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // パスワードを更新
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedNewPassword,
      },
    })

    return NextResponse.json({
      message: 'パスワードが変更されました',
    })
  } catch (error) {
    console.error('Failed to change password:', error)
    return NextResponse.json(
      { error: 'パスワードの変更に失敗しました' },
      { status: 500 }
    )
  }
}