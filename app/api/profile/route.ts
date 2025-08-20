import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// プロフィール取得
export async function GET() {
  try {
    const session = await auth()
    console.log('Profile API: session data:', JSON.stringify(session, null, 2))

    if (!session?.user?.id) {
      console.log('Profile API: No session or user ID')
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }
    
    console.log('Profile API: Looking for user with ID:', session.user.id)

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    
    console.log('Profile API: User found:', user ? 'Yes' : 'No')
    
    if (!user) {
      console.log('Profile API: User not found in database')
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    // bioフィールドを手動で追加（一時的な対処）
    const userWithBio = {
      ...user,
      bio: user ? (user as Record<string, unknown>).bio as string || null : null
    }
    
    console.log('Profile API: Returning user data:', userWithBio)

    return NextResponse.json({ user: userWithBio })
  } catch (error) {
    console.error('Failed to fetch profile:', error)
    return NextResponse.json(
      { error: 'プロフィールの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// プロフィール更新
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const { name, bio } = await request.json()

    // バリデーション
    if (name !== undefined) {
      if (typeof name !== 'string') {
        return NextResponse.json(
          { error: '名前は文字列で入力してください' },
          { status: 400 }
        )
      }
      if (name.trim().length === 0) {
        return NextResponse.json(
          { error: '名前は必須です' },
          { status: 400 }
        )
      }
      if (name.length > 50) {
        return NextResponse.json(
          { error: '名前は50文字以内で入力してください' },
          { status: 400 }
        )
      }
    }

    if (bio !== undefined) {
      if (typeof bio !== 'string') {
        return NextResponse.json(
          { error: '自己紹介は文字列で入力してください' },
          { status: 400 }
        )
      }
      if (bio.length > 200) {
        return NextResponse.json(
          { error: '自己紹介は200文字以内で入力してください' },
          { status: 400 }
        )
      }
    }

    // 更新データの構築
    const updateData: { name?: string; bio?: string } = {}
    if (name !== undefined) updateData.name = name.trim()
    if (bio !== undefined) updateData.bio = bio.trim()

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        updatedAt: true,
      },
    })
    
    // bioフィールドを手動で追加（一時的な対処）
    const updatedUserWithBio = {
      ...updatedUser,
      bio: updatedUser ? (updatedUser as Record<string, unknown>).bio as string || null : null
    }

    return NextResponse.json({
      message: 'プロフィールが更新されました',
      user: updatedUserWithBio,
    })
  } catch (error) {
    console.error('Failed to update profile:', error)
    return NextResponse.json(
      { error: 'プロフィールの更新に失敗しました' },
      { status: 500 }
    )
  }
}