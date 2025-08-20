import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { role } = body

    if (!role || !["admin", "user"].includes(role)) {
      return NextResponse.json(
        { error: "無効な権限です" },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Failed to update user role:", error)
    return NextResponse.json(
      { error: "ユーザーの更新に失敗しました" },
      { status: 500 }
    )
  }
}