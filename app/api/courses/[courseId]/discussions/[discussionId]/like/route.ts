import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '../../../../../../../lib/db'

// 点赞/取消点赞讨论
export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string; discussionId: string } }
) {
  try {
    console.log('👍 处理讨论点赞，讨论ID:', params.discussionId);
    
    // 验证用户身份
    const session = await auth();
    
    if (!session?.user?.email) {
      console.log('❌ 未授权访问：用户未登录');
      return NextResponse.json(
        { error: '请先登录后再进行点赞操作' },
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

    // 获取当前讨论
    const discussion = await prisma.courseDiscussion.findUnique({
      where: { id: params.discussionId }
    })

    if (!discussion) {
      return NextResponse.json(
        { error: '讨论不存在' },
        { status: 404 }
      )
    }

    // 使用事务确保数据一致性
    const result = await prisma.$transaction(async (tx) => {
      // 检查用户是否已经点赞过这个讨论
      const existingLike = await tx.discussionLike.findUnique({
        where: {
          userId_discussionId: {
            userId: user.id, // 使用从session中获取的用户ID
            discussionId: params.discussionId
          }
        }
      })

      let updatedDiscussion;
      let action;

      if (existingLike) {
        // 用户已经点赞过，执行取消点赞
        await tx.discussionLike.delete({
          where: {
            userId_discussionId: {
              userId: user.id, // 使用从session中获取的用户ID
              discussionId: params.discussionId
            }
          }
        })

        updatedDiscussion = await tx.courseDiscussion.update({
          where: { id: params.discussionId },
          data: {
            likes: Math.max(0, discussion.likes - 1) // 确保点赞数不会小于0
          }
        })

        action = 'unliked';
      } else {
        // 用户没有点赞过，执行点赞
        await tx.discussionLike.create({
          data: {
            userId: user.id, // 使用从session中获取的用户ID
            discussionId: params.discussionId
          }
        })

        updatedDiscussion = await tx.courseDiscussion.update({
          where: { id: params.discussionId },
          data: {
            likes: discussion.likes + 1
          }
        })

        action = 'liked';
      }

      return { updatedDiscussion, action };
    });

    console.log(`✅ ${result.action === 'liked' ? '点赞' : '取消点赞'}成功，新的点赞数:`, result.updatedDiscussion.likes);

    return NextResponse.json({ 
      likes: result.updatedDiscussion.likes, 
      action: result.action,
      isLiked: result.action === 'liked'
    }, { status: 200 })
  } catch (error) {
    console.error('❌ 点赞失败:', error)
    return NextResponse.json(
      { error: '点赞失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
}
