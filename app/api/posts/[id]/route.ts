import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { canEditPost, canDeletePost, PERMISSION_ERRORS, HTTP_STATUS } from "@/lib/auth/permissions"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      )
    }

    const { id } = await params
    
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!post) {
      return NextResponse.json(
        { error: "投稿が見つかりません" },
        { status: 404 }
      )
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error fetching post:", error)
    return NextResponse.json(
      { error: "投稿の取得に失敗しました" },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await req.json()
    const { title, content } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: "タイトルと内容は必須です" },
        { status: 400 }
      )
    }

    if (title.length > 20) {
      return NextResponse.json(
        { error: "タイトルは20文字以内で入力してください" },
        { status: 400 }
      )
    }

    if (content.length > 200) {
      return NextResponse.json(
        { error: "内容は200文字以内で入力してください" },
        { status: 400 }
      )
    }

    const existingPost = await prisma.post.findUnique({
      where: { id }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: "投稿が見つかりません" },
        { status: 404 }
      )
    }

    // 権限チェック（管理者対応）
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })
    
    if (!canEditPost(session.user.id, existingPost.authorId, user?.role)) {
      return NextResponse.json(
        { error: PERMISSION_ERRORS.NOT_OWNER },
        { status: HTTP_STATUS.FORBIDDEN }
      )
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title,
        content
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error("Error updating post:", error)
    return NextResponse.json(
      { error: "投稿の更新に失敗しました" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      )
    }

    const { id } = await params

    const existingPost = await prisma.post.findUnique({
      where: { id }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: "投稿が見つかりません" },
        { status: 404 }
      )
    }

    // 権限チェック（管理者対応）
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })
    
    if (!canDeletePost(session.user.id, existingPost.authorId, user?.role)) {
      return NextResponse.json(
        { error: PERMISSION_ERRORS.NOT_OWNER },
        { status: HTTP_STATUS.FORBIDDEN }
      )
    }

    await prisma.post.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: "投稿を削除しました" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting post:", error)
    return NextResponse.json(
      { error: "投稿の削除に失敗しました" },
      { status: 500 }
    )
  }
}