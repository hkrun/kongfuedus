import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// 检查用户对课程的访问权限
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        hasAccess: false, 
        accessType: 'none',
        reason: '未登录' 
      });
    }

    const { courseId } = params;

    // 检查用户是否有订阅
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
      }
    });

    // 如果有订阅，可以访问所有课程
    if (subscription) {
      return NextResponse.json({
        hasAccess: true,
        accessType: 'subscription',
        subscription: {
          status: subscription.status,
          planType: subscription.planType,
          currentPeriodEnd: subscription.currentPeriodEnd
        }
      });
    }

    // 检查用户是否购买了该课程
    const purchase = await prisma.coursePurchase.findFirst({
      where: {
        userId: session.user.id,
        courseId: courseId,
        status: 'active',
        expiresAt: { gt: new Date() }
      }
    });

    if (purchase) {
      return NextResponse.json({
        hasAccess: true,
        accessType: 'purchase',
        purchase: {
          purchaseDate: purchase.purchaseDate,
          expiresAt: purchase.expiresAt,
          amount: purchase.amount
        }
      });
    }

    // 没有访问权限
    return NextResponse.json({
      hasAccess: false,
      accessType: 'none',
      reason: '未购买且无订阅'
    });

  } catch (error) {
    console.error('检查课程访问权限失败:', error);
    return NextResponse.json({ 
      hasAccess: false, 
      accessType: 'none',
      reason: '检查失败' 
    }, { status: 500 });
  }
}