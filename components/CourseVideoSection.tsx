import React, { useState, useEffect } from 'react';
import VideoPlayer from './VideoPlayer';
import { getMultiLangContent, getLocaleFromPath, SupportedLocale } from '../utils/i18n';
import { playVideo, completeVideo } from '../lib/analytics';

interface Lesson {
  id: number;
  title: any; // 支持多语言对象
  duration: number;
  description: any; // 支持多语言对象
  videoUrl: string;
  isPreview: boolean;
}

interface Chapter {
  id: number;
  title: any; // 支持多语言对象
  description: any; // 支持多语言对象
  lessons: Lesson[];
}

interface CourseVideoSectionProps {
  course: any;
  chapters: Chapter[];
  currentPlayingLesson?: { chapterId: number, lessonId: number } | null;
  onLessonChange?: (chapterId: number, lessonId: number) => void;
}

const CourseVideoSection: React.FC<CourseVideoSectionProps> = ({ course, chapters, currentPlayingLesson, onLessonChange }) => {
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<number[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentLocale, setCurrentLocale] = useState<SupportedLocale>('zh');
  
  // 获取当前语言
  useEffect(() => {
    const locale = getLocaleFromPath(window.location.pathname);
    setCurrentLocale(locale);
  }, []);

  // 初始化：自动选择第一章节第一节课（仅在首次加载时）
  useEffect(() => {
    console.log('🔄 CourseVideoSection 初始化检查:', { 
      chaptersLength: chapters?.length, 
      isInitialized,
      courseId: course?.id 
    });
    
    if (chapters && chapters.length > 0 && !isInitialized) {
      const firstChapter = chapters[0];
      if (firstChapter && firstChapter.lessons && firstChapter.lessons.length > 0) {
        const firstLesson = firstChapter.lessons[0];
        console.log('📚 选择第一节课:', { 
          chapterTitle: firstChapter.title,
          lessonTitle: firstLesson.title,
          lessonId: firstLesson.id,
          courseId: course?.id
        });
        
        setCurrentChapter(firstChapter);
        setCurrentLesson(firstLesson);
        setExpandedChapters([firstChapter.id]);
        setIsInitialized(true);
        console.log('✅ 自动选择第一节课:', firstLesson.title);
        
        // 通知父组件第一节课正在播放
        if (onLessonChange) {
          onLessonChange(firstChapter.id, firstLesson.id);
        }
      }
    }
  }, [chapters, onLessonChange, isInitialized, course?.id]);

  // 响应外部课程变化（从课程大纲TAB点击）
  useEffect(() => {
    console.log('🔄 CourseVideoSection 收到课程变化:', { 
      currentPlayingLesson, 
      chaptersLength: chapters?.length,
      expandedChapters,
      isInitialized
    });
    
    // 只有在初始化完成后才响应外部课程变化
    if (currentPlayingLesson && chapters && chapters.length > 0 && isInitialized) {
      const { chapterId, lessonId } = currentPlayingLesson;
      const targetChapter = chapters.find(chapter => chapter.id === chapterId);
      
      console.log('🎯 查找目标课程:', { 
        chapterId, 
        lessonId, 
        targetChapter: targetChapter?.title,
        lessonsCount: targetChapter?.lessons?.length,
        availableChapters: chapters.map(c => ({ id: c.id, title: c.title }))
      });
      
      if (targetChapter && targetChapter.lessons) {
        const targetLesson = targetChapter.lessons.find(lesson => lesson.id === lessonId);
        
        if (targetLesson) {
          console.log('✅ 找到目标课程，开始切换:', { 
            chapterId, 
            lessonId, 
            lessonTitle: targetLesson.title,
            videoUrl: targetLesson.videoUrl,
            currentLessonId: currentLesson?.id
          });
          
          setCurrentChapter(targetChapter);
          setCurrentLesson(targetLesson);
          
          // 确保章节展开
          if (!expandedChapters.includes(targetChapter.id)) {
            setExpandedChapters(prev => [...prev, targetChapter.id]);
          }
        } else {
          console.log('❌ 未找到目标课程:', { lessonId, availableLessons: targetChapter.lessons.map(l => l.id) });
        }
      }
    }
  }, [currentPlayingLesson, chapters, expandedChapters, isInitialized]);

  // 只在课程变化时打印日志和跟踪视频播放
  useEffect(() => {
    if (currentLesson && course) {
      console.log('🎬 开始播放课程:', { 
        lessonTitle: currentLesson.title, 
        videoUrl: currentLesson.videoUrl,
        lessonId: currentLesson.id,
        chapterId: currentChapter?.id
      });
      
      // 跟踪视频播放事件
      playVideo(currentLesson.id.toString(), course.id);
    }
  }, [currentLesson?.id, course?.id]);

  // 切换章节展开状态
  const toggleChapter = (chapterId: number) => {
    setExpandedChapters(prev => 
      prev.includes(chapterId) 
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  // 选择课程
  const selectLesson = (chapter: Chapter, lesson: Lesson) => {
    setCurrentChapter(chapter);
    setCurrentLesson(lesson);
    
    // 确保章节展开
    if (!expandedChapters.includes(chapter.id)) {
      setExpandedChapters(prev => [...prev, chapter.id]);
    }
    
    // 通知父组件课程变化
    if (onLessonChange) {
      onLessonChange(chapter.id, lesson.id);
    }
  };

  // 视频播放结束
  const handleVideoEnd = () => {
    console.log(`课程 ${currentLesson?.id} 播放完成`);
    
    // 跟踪视频完成事件
    if (currentLesson && course) {
      completeVideo(currentLesson.id.toString(), course.id, 100);
    }
    
    // 可以在这里自动播放下一个课程或显示完成提示
  };

  if (!currentLesson) {
    console.log('CourseVideoSection: currentLesson is null', { chapters, currentPlayingLesson });
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="w-full">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="relative w-full bg-black rounded-xl shadow-md overflow-hidden" style={{ aspectRatio: '16/9' }}>
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                  <p className="text-white text-lg font-medium mb-2">加载课程中...</p>
                  <p className="text-gray-300 text-sm">调试信息: chapters={chapters?.length || 0}</p>
                  <p className="text-gray-300 text-xs mt-1">currentPlayingLesson={JSON.stringify(currentPlayingLesson)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* 视频播放区域 */}
      <div className="w-full">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <VideoPlayer
            key={`lesson-${currentLesson.id}`} // 添加key强制重新渲染
            videoUrl={currentLesson.videoUrl}
            videoId={`lesson-${currentLesson.id}`}
            courseId={course.id}
            lessonId={currentLesson.id}
            title={getMultiLangContent(currentLesson.title, currentLocale)}
            onVideoEnd={handleVideoEnd}
            subtitles={[
              {
                src: `/subtitles/${course.id}/zh/lesson-${currentLesson.id}.vtt`,
                label: '中文',
                srclang: 'zh'
              },
              {
                src: `/subtitles/${course.id}/en/lesson-${currentLesson.id}.vtt`,
                label: 'English',
                srclang: 'en'
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseVideoSection;

