import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validateAndSanitize, POST_VALIDATION_RULES, sanitizeMongoInput, logSecurityEvent } from "@/lib/security/sanitizer"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageParam = Number(searchParams.get("page") ?? "1")
    const limitParam = Number(searchParams.get("limit") ?? "10")

    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1
    const limit =
      Number.isFinite(limitParam) && limitParam > 0 && limitParam <= 100
        ? limitParam
        : 10

    const skip = (page - 1) * limit

    const [total, postsRaw] = await Promise.all([
      prisma.post.count(),
      prisma.post.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ])

    // 関連ユーザーが欠損している古いデータが存在する場合に備えて手動で結合する
    const uniqueAuthorIds = Array.from(new Set(postsRaw.map((p) => p.authorId)))
    const authors = await prisma.user.findMany({
      where: { id: { in: uniqueAuthorIds } },
      select: { id: true, name: true, email: true },
    })
    const authorMap = new Map(authors.map((a) => [a.id, a]))

    const posts = postsRaw
      .map((p) => {
        const author = authorMap.get(p.authorId)
        if (!author) return null // 孤児ポストは除外
        return {
          id: p.id,
          title: p.title,
          content: p.content,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          author,
        }
      })
      .filter(Boolean)

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  } catch (error) {
    console.error("Failed to fetch posts:", error)
    // 開発向けにエラーメッセージを返す（本番では固定文言）
    const message =
      process.env.NODE_ENV === "production"
        ? "投稿の取得に失敗しました"
        : `投稿の取得に失敗しました: ${error instanceof Error ? error.message : String(error)}`
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      )
    }

    // デバッグ: セッションユーザーの確認
    console.log("Session user ID:", session.user.id)
    
    // ユーザーが存在するか確認
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })
    
    if (!user) {
      console.error("User not found in database:", session.user.id)
      return NextResponse.json(
        { error: "ユーザーが見つかりません" },
        { status: 404 }
      )
    }

    const requestBody = await request.json()
    
    // NoSQLインジェクション対策
    const sanitizedBody = sanitizeMongoInput(requestBody)
    const { title, content } = sanitizedBody

    // 入力値の検証とサニタイゼーション
    const titleValidation = validateAndSanitize(title, POST_VALIDATION_RULES.title)
    const contentValidation = validateAndSanitize(content, POST_VALIDATION_RULES.content)

    if (!titleValidation.isValid) {
      // XSS攻撃の場合はより詳細なログを記録
      const eventType = titleValidation.errors[0].includes('スクリプト') ? 'XSS_ATTEMPT' : 'INVALID_INPUT'
      
      console.log(`[SECURITY] ${eventType}: ${titleValidation.errors[0]}`, {
        input: title,
        userId: session.user.id,
        timestamp: new Date().toISOString()
      })
      
      return NextResponse.json(
        { error: titleValidation.errors[0] },
        { status: 400 }
      )
    }

    if (!contentValidation.isValid) {
      // XSS攻撃の場合はより詳細なログを記録
      const eventType = contentValidation.errors[0].includes('スクリプト') ? 'XSS_ATTEMPT' : 'INVALID_INPUT'
      
      console.log(`[SECURITY] ${eventType}: ${contentValidation.errors[0]}`, {
        input: content,
        userId: session.user.id,
        timestamp: new Date().toISOString()
      })
      
      return NextResponse.json(
        { error: contentValidation.errors[0] },
        { status: 400 }
      )
    }

    const post = await prisma.post.create({
      data: {
        title: titleValidation.sanitized,
        content: contentValidation.sanitized,
        authorId: session.user.id,
      },
    })

    // 作成後に完全な投稿データを取得
    const postWithAuthor = await prisma.post.findUnique({
      where: { id: post.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(
      { message: "投稿が作成されました", post: postWithAuthor },
      { status: 201 }
    )
  } catch (error) {
    console.error("Failed to create post:", error)
    return NextResponse.json(
      { error: "投稿の作成に失敗しました" },
      { status: 500 }
    )
  }
}