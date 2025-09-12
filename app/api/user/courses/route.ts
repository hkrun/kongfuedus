import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// 获取用户已购买的课程
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // 获取用户购买记录
    const purchases = await prisma.coursePurchase.findMany({
      where: {
        userId: session.user.id,
        status: 'active',
        expiresAt: { gt: new Date() }
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            category: true,
            instructor: true,
            rating: true,
            students: true
          }
        }
      },
      orderBy: { purchaseDate: 'desc' },
      skip,
      take: limit
    });

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
      }
    });

    // 获取所有课程（如果用户有订阅）
    let allCourses: Array<{
      id: string;
      title: string;
      category: string;
      instructor: string;
      rating: number;
      students: number;
    }> = [];
    if (subscription) {
      allCourses = await prisma.course.findMany({
        select: {
          id: true,
          title: true,
          category: true,
          instructor: true,
          rating: true,
          students: true
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    // 获取课程进度
    const courseIds = subscription ? allCourses.map(c => c.id) : purchases.map(p => p.courseId);
    const progressData = await prisma.courseProgress.findMany({
      where: {
        userId: session.user.id,
        courseId: { in: courseIds }
      },
      select: {
        courseId: true,
        progress: true,
        currentTime: true,
        lastWatched: true,
        isCompleted: true,
        completedAt: true
      }
    });

    // 合并数据
    const courses = subscription ? allCourses : purchases.map(p => p.course);
    const coursesWithProgress = courses.map(course => {
      const progress = progressData.find(p => p.courseId === course.id);
      const purchase = purchases.find(p => p.courseId === course.id);
      
      return {
        ...course,
        progress: progress?.progress || 0,
        currentTime: progress?.currentTime || 0,
        lastWatched: progress?.lastWatched,
        isCompleted: progress?.isCompleted || false,
        completedAt: progress?.completedAt,
        accessType: subscription ? 'subscription' : 'purchase',
        expiresAt: purchase?.expiresAt,
        purchaseDate: purchase?.purchaseDate
      };
    });

    // 获取总数
    const total = subscription 
      ? await prisma.course.count()
      : await prisma.coursePurchase.count({
          where: {
            userId: session.user.id,
            status: 'active',
            expiresAt: { gt: new Date() }
          }
        });

    return NextResponse.json({
      courses: coursesWithProgress,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      subscription: subscription ? {
        status: subscription.status,
        planType: subscription.planType,
        currentPeriodEnd: subscription.currentPeriodEnd
      } : null
    });

  } catch (error) {
    console.error('获取用户课程失败:', error);
    return NextResponse.json({ error: '获取用户课程失败' }, { status: 500 });
  }
}
