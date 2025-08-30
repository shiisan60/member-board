import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, title, content } = await request.json();
    
    if (!email || !title || !content) {
      return NextResponse.json(
        { error: 'Email, title, and content are required' },
        { status: 400 }
      );
    }
    
    // ユーザーを検索
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // 投稿を作成
    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    return NextResponse.json({
      message: 'Post created successfully',
      post: {
        id: post.id,
        title: post.title,
        content: post.content,
        author: post.author,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      }
    });
  } catch (error: any) {
    console.error('Post creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create post', details: error.message },
      { status: 500 }
    );
  }
}