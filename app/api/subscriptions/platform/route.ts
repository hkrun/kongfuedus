import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { stripe, createPlatformSubscription, getOrCreateCustomer } from '@/lib/stripe';
import { prisma } from '@/lib/db';

// 创建平台订阅（免费试用或付费订阅）
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const { planType } = await request.json();
    
    if (!planType || !['FREE_TRIAL', 'MONTHLY'].includes(planType)) {
      return NextResponse.json(
        { error: '无效的订阅计划类型' },
        { status: 400 }
      );
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 检查用户是否已有活跃订阅
    const existingSubscription = await prisma.platformSubscription.findFirst({
      where: {
        userId: user.id,
        status: { in: ['active', 'trialing'] }
      }
    });

    if (existingSubscription) {
      return NextResponse.json(
        { error: '用户已有活跃订阅' },
        { status: 400 }
      );
    }

    // 获取或创建 Stripe 客户
    const customer = await getOrCreateCustomer(
      user.id,
      user.email,
      user.name || undefined
    );

    // 创建平台订阅
    const subscription = await createPlatformSubscription(
      user.id,
      customer.id,
      planType as 'FREE_TRIAL' | 'MONTHLY'
    );

    // 创建平台订阅记录
    const platformSubscription = await prisma.platformSubscription.create({
      data: {
        userId: user.id,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: customer.id,
        status: subscription.status,
        planType,
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        trialEnd: (subscription as any).trial_end ? new Date((subscription as any).trial_end * 1000) : null,
        projectId: process.env.PROJECT_ID || 'kongfunew',
      },
    });

    // 如果是免费试用，立即授予全平台访问权限
    if (planType === 'FREE_TRIAL') {
      await grantPlatformAccess(user.id);
    }

    return NextResponse.json({
      success: true,
      subscription: platformSubscription,
      stripeSubscription: subscription,
    });

  } catch (error) {
    console.error('创建平台订阅失败:', error);
    return NextResponse.json(
      { error: '创建订阅失败' },
      { status: 500 }
    );
  }
}

// 获取用户的平台订阅信息
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 获取用户的平台订阅
    const subscription = await prisma.platformSubscription.findFirst({
      where: {
        userId: user.id,
        status: { in: ['active', 'trialing', 'past_due'] }
      },
      orderBy: { createdAt: 'desc' }
    });

    // 获取用户的课程访问权限
    const courseAccesses = await prisma.courseAccess.findMany({
      where: { userId: user.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            category: true,
            instructor: true,
          }
        }
      }
    });

    return NextResponse.json({
      subscription,
      courseAccesses,
      hasActiveSubscription: !!subscription && ['active', 'trialing'].includes(subscription.status),
    });

  } catch (error) {
    console.error('获取订阅信息失败:', error);
    return NextResponse.json(
      { error: '获取订阅信息失败' },
      { status: 500 }
    );
  }
}

// 取消平台订阅
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 获取用户的活跃订阅
    const subscription = await prisma.platformSubscription.findFirst({
      where: {
        userId: user.id,
        status: { in: ['active', 'trialing'] }
      }
    });

    if (!subscription) {
      return NextResponse.json(
        { error: '没有找到活跃订阅' },
        { status: 404 }
      );
    }

    // 在 Stripe 中取消订阅（在当前期间结束后取消）
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // 更新本地订阅状态
    await prisma.platformSubscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: true,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: '订阅将在当前期间结束后取消',
    });

  } catch (error) {
    console.error('取消订阅失败:', error);
    return NextResponse.json(
      { error: '取消订阅失败' },
      { status: 500 }
    );
  }
}

// 辅助函数：为用户授予全平台课程访问权限
async function grantPlatformAccess(userId: string) {
  try {
    // 获取所有课程
    const courses = await prisma.course.findMany();
    
    // 为用户授予所有课程的订阅访问权限
    for (const course of courses) {
      await prisma.courseAccess.upsert({
        where: {
          userId_courseId: {
            userId,
            courseId: course.id,
          }
        },
        update: {
          accessType: 'SUBSCRIPTION',
          updatedAt: new Date(),
        },
        create: {
          userId,
          courseId: course.id,
          accessType: 'SUBSCRIPTION',
          projectId: process.env.PROJECT_ID || 'kongfunew',
        },
      });
    }
    
    console.log(`✅ 已为用户 ${userId} 授予 ${courses.length} 门课程的访问权限`);
  } catch (error) {
    console.error('❌ 授予平台访问权限失败:', error);
  }
}
