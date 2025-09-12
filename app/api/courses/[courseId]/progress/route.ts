import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// 获取用户课程进度
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { courseId } = params;
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lessonId');

    if (!lessonId) {
      return NextResponse.json({ error: '缺少课程ID参数' }, { status: 400 });
    }

    // 从数据库获取用户课程进度
    const progress = await prisma.courseProgress.findFirst({
      where: {
        userId: session.user.id,
        courseId: courseId,
        lessonId: parseInt(lessonId)
      }
    });

    return NextResponse.json({
      progress: progress?.progress || 0,
      completed: progress?.isCompleted || false,
      currentTime: progress?.currentTime || 0,
      totalWatched: progress?.totalWatched || 0,
      lastWatched: progress?.lastWatched
    });

  } catch (error) {
    console.error('获取课程进度失败:', error);
    return NextResponse.json({ error: '获取进度失败' }, { status: 500 });
  }
}

// 保存用户课程进度
export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    console.log('🚀 课程进度API被调用');
    
    const session = await auth();
    console.log('👤 用户会话:', { userId: session?.user?.id, email: session?.user?.email });
    
    if (!session?.user?.id) {
      console.log('❌ 用户未授权');
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { courseId } = params;
    const body = await request.json();
    const { lessonId, currentTime, completed = false, totalWatched = 0 } = body;

    console.log('📥 接收到的数据:', { courseId, lessonId, currentTime, completed, totalWatched });

    if (!lessonId || currentTime === undefined) {
      console.log('❌ 缺少必要参数:', { lessonId, currentTime });
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    // 计算进度百分比（这里需要根据课程总时长计算，暂时使用currentTime作为示例）
    const progress = Math.min((currentTime / 3600) * 100, 100); // 假设1小时=100%
    console.log('📊 计算进度:', { currentTime, progress });

    // 先查找是否已存在记录
    console.log('🔍 查找现有进度记录...');
    const existingProgress = await prisma.courseProgress.findFirst({
      where: {
        userId: session.user.id,
        courseId: courseId,
        lessonId: parseInt(lessonId)
      }
    });

    console.log('📋 现有进度记录:', existingProgress ? '存在' : '不存在');

    if (existingProgress) {
      // 更新现有记录
      console.log('🔄 更新现有进度记录...');
      const updatedProgress = await prisma.courseProgress.update({
        where: { id: existingProgress.id },
        data: {
          progress: progress,
          currentTime: currentTime,
          totalWatched: totalWatched,
          lastWatched: new Date(),
          isCompleted: completed,
          completedAt: completed ? new Date() : null
        }
      });
      console.log('✅ 进度记录已更新:', updatedProgress.id);
    } else {
      // 创建新记录
      console.log('➕ 创建新进度记录...');
      const newProgress = await prisma.courseProgress.create({
        data: {
          userId: session.user.id,
          courseId: courseId,
          lessonId: parseInt(lessonId),
          progress: progress,
          currentTime: currentTime,
          totalWatched: totalWatched,
          lastWatched: new Date(),
          isCompleted: completed,
          completedAt: completed ? new Date() : null
        }
      });
      console.log('✅ 新进度记录已创建:', newProgress.id);
    }

    console.log('🎉 进度保存完成');
    return NextResponse.json({ 
      success: true, 
      message: '进度已保存'
    });

  } catch (error) {
    console.error('保存课程进度失败:', error);
    return NextResponse.json({ error: '保存进度失败' }, { status: 500 });
  }
}
