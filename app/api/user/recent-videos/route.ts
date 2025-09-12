import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// 获取用户最近观看的视频
export async function GET(request: NextRequest) {
  try {
    console.log('🎬 获取最近观看视频API被调用');
    
    const session = await auth();
    console.log('👤 用户会话:', { userId: session?.user?.id, email: session?.user?.email });
    
    if (!session?.user?.id) {
      console.log('❌ 用户未授权');
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    console.log('📊 查询参数:', { limit });

    // 获取用户最近观看的课程进度
    console.log('🔍 开始查询最近观看的课程进度...');
    
    // 先获取所有进度记录，然后在应用层过滤
    const allProgress = await prisma.courseProgress.findMany({
      where: {
        userId: session.user.id,
        currentTime: {
          gt: 0
        }
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            category: true,
            instructor: true,
            rating: true
          }
        }
      },
      orderBy: { lastWatched: 'desc' },
      take: limit * 2 // 获取更多记录以便过滤
    });
    
    // 过滤掉lastWatched为null的记录
    const recentProgress = allProgress.filter(progress => progress.lastWatched !== null).slice(0, limit);
    
    console.log('📋 查询结果:', { 
      totalFound: allProgress.length, 
      filteredCount: recentProgress.length 
    });

    // 转换为视频格式（这里假设每个课程有多个视频，实际可能需要根据课程结构调整）
    const recentVideos = recentProgress.map(progress => ({
      id: `${progress.courseId}-${progress.lessonId || 'default'}`,
      courseId: progress.courseId,
      lessonId: progress.lessonId,
      title: progress.course.title,
      category: progress.course.category,
      instructor: progress.course.instructor,
      rating: progress.course.rating,
      progress: progress.progress,
      currentTime: progress.currentTime,
      lastWatched: progress.lastWatched,
      isCompleted: progress.isCompleted,
      completedAt: progress.completedAt
    }));

    return NextResponse.json({
      videos: recentVideos,
      total: recentVideos.length
    });

  } catch (error) {
    console.error('获取最近观看视频失败:', error);
    return NextResponse.json({ error: '获取最近观看视频失败' }, { status: 500 });
  }
}
