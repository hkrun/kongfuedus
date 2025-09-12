import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// 获取用户信息
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    // 获取用户订阅状态
    const subscription = await prisma.platformSubscription.findFirst({
      where: {
        userId: session.user.id,
        OR: [
          { status: 'active' },
          { 
            status: 'canceled', 
            cancelAtPeriodEnd: true,
            currentPeriodEnd: { gt: new Date() }
          }
        ],
        currentPeriodEnd: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });

    // 获取用户购买记录数量
    const purchaseCount = await prisma.coursePurchase.count({
      where: {
        userId: session.user.id,
        status: 'active',
        expiresAt: { gt: new Date() }
      }
    });

    // 获取用户学习进度统计
    const progressStats = await prisma.courseProgress.aggregate({
      where: { userId: session.user.id },
      _count: { id: true },
      _sum: { totalWatched: true },
      _avg: { progress: true }
    });

    return NextResponse.json({
      user,
      subscription: subscription ? {
        id: subscription.id,
        status: subscription.status,
        planType: subscription.planType,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        trialEnd: subscription.trialEnd
      } : null,
      stats: {
        purchaseCount,
        totalCourses: progressStats._count.id || 0,
        totalWatchTime: progressStats._sum.totalWatched || 0,
        averageProgress: progressStats._avg.progress || 0
      }
    });

  } catch (error) {
    console.error('获取用户信息失败:', error);
    return NextResponse.json({ error: '获取用户信息失败' }, { status: 500 });
  }
}

// 更新用户信息
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const body = await request.json();
    const { name, image } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (image !== undefined) updateData.image = image;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: '用户信息更新成功'
    });

  } catch (error) {
    console.error('更新用户信息失败:', error);
    return NextResponse.json({ error: '更新用户信息失败' }, { status: 500 });
  }
}
