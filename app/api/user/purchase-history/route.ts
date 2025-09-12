import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// 获取用户购买记录
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // 获取课程购买记录
    const coursePurchases = await prisma.coursePurchase.findMany({
      where: { userId: session.user.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            category: true,
            instructor: true
          }
        }
      },
      orderBy: { purchaseDate: 'desc' },
      skip,
      take: limit
    });

    // 获取订阅记录
    const subscriptions = await prisma.platformSubscription.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    });

    // 合并购买记录
    const allPurchases = [
      ...coursePurchases.map(purchase => ({
        id: purchase.id,
        type: 'course',
        title: purchase.course.title,
        category: purchase.course.category,
        instructor: purchase.course.instructor,
        amount: purchase.amount,
        currency: purchase.currency,
        status: purchase.status,
        purchaseDate: purchase.purchaseDate,
        expiresAt: purchase.expiresAt,
        stripeSessionId: purchase.stripeSessionId
      })),
      ...subscriptions.map(subscription => ({
        id: subscription.id,
        type: 'subscription',
        title: `平台订阅 - ${subscription.planType}`,
        category: '订阅',
        instructor: '平台',
        amount: subscription.planType === 'MONTHLY' ? 2999 : subscription.planType === 'YEARLY' ? 29999 : 0,
        currency: 'usd',
        status: subscription.status,
        purchaseDate: subscription.createdAt,
        expiresAt: subscription.currentPeriodEnd,
        stripeSessionId: subscription.stripeSubscriptionId,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
      }))
    ].sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());

    // 获取总数
    const coursePurchaseCount = await prisma.coursePurchase.count({
      where: { userId: session.user.id }
    });
    const subscriptionCount = await prisma.platformSubscription.count({
      where: { userId: session.user.id }
    });
    const total = coursePurchaseCount + subscriptionCount;

    return NextResponse.json({
      purchases: allPurchases,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('获取购买记录失败:', error);
    return NextResponse.json({ error: '获取购买记录失败' }, { status: 500 });
  }
}
