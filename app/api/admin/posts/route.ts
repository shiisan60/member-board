import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    await requireAdmin()

    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error("Failed to fetch posts:", error)
    return NextResponse.json(
      { error: "管理者権限が必要です" },
      { status: 403 }
    )
  }
}