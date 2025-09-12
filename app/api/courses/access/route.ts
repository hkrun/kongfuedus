import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// 批量检查多个课程的访问权限（POST 方法）
export async function POST(request: NextRequest) {
  console.log('🔍 开始批量检查课程访问权限...');
  
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      console.log('❌ 未授权访问');
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { courseIds } = body;
    
    if (!courseIds || !Array.isArray(courseIds)) {
      console.log('❌ 缺少课程ID数组');
      return NextResponse.json(
        { error: '缺少课程ID数组' },
        { status: 400 }
      );
    }

    console.log('📝 请求参数:', { courseIds });

    // 查找用户
    console.log('👤 查找用户...');
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
    console.log('✅ 用户找到:', { userId: user.id, userName: user.name });

    // 批量检查课程是否存在
    console.log('📚 批量检查课程是否存在...');
    const courses = await prisma.course.findMany({
      where: { id: { in: courseIds } },
      select: { id: true, title: true, category: true, instructor: true }
    });
    
    const existingCourseIds = courses.map((c: any) => c.id);
    const missingCourseIds = courseIds.filter((id: string) => !existingCourseIds.includes(id));
    
    if (missingCourseIds.length > 0) {
      console.log('⚠️ 部分课程不存在:', missingCourseIds);
    }
    
    console.log(`✅ 找到 ${courses.length} 个有效课程`);

    // 批量检查用户的课程访问权限
    console.log('🔐 批量检查课程访问权限...');
    let courseAccesses: any[] = [];
    try {
      courseAccesses = await prisma.courseAccess.findMany({
        where: {
          userId: user.id,
          courseId: { in: existingCourseIds }
        }
      });
      console.log(`📋 找到 ${courseAccesses.length} 条课程访问记录`);
    } catch (error) {
      console.log('⚠️ 查询课程访问记录时出错:', error instanceof Error ? error.message : String(error));
      // 如果表不存在，继续执行
    }

    // 检查用户是否有活跃的平台订阅
    console.log('💳 检查平台订阅状态...');
    let platformSubscription = null;
    try {
      platformSubscription = await prisma.platformSubscription.findFirst({
        where: {
          userId: user.id,
          status: { in: ['active', 'trialing'] }
        }
      });
      console.log('📋 平台订阅状态:', platformSubscription);
    } catch (error) {
      console.log('⚠️ 查询平台订阅时出错:', error instanceof Error ? error.message : String(error));
      // 如果表不存在，继续执行
    }

    // 构建访问权限结果
    const accessResults = existingCourseIds.map((courseId: string) => {
      const course = courses.find((c: any) => c.id === courseId);
      const courseAccess = courseAccesses.find((ca: any) => ca.courseId === courseId);
      
      let hasAccess = false;
      let accessType = 'NONE';
      let expiresAt = null;
      let message = '';

      if (courseAccess) {
        if (courseAccess.accessType === 'SUBSCRIPTION') {
          hasAccess = !!platformSubscription;
          accessType = 'SUBSCRIPTION';
          message = hasAccess ? '订阅用户，永久访问' : '订阅已过期';
        } else if (courseAccess.accessType === 'PURCHASE') {
          hasAccess = courseAccess.expiresAt ? new Date() < courseAccess.expiresAt : false;
          accessType = 'PURCHASE';
          expiresAt = courseAccess.expiresAt;
          message = hasAccess ? '购买用户，有时间限制' : '购买已过期';
        } else if (courseAccess.accessType === 'FREE') {
          hasAccess = true;
          accessType = 'FREE';
          message = '免费课程';
        }
      } else {
        if (platformSubscription) {
          hasAccess = true;
          accessType = 'SUBSCRIPTION';
          message = '平台订阅用户，默认有访问权限';
        } else {
          hasAccess = false;
          accessType = 'NONE';
          message = '无访问权限，需要订阅或购买';
        }
      }

      return {
        courseId,
        hasAccess,
        accessType,
        expiresAt,
        message,
        course: course ? {
          id: course.id,
          title: course.title,
          category: course.category,
          instructor: course.instructor,
        } : null
      };
    });

    const response = {
      accessResults,
      summary: {
        total: existingCourseIds.length,
        accessible: accessResults.filter((r: any) => r.hasAccess).length,
        inaccessible: accessResults.filter((r: any) => !r.hasAccess).length,
        missing: missingCourseIds.length
      },
      subscription: platformSubscription ? {
        status: platformSubscription.status,
        planType: platformSubscription.planType,
        currentPeriodEnd: platformSubscription.currentPeriodEnd,
        trialEnd: platformSubscription.trialEnd,
      } : null,
      timestamp: new Date().toISOString()
    };

    console.log('✅ 批量访问权限检查完成:', response.summary);
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ 批量检查课程访问权限失败:', error);
    
    // 详细的错误信息
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('错误代码:', (error as any).code);
    }
    if (error && typeof error === 'object' && 'meta' in error) {
      console.error('错误元数据:', (error as any).meta);
    }
    
    return NextResponse.json(
      { 
        error: '批量检查访问权限失败',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// 获取用户的所有课程访问权限（GET 方法）
export async function GET(request: NextRequest) {
  console.log('🔍 开始获取用户课程访问权限...');
  
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      console.log('❌ 未授权访问');
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

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

    console.log('✅ 用户找到:', { userId: user.id, userName: user.name });

    // 获取用户的所有课程访问权限
    console.log('📚 获取课程访问权限...');
    let courseAccesses: any[] = [];
    try {
      courseAccesses = await prisma.courseAccess.findMany({
        where: { userId: user.id },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              category: true,
              instructor: true,
              rating: true,
              students: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      console.log(`✅ 找到 ${courseAccesses.length} 条课程访问记录`);
    } catch (error) {
      console.log('⚠️ 查询课程访问记录时出错:', error instanceof Error ? error.message : String(error));
      // 如果表不存在，返回空数组
    }

    // 获取用户的平台订阅状态
    console.log('💳 获取平台订阅状态...');
    let platformSubscription = null;
    try {
      platformSubscription = await prisma.platformSubscription.findFirst({
        where: {
          userId: user.id,
          status: { in: ['active', 'trialing'] }
        }
      });
      console.log('📋 平台订阅状态:', platformSubscription);
    } catch (error) {
      console.log('⚠️ 查询平台订阅时出错:', error instanceof Error ? error.message : String(error));
      // 如果表不存在，继续执行
    }

    // 分类课程访问权限
    const accessByType = {
      subscription: courseAccesses.filter((access: any) => access.accessType === 'SUBSCRIPTION'),
      purchase: courseAccesses.filter((access: any) => access.accessType === 'PURCHASE'),
      free: courseAccesses.filter((access: any) => access.accessType === 'FREE'),
    };

    const response = {
      courseAccesses,
      accessByType,
      hasActiveSubscription: !!platformSubscription,
      subscription: platformSubscription ? {
        status: platformSubscription.status,
        planType: platformSubscription.planType,
        currentPeriodEnd: platformSubscription.currentPeriodEnd,
        trialEnd: platformSubscription.trialEnd,
      } : null,
      summary: {
        total: courseAccesses.length,
        subscription: accessByType.subscription.length,
        purchase: accessByType.purchase.length,
        free: accessByType.free.length
      },
      timestamp: new Date().toISOString()
    };

    console.log('✅ 课程访问权限获取完成');
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ 获取课程访问权限失败:', error);
    
    // 详细的错误信息
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('错误代码:', (error as any).code);
    }
    if (error && typeof error === 'object' && 'meta' in error) {
      console.error('错误元数据:', (error as any).meta);
    }
    
    return NextResponse.json(
      { 
        error: '获取访问权限失败',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
