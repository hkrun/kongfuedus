"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  category: string;
  instructor: string;
  rating: number;
  students: number;
  progress: number;
  currentTime: number;
  lastWatched?: string;
  isCompleted: boolean;
  completedAt?: string;
  accessType: 'subscription' | 'purchase';
  expiresAt?: string;
  purchaseDate?: string;
}

interface CoursesResponse {
  courses: Course[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  subscription: {
    status: string;
    planType: string;
    currentPeriodEnd: string;
  } | null;
}

interface PurchasedCoursesListProps {
  limit?: number;
}

export default function PurchasedCoursesList({ limit }: PurchasedCoursesListProps) {
  const [data, setData] = useState<CoursesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchCourses();
  }, [currentPage, limit]);

  const fetchCourses = async () => {
    try {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      params.append('page', currentPage.toString());

      const response = await fetch(`/api/user/courses?${params}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('获取课程列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
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
              <div key={i} className="border rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.courses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {limit ? '我的课程' : '已购买课程'}
        </h3>
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <p className="text-gray-500 mb-4">还没有购买任何课程</p>
          <Link
            href="/courses"
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white font-medium rounded-md hover:bg-orange-600 transition-colors duration-200"
          >
            浏览课程
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {limit ? '我的课程' : '已购买课程'}
        </h3>
        {data.subscription && (
          <span className="text-sm text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
            订阅用户
          </span>
        )}
      </div>

      <div className="space-y-4">
        {data.courses.map((course) => (
          <Link
            key={course.id}
            href={`/courses/${course.id}`}
            className="block border border-gray-200 rounded-lg p-4 hover:border-orange-300 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">{course.title}</h4>
                <p className="text-sm text-gray-600 mb-2">
                  {course.instructor} • {course.category}
                </p>
                
                {/* 进度条 */}
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>学习进度</span>
                    <span>{Math.round(course.progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(course.progress)}`}
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* 课程信息 */}
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <span className="mr-1">⭐</span>
                    {course.rating.toFixed(1)}
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">👥</span>
                    {course.students}
                  </div>
                  {course.lastWatched && (
                    <div className="flex items-center">
                      <span className="mr-1">🕒</span>
                      最后观看: {formatDate(course.lastWatched)}
                    </div>
                  )}
                </div>
              </div>

              <div className="ml-4 text-right">
                {course.isCompleted ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✅ 已完成
                  </span>
                ) : course.progress > 0 ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    📖 学习中
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    📝 未开始
                  </span>
                )}
                
                {course.accessType === 'purchase' && course.expiresAt && (
                  <div className="mt-2 text-xs text-gray-500">
                    到期: {formatDate(course.expiresAt)}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 分页 */}
      {!limit && data.pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            显示第 {(currentPage - 1) * data.pagination.limit + 1} - {Math.min(currentPage * data.pagination.limit, data.pagination.total)} 条，
            共 {data.pagination.total} 条
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            <span className="px-3 py-1 text-sm text-gray-700">
              {currentPage} / {data.pagination.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(data.pagination.totalPages, prev + 1))}
              disabled={currentPage === data.pagination.totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      )}

      {/* 查看更多按钮 */}
      {limit && data.pagination.total > limit && (
        <div className="mt-4 text-center">
          <Link
            href="/my?tab=courses"
            className="text-orange-600 hover:text-orange-700 text-sm font-medium"
          >
            查看全部课程 ({data.pagination.total})
          </Link>
        </div>
      )}
    </div>
  );
}
