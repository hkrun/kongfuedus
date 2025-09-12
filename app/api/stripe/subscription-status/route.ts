import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// 强制动态渲染，因为这个路由需要访问用户会话
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    // 从数据库查询用户的订阅状态
    const subscription = await prisma.platformSubscription.findFirst({
      where: {
        userId: session.user.id,
        OR: [
          { status: 'active' },
          { 
            status: 'canceled', 
            cancelAtPeriodEnd: true,
            currentPeriodEnd: { gt: new Date() }
          },
          {
            status: 'trialing',
            trialEnd: { gt: new Date() }
          }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    const subscriptionStatus = {
      isActive: subscription ? (
        subscription.status === 'active' || 
        (subscription.status === 'canceled' && subscription.cancelAtPeriodEnd)
      ) : false,
      isTrial: subscription ? (
        subscription.status === 'trialing' || 
        subscription.planType === 'FREE_TRIAL'
      ) : false,
      trialEnd: subscription?.trialEnd,
      currentPeriodEnd: subscription?.currentPeriodEnd,
      planType: subscription?.planType,
      status: subscription?.status,
      cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd
    };

    return NextResponse.json(subscriptionStatus);
  } catch (error) {
    console.error('Subscription status error:', error);
    return NextResponse.json(
      { error: '查询订阅状态失败' },
      { status: 500 }
    );
  }
}
