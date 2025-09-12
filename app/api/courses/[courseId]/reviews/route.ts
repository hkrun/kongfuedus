import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '../../../../../lib/db'

// 获取课程评论
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    console.log('🔍 获取课程评论，课程ID:', params.courseId, '类型:', typeof params.courseId);
    
    const reviews = await prisma.courseReview.findMany({
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    console.log(`✅ 成功获取 ${reviews.length} 条评论，课程ID: ${params.courseId}`);
    if (reviews.length > 0) {
      console.log('📝 评论详情:', reviews.map(r => ({ id: r.id, userId: r.userId, rating: r.rating, content: r.content.substring(0, 50) + '...' })));
    }
    return NextResponse.json(reviews)
  } catch (error) {
    console.error('❌ 获取评论失败:', error)
    return NextResponse.json(
      { error: '获取评论失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
}

// 创建新评论
export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    console.log('📝 创建新评论，课程ID:', params.courseId);
    
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
    const { rating, title, content } = body

    // 验证必要字段
    if (!rating || !content) {
      return NextResponse.json(
        { error: '缺少必要字段：rating, content' },
        { status: 400 }
      )
    }

    // 验证评分范围
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: '评分必须在1-5之间' },
        { status: 400 }
      )
    }

    const review = await prisma.courseReview.create({
      data: {
        courseId: params.courseId,
        userId: user.id, // 使用从session中获取的用户ID
        rating,
        title,
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

    console.log('✅ 评论创建成功，ID:', review.id);
    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('❌ 创建评论失败:', error)
    
    // 检查是否是唯一约束错误
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: '用户已对该课程发表过评论' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: '创建评论失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
}
