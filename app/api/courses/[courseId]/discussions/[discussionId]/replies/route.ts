import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '../../../../../../../lib/db'

// 创建回复
export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string; discussionId: string } }
) {
  try {
    console.log('📝 创建回复，讨论ID:', params.discussionId);
    
    // 验证用户身份
    const session = await auth();
    
    if (!session?.user?.email) {
      console.log('❌ 未授权访问：用户未登录');
      return NextResponse.json(
        { error: '请先登录后再发布回复' },
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
        { error: '回复内容不能为空' },
        { status: 400 }
      )
    }

    const reply = await prisma.courseDiscussionReply.create({
      data: {
        discussionId: params.discussionId,
        userId: user.id, // 使用从session中获取的用户ID
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    console.log('✅ 回复创建成功，ID:', reply.id);
    return NextResponse.json(reply, { status: 201 })
  } catch (error) {
    console.error('❌ 创建回复失败:', error)
    return NextResponse.json(
      { error: '创建回复失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
}
