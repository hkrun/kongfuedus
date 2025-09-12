import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createCoursePurchaseSession } from '@/lib/stripe';
import { prisma } from '@/lib/db';

// 创建单门课程购买会话
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const { courseId, amount, currency = 'usd' } = await request.json();
    
    if (!courseId || !amount) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
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

    // 检查课程是否存在
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return NextResponse.json(
        { error: '课程不存在' },
        { status: 404 }
      );
    }

    // 检查用户是否已有该课程的访问权限
    const existingAccess = await prisma.courseAccess.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId,
        }
      }
    });

    if (existingAccess) {
      return NextResponse.json(
        { error: '用户已有该课程的访问权限' },
        { status: 400 }
      );
    }

    // 获取或创建 Stripe 客户
    const { getOrCreateCustomer } = await import('@/lib/stripe');
    const customer = await getOrCreateCustomer(
      user.id,
      user.email,
      user.name || undefined
    );

    // 创建购买会话
    const session_url = await createCoursePurchaseSession(
      user.id,
      customer.id,
      courseId,
      amount,
      currency
    );

    return NextResponse.json({
      success: true,
      session_url,
      course: {
        id: course.id,
        title: course.title,
        amount,
        currency,
      },
    });

  } catch (error) {
    console.error('创建课程购买会话失败:', error);
    return NextResponse.json(
      { error: '创建购买会话失败' },
      { status: 500 }
    );
  }
}

// 获取用户的课程购买记录
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

    // 获取用户的课程购买记录
    const purchases = await prisma.coursePurchase.findMany({
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
      },
      orderBy: { purchaseDate: 'desc' }
    });

    return NextResponse.json({
      purchases,
      totalPurchases: purchases.length,
    });

  } catch (error) {
    console.error('获取课程购买记录失败:', error);
    return NextResponse.json(
      { error: '获取购买记录失败' },
      { status: 500 }
    );
  }
}
