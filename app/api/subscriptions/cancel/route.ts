import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

// 取消订阅
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // 获取用户当前活跃的订阅
    const subscription = await prisma.platformSubscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'active',
        currentPeriodEnd: { gt: new Date() }
      }
    });

    if (!subscription) {
      return NextResponse.json({ error: '未找到活跃的订阅' }, { status: 404 });
    }

    // 调用Stripe API取消订阅
    const stripeSubscription = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      {
        cancel_at_period_end: true
      }
    );

    // 更新数据库中的订阅状态
    await prisma.platformSubscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: true,
        status: stripeSubscription.status
      }
    });

    return NextResponse.json({
      success: true,
      message: '订阅已设置为在当前计费周期结束后取消',
      cancelAtPeriodEnd: true,
      currentPeriodEnd: subscription.currentPeriodEnd
    });

  } catch (error) {
    console.error('取消订阅失败:', error);
    return NextResponse.json({ error: '取消订阅失败' }, { status: 500 });
  }
}
