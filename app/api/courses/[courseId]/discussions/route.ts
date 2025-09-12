import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '../../../../../lib/db'

// 获取课程讨论
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    console.log('🔍 获取课程讨论，课程ID:', params.courseId);
    
    const discussions = await prisma.courseDiscussion.findMany({
      where: {
        courseId: params.courseId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true, // 修复：avatar -> image
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true, // 修复：avatar -> image
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        likeRecords: {
          select: {
            userId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    console.log(`✅ 成功获取 ${discussions.length} 条讨论`);
    return NextResponse.json(discussions)
  } catch (error) {
    console.error('❌ 获取讨论失败:', error)
    return NextResponse.json(
      { error: '获取讨论失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
}

// 创建新讨论
export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    console.log('📝 创建新讨论，课程ID:', params.courseId);
    
    // 验证用户身份
    const session = await auth();
    
    if (!session?.user?.email) {
      console.log('❌ 未授权访问：用户未登录');
      return NextResponse.json(
        { error: '请先登录后再发布评论' },
        { status: 401 }
      );
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      console.log('❌ 用户不存在:', session.user.email);
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    const body = await request.json()
    const { content } = body

    // 验证必要字段
    if (!content) {
      return NextResponse.json(
        { error: '评论内容不能为空' },
        { status: 400 }
      )
    }

    const discussion = await prisma.courseDiscussion.create({
      data: {
        courseId: params.courseId,
        userId: user.id, // 使用从session中获取的用户ID
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true, // 修复：avatar -> image
          },
        },
      },
    })

    console.log('✅ 讨论创建成功，ID:', discussion.id);
    return NextResponse.json(discussion, { status: 201 })
  } catch (error) {
    console.error('❌ 创建讨论失败:', error)
    return NextResponse.json(
      { error: '创建讨论失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
}
