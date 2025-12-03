"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from 'next-intl';

interface Video {
  id: string;
  courseId: string;
  lessonId?: number;
  title: string;
  category: string;
  instructor: string;
  rating: number;
  progress: number;
  currentTime: number;
  lastWatched: string;
  isCompleted: boolean;
  completedAt?: string;
}

interface RecentVideosResponse {
  videos: Video[];
  total: number;
}

interface RecentVideosListProps {
  limit?: number;
}

export default function RecentVideosList({ limit }: RecentVideosListProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [data, setData] = useState<RecentVideosResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentVideos();
  }, [limit]);

  const fetchRecentVideos = async () => {
    try {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());

      const response = await fetch(`/api/user/recent-videos?${params}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('获取最近观看视频失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return t('myPage.recent.justNow');
    } else if (diffInHours < 24) {
      return t('myPage.recent.hoursAgo', { hours: diffInHours });
    } else if (diffInHours < 48) {
      return t('myPage.recent.yesterday');
    } else {
      const localeMap: { [key: string]: string } = {
        'zh': 'zh-CN',
        'ja': 'ja-JP',
        'ko': 'ko-KR',
        'de': 'de-DE',
        'fr': 'fr-FR',
        'ar': 'ar-SA',
        'en': 'en-US'
      };
      return date.toLocaleDateString(localeMap[locale] || 'en-US');
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(limit || 3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-16 h-12 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.videos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {limit ? t('myPage.recent.recentWatched') : t('myPage.recent.recentVideos')}
        </h3>
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">🎬</div>
          <p className="text-gray-500 mb-4">{t('myPage.recent.noVideosYet')}</p>
          <Link
            href={`/${locale}/courses`}
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white font-medium rounded-md hover:bg-orange-600 transition-colors duration-200"
          >
            {t('myPage.recent.startLearning')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {limit ? t('myPage.recent.recentWatched') : t('myPage.recent.recentVideos')}
        </h3>
        {!limit && (
          <span className="text-sm text-gray-500">
            {t('myPage.recent.totalVideos', { total: data.total })}
          </span>
        )}
      </div>

      <div className="space-y-4">
        {data.videos.map((video) => (
          <Link
            key={video.id}
            href={`/${locale}/courses/${video.courseId}${video.lessonId ? `?lesson=${video.lessonId}` : ''}`}
            className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg hover:border-orange-300 hover:shadow-md transition-all duration-200"
          >
            {/* 视频缩略图占位符 */}
            <div className="w-16 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg">▶</span>
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 truncate mb-1">
                {video.title}
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                {video.instructor} • {video.category}
              </p>
              
              {/* 进度条 */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>{t('myPage.recent.watchProgress')}</span>
                  <span>{Math.round(video.progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${getProgressColor(video.progress)}`}
                    style={{ width: `${video.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* 视频信息 */}
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center">
                  <span className="mr-1">🕒</span>
                  {formatTime(video.currentTime)}
                </div>
                <div className="flex items-center">
                  <span className="mr-1">📅</span>
                  {formatDate(video.lastWatched)}
                </div>
                {video.isCompleted && (
                  <div className="flex items-center text-green-600">
                    <span className="mr-1">✅</span>
                    {t('myPage.courses.completed')}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-shrink-0">
              {video.isCompleted ? (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✅ {t('myPage.courses.completed')}
                </span>
              ) : video.progress > 0 ? (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  📖 {t('myPage.recent.continueWatching')}
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  ▶ {t('myPage.recent.startWatching')}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* 查看更多按钮 */}
      {limit && data.total > limit && (
        <div className="mt-4 text-center">
          <Link
            href={`/${locale}/my?tab=recent`}
            className="text-orange-600 hover:text-orange-700 text-sm font-medium"
          >
            {t('myPage.recent.viewAllVideos', { total: data.total })}
          </Link>
        </div>
      )}
    </div>
  );
}
