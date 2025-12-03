"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from 'next-intl';
import Header from "../../../../components/Header";
import FreeTrialButton from "../../../../components/FreeTrialButton";
import PurchaseButton from "../../../../components/PurchaseButton";
import MilestoneTimeline from "../../../../components/MilestoneTimeline";
import CourseVideoSection from "../../../../components/CourseVideoSection";
import { useSubmission } from "../../../../hooks/useSubmission";
import { getMultiLangContent, getMultiLangArrayContent, getLocaleFromPath, SupportedLocale } from "../../../../utils/i18n";
import { viewCourse } from "../../../../lib/analytics";
// 移除导入，因为现在使用API调用

export default function CourseDetailPage({ params }: { params: { courseId: string } }) {
  const t = useTranslations();
  // 渲染计数器，用于调试重复渲染问题
  const renderCount = useRef(0);
  renderCount.current += 1;
  
  // 获取当前语言
  const [currentLocale, setCurrentLocale] = useState<SupportedLocale>('zh');
  
  useEffect(() => {
    const locale = getLocaleFromPath(window.location.pathname);
    setCurrentLocale(locale);
  }, []);
  const { data: session, status } = useSession();
  const [course, setCourse] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedModules, setExpandedModules] = useState<number[]>([0]);
  const [showReviews, setShowReviews] = useState(true);
  const [currentPlayingLesson, setCurrentPlayingLesson] = useState<{chapterId: number, lessonId: number} | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [courseAccess, setCourseAccess] = useState<any>(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  // 稳定化onLessonChange回调函数，避免不必要的重新渲染
  const handleLessonChange = useCallback((chapterId: number, lessonId: number) => {
    setCurrentPlayingLesson({ chapterId, lessonId });
  }, []);

  // 获取课程访问权限
  useEffect(() => {
    const fetchCourseAccess = async () => {
      setIsCheckingAccess(true);
      
      if (!session?.user?.id) {
        setCourseAccess({ hasAccess: false, accessType: 'none', reason: '未登录' });
        setIsCheckingAccess(false);
        return;
      }

      try {
        const response = await fetch(`/api/courses/${params.courseId}/access`);
        const data = await response.json();
        setCourseAccess(data);
      } catch (error) {
        console.error('获取课程访问权限失败:', error);
        setCourseAccess({ hasAccess: false, accessType: 'none', reason: '检查失败' });
      } finally {
        setIsCheckingAccess(false);
      }
    };

    fetchCourseAccess();
  }, [session?.user?.id, params.courseId]);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    content: ''
  });
  
  // 讨论浮层状态
  const [showDiscussionModal, setShowDiscussionModal] = useState(false);
  const [discussionForm, setDiscussionForm] = useState({
    content: ''
  });
  
  // 回复浮层状态
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyForm, setReplyForm] = useState({
    content: '',
    discussionId: ''
  });
  
  // 防重复提交
  const discussionSubmission = useSubmission({
    onSuccess: () => {
      setShowDiscussionModal(false);
      setDiscussionForm({ content: '' });
    }
  });
  
  const replySubmission = useSubmission({
    onSuccess: () => {
      setShowReplyModal(false);
      setReplyForm({ content: '', discussionId: '' });
    }
  });
  
  const reviewSubmission = useSubmission({
    onSuccess: () => {
      setShowReviewModal(false);
      setReviewForm({ rating: 5, content: '' });
    }
  });
  
  // 点赞防重复提交
  const [likingDiscussionId, setLikingDiscussionId] = useState<string | null>(null);
  const [likeDebounceMap, setLikeDebounceMap] = useState<Map<string, NodeJS.Timeout>>(new Map());
  
  // 动态数据状态
  const [reviews, setReviews] = useState<any[]>([]);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 如果用户已登录，自动显示评价内容
  useEffect(() => {
    if (session?.user && !showReviews) {
      setShowReviews(true);
    }
  }, [session]); // 移除 showReviews 依赖，避免循环

  // TAB切换时的懒加载逻辑
  useEffect(() => {
    const loadTabData = async () => {
      if (activeTab === 'reviews' && reviews.length === 0) {
        console.log('切换到评价TAB，开始加载评论数据');
        const reviewsData = await fetchWithCache(`/api/courses/${params.courseId}/reviews`, 'reviews', 'reviews');
        if (reviewsData) {
          setReviews(reviewsData);
        }
      }
      
      if (activeTab === 'discussions' && discussions.length === 0) {
        console.log('切换到讨论TAB，开始加载讨论数据');
        const discussionsData = await fetchWithCache(`/api/courses/${params.courseId}/discussions`, 'discussions', 'discussions');
        if (discussionsData) {
          setDiscussions(discussionsData);
        }
      }
    };
    
    loadTabData();
  }, [activeTab, params.courseId]);
  
  // 支付状态
  const [paymentStatus, setPaymentStatus] = useState<{
    success?: string;
    canceled?: boolean;
  }>({});
  
  // 优化的API调用函数
  const fetchWithCache = async (
    endpoint: string,
    cacheKey: 'reviews' | 'discussions' | 'access',
    inProgressKey: 'reviews' | 'discussions' | 'access',
    abortController?: AbortController
  ): Promise<any> => {
    // 检查是否正在调用中
    if (apiCallInProgressRef.current[inProgressKey]) {
      console.log(`API调用 ${endpoint} 正在进行中，跳过重复调用`);
      return null;
    }

    // 检查缓存（访问权限30分钟，评论和讨论10分钟）
    const cache = apiCacheRef.current;
    const now = Date.now();
    const cacheTime = cacheKey === 'access' ? 30 * 60 * 1000 : 10 * 60 * 1000; // 访问权限30分钟，评论讨论10分钟
    const lastFetchKey = `${cacheKey}LastFetch` as keyof typeof cache;
    
    if (cache[cacheKey] && cache[lastFetchKey] && (now - (cache[lastFetchKey] as number)) < cacheTime) {
      console.log(`使用缓存数据: ${endpoint}`);
      return cache[cacheKey];
    }

    try {
      apiCallInProgressRef.current[inProgressKey] = true;
      console.log(`开始API调用: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        signal: abortController?.signal
      });
      
      if (response.ok) {
        const data = await response.json();
        // 更新缓存
        cache[cacheKey] = data;
        cache[lastFetchKey] = now;
        console.log(`API调用成功: ${endpoint}`);
        return data;
      } else {
        console.error(`API调用失败: ${endpoint}`, response.status);
        return null;
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log(`API调用被取消: ${endpoint}`);
      } else {
        console.error(`API调用出错: ${endpoint}`, error);
      }
      return null;
    } finally {
      apiCallInProgressRef.current[inProgressKey] = false;
    }
  };

  // 检查课程访问权限
  const checkCourseAccess = async (abortController?: AbortController) => {
    const accessStatus = await fetchWithCache(
      `/api/courses/${params.courseId}/access`,
      'access',
      'access',
      abortController
    );
    
    if (accessStatus) {
      setCourseAccess(accessStatus);
    }
  };
  
  // 处理支付成功
  const handlePaymentSuccess = (successType: 'trial' | 'one-time') => {
    setPaymentStatus({
      success: successType,
      canceled: false
    });
    
    // 清除访问权限缓存，强制重新获取
    apiCacheRef.current.access = undefined;
    apiCacheRef.current.accessLastFetch = undefined;
    
    // 重新检查课程访问权限
    checkCourseAccess();
  };
  

  // 使用 useRef 防止重复调用访问接口
  const accessCheckedRef = useRef(false);
  const isMountedRef = useRef(true);
  const lastCourseIdRef = useRef<string>('');
  
  // API调用缓存和防重复机制
  const apiCacheRef = useRef<{
    reviews?: any[];
    discussions?: any[];
    access?: any;
    reviewsLastFetch?: number;
    discussionsLastFetch?: number;
    accessLastFetch?: number;
  }>({});
  
  const apiCallInProgressRef = useRef<{
    reviews: boolean;
    discussions: boolean;
    access: boolean;
  }>({ reviews: false, discussions: false, access: false });

  // 计算评价统计数据
  const calculateReviewStats = (reviews: any[]) => {
    if (!reviews || reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        ratingPercentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }

    const totalReviews = reviews.length;
    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    // 统计各星级数量
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        ratingCounts[review.rating as keyof typeof ratingCounts]++;
      }
    });

    // 计算百分比
    const ratingPercentages = {
      5: Math.round((ratingCounts[5] / totalReviews) * 100),
      4: Math.round((ratingCounts[4] / totalReviews) * 100),
      3: Math.round((ratingCounts[3] / totalReviews) * 100),
      2: Math.round((ratingCounts[2] / totalReviews) * 100),
      1: Math.round((ratingCounts[1] / totalReviews) * 100)
    };

    // 计算平均评分
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / totalReviews;

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10, // 保留一位小数
      ratingDistribution: ratingCounts,
      ratingPercentages
    };
  };

  // 使用 useMemo 缓存评价统计数据，避免每次渲染都重新计算
  const reviewStats = useMemo(() => calculateReviewStats(reviews), [reviews]);

  // 使用 useMemo 缓存课程数据模块，避免重复导入
  const coursesModuleRef = useRef<any>(null);
  
  useEffect(() => {
    const loadCourseData = async () => {
      try {
        setLoading(true);
        
        // 如果课程ID变化，清理缓存
        if (lastCourseIdRef.current !== params.courseId) {
          console.log('课程ID变化，清理API缓存');
          apiCacheRef.current = {};
          lastCourseIdRef.current = params.courseId;
        }
        
        // 导入课程数据
        const coursesModule = await import('../../../../data/courses/index');
        const { getCourseDetailById, courses: allCourses } = coursesModule;
        
        // 获取课程详情
        const courseDetail = getCourseDetailById(params.courseId);
        
        if (courseDetail) {
          setCourse(courseDetail);
          setCourses(allCourses);
          console.log('课程数据加载成功:', courseDetail.title);
          
          // 跟踪课程浏览
          const courseName = getMultiLangContent(courseDetail.title, currentLocale);
          const category = getMultiLangContent(courseDetail.category, currentLocale);
          viewCourse(params.courseId, courseName, category);
        } else {
          console.error('课程未找到:', params.courseId);
        }
        
        setLoading(false);
        
        // 只加载访问权限数据（评论和讨论在TAB切换时懒加载）
        const accessData = await fetchWithCache(`/api/courses/${params.courseId}/access`, 'access', 'access');
        
        // 更新访问权限状态
        if (accessData) {
          setCourseAccess(accessData);
        }
        
      } catch (error) {
        console.error('课程数据加载失败:', error);
        setLoading(false);
      }
    };
    
    loadCourseData();
  }, [params.courseId]);

  // 处理URL参数中的支付状态
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const canceled = urlParams.get('canceled');
    
    if (success || canceled) {
      setPaymentStatus({ 
        success: success || undefined,
        canceled: canceled === 'true'
      });
      
      // 清除URL参数，避免刷新页面时重复显示
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('courseDetail.loading')}</h2>
          <p className="text-gray-600">{t('courseDetail.loadingCourse')}</p>
        </div>
      </div>
    );
  }

  if (!course) {
    console.log('渲染时课程数据为空，显示错误页面');
    console.log('当前状态 - loading:', loading, 'course:', course);
    console.log('课程ID参数:', params.courseId);
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('courseDetail.courseNotFound')}</h1>
          <p className="text-gray-600 mb-6">{t('courseDetail.courseNotFoundDesc')}</p>
          <p className="text-sm text-gray-500 mb-4">课程ID: {params.courseId}</p>
          <Link href="/courses" className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors">
            {t('courseDetail.backToCourses')}
          </Link>
        </div>
      </div>
    );
  }





  const toggleModule = (index: number) => {
    setExpandedModules(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <main>
      <Header />
      
      {/* 支付状态提示 */}
      {paymentStatus.success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                {paymentStatus.success === 'trial' 
                  ? t('courseDetail.payment.trialSuccess')
                  : paymentStatus.success === 'one-time'
                  ? t('courseDetail.payment.purchaseSuccess')
                  : t('courseDetail.payment.subscriptionSuccess')
                }
              </p>
            </div>
          </div>
        </div>
      )}
      
      {paymentStatus.canceled && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                {t('courseDetail.payment.paymentCanceled')}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="text-sm text-gray-500">
            <Link href="/" className="hover:text-orange-500 transition-all duration-300">{t('courseDetail.breadcrumb.home')}</Link>
            <span className="mx-2">/</span>
            <Link href="/courses" className="hover:text-orange-500 transition-all duration-300">{t('courseDetail.breadcrumb.courses')}</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-700">{getMultiLangContent(course.title, currentLocale)}</span>
                 </div>
                 </div>
               </div>
              
      {/* Course Header Section */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Course Video Section */}
            <div className="lg:col-span-3">
              <CourseVideoSection 
                course={course} 
                chapters={course.chapters}
                currentPlayingLesson={currentPlayingLesson}
                onLessonChange={handleLessonChange}
              />
              
              <h1 className="font-bold text-[clamp(1.8rem,3vw,2.5rem)] text-[#1a365d] mb-3">{getMultiLangContent(course.title, currentLocale)}</h1>
              
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center">
                  <div className="flex text-yellow-400 mr-2">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className={`fa fa-star ${i < Math.floor(reviewStats.averageRating) ? '' : 'fa-star-o'}`}></i>
                    ))}
                  </div>
                  <span className="text-gray-600">({reviewStats.totalReviews} {t('courseDetail.stats.reviews')})</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <i className="fa fa-users mr-2"></i>
                  <span>{course.students} {t('courseDetail.stats.students')}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <i className="fa fa-calendar mr-2"></i>
                  <span>{t('courseDetail.stats.lastUpdated')}: June 2024</span>
                </div>
              </div>
              
              <p className="text-gray-700 text-lg mb-6">{getMultiLangContent(course.description, currentLocale)}</p>
              
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-[#1a365d]/10 text-[#1a365d] px-3 py-1 rounded-full text-sm font-medium">{t('courseDetail.tags.kungfu')}</span>
                <span className="bg-[#1a365d]/10 text-[#1a365d] px-3 py-1 rounded-full text-sm font-medium">{t('courseDetail.tags.martialArts')}</span>
                <span className="bg-[#1a365d]/10 text-[#1a365d] px-3 py-1 rounded-full text-sm font-medium">{t('courseDetail.tags.selfDefense')}</span>
                <span className="bg-[#1a365d]/10 text-[#1a365d] px-3 py-1 rounded-full text-sm font-medium">{t('courseDetail.tags.fitness')}</span>
                <span className="bg-[#1a365d]/10 text-[#1a365d] px-3 py-1 rounded-full text-sm font-medium">{getMultiLangContent(course.difficulty, currentLocale)}</span>
              </div>
            </div>
            
            {/* Course Purchase Card */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-xl shadow-md p-6 sticky top-24">
                {/* 价格信息 - 所有用户都能看到 */}
                <div className="mb-6">
                  <div className="flex items-baseline mb-2">
                    <span className="text-4xl font-bold text-[#1a365d]">{course.price}</span>
                    <span className="text-gray-500 line-through ml-3">{course.originalPrice}</span>
                    <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded ml-3">{course.discount}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{t('courseDetail.purchase.lifetimeAccess')} • {t('courseDetail.purchase.validity')} • {t('courseDetail.purchase.certificate')}</p>
                </div>
                
                {courseAccess?.hasAccess ? (
                  // 用户已有访问权限 - 显示课程内容和访问状态
                  <div>
                    <div className="mb-6 text-center">
                      <div className="bg-green-100 text-green-800 text-sm font-medium px-3 py-2 rounded-full mb-3">
                        {courseAccess?.accessType === 'subscription' && '✅ ' + t('courseDetail.purchase.subscriptionMember')}
                        {courseAccess?.accessType === 'purchase' && '✅ ' + t('courseDetail.purchase.purchased')}
                        {courseAccess?.accessType === 'trial' && '✅ ' + t('courseDetail.purchase.trialPeriod')}
                      </div>
                      {courseAccess?.purchase?.expiresAt && (
                        <p className="text-gray-600 text-sm">
                          {t('courseDetail.purchase.validUntil')}: {new Date(courseAccess?.purchase?.expiresAt).toLocaleDateString('zh-CN')}
                        </p>
                      )}
                    </div>
                    
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="font-semibold text-gray-800 mb-3">{t('courseDetail.purchase.courseIncludes')}：</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <i className="fa fa-video-camera text-[#ed8936] mt-1 mr-3"></i>
                          <span>{course.chapters.reduce((total: number, chapter: any) => total + chapter.lessons.length, 0)} {t('courseDetail.purchase.videoLessons')} ({Math.round(course.chapters.reduce((total: number, chapter: any) => total + chapter.totalDuration, 0) / 60 * 10) / 10} {t('courseDetail.stats.hours')})</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fa fa-mobile text-[#ed8936] mt-1 mr-3 text-lg"></i>
                          <span>{t('courseDetail.purchase.mobileAccess')}</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fa fa-comments text-[#ed8936] mt-1 mr-3"></i>
                          <span>{t('courseDetail.purchase.whatsappAccess')}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  // 用户没有访问权限 - 显示购买选项
                  <>
                    <div className="space-y-4 mb-6">
                      {session?.user ? (
                        isCheckingAccess ? (
                          // 加载状态
                          <div className="text-center py-8 transition-all duration-300 ease-in-out">
                            <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-lg">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500 mr-3"></div>
                              <span className="text-gray-600 font-medium">{t('courseDetail.purchase.checkingAccess')}</span>
                            </div>
                          </div>
                        ) : courseAccess?.hasAccess ? (
                          <div className="space-y-4 transition-all duration-300 ease-in-out">
                            {/* 购买状态卡片 */}
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                              <div className="flex items-start">
                                <div className="flex-shrink-0">
                                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                </div>
                                <div className="ml-4 flex-1">
                                  <h3 className="text-lg font-semibold text-green-800 mb-1">
                                    {courseAccess?.accessType === 'subscription' ? '🎉 订阅会员' : '✅ 已购买'}
                                  </h3>
                                  <p className="text-green-700 mb-3">
                                    {courseAccess?.accessType === 'subscription' 
                                      ? '您可以访问平台所有课程内容' 
                                      : '您可以访问此课程的所有内容'
                                    }
                                  </p>
                                  
                                  {/* 购买详情 */}
                                  {courseAccess?.accessType === 'purchase' && courseAccess?.purchase && (
                                    <div className="bg-white/60 rounded-md p-3 mb-3">
                                      <div className="text-sm text-green-800">
                                        <div className="flex justify-between mb-1">
                                          <span>购买时间：</span>
                                          <span>{new Date(courseAccess.purchase.purchaseDate).toLocaleDateString('zh-CN')}</span>
                                        </div>
                                        <div className="flex justify-between mb-1">
                                          <span>到期时间：</span>
                                          <span>{new Date(courseAccess.purchase.expiresAt).toLocaleDateString('zh-CN')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>支付金额：</span>
                                          <span className="font-semibold">¥{courseAccess.purchase.amount}</span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* 订阅详情 */}
                                  {courseAccess?.accessType === 'subscription' && courseAccess?.subscription && (
                                    <div className="bg-white/60 rounded-md p-3 mb-3">
                                      <div className="text-sm text-green-800">
                                        <div className="flex justify-between mb-1">
                                          <span>订阅类型：</span>
                                          <span className="font-semibold">
                                            {courseAccess.subscription.planType === 'FREE_TRIAL' ? '免费试用' : '正式订阅'}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>到期时间：</span>
                                          <span>{new Date(courseAccess.subscription.currentPeriodEnd).toLocaleDateString('zh-CN')}</span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* 继续学习按钮 */}
                            <button
                              onClick={() => {
                                // 滚动到课程内容区域
                                const courseContent = document.querySelector('.course-content');
                                if (courseContent) {
                                  courseContent.scrollIntoView({ behavior: 'smooth' });
                                }
                              }}
                              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-md hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                              <i className="fa fa-play-circle mr-2"></i>
                              {t('courseDetail.purchase.continueLearning')}
                            </button>
                            
                            {/* 分享课程按钮 */}
                            <button
                              onClick={() => {
                                if (navigator.share) {
                                  navigator.share({
                                    title: course?.title,
                                    text: `我正在学习《${course?.title}》课程，推荐给你！`,
                                    url: window.location.href
                                  });
                                } else {
                                  // 复制链接到剪贴板
                                  navigator.clipboard.writeText(window.location.href);
                                  alert('课程链接已复制到剪贴板！');
                                }
                              }}
                              className="w-full py-2 bg-white border-2 border-green-200 text-green-700 font-medium rounded-md hover:bg-green-50 hover:border-green-300 transition-all duration-300"
                            >
                              <i className="fa fa-share-alt mr-2"></i>
                              {t('courseDetail.purchase.shareCourse')}
                            </button>
                          </div>
                        ) : (
                          <div className="transition-all duration-300 ease-in-out space-y-3">
                            <PurchaseButton 
                              courseId={params.courseId} 
                              courseTitle={course?.title}
                              price={course?.price}
                              onPaymentSuccess={handlePaymentSuccess}
                            />
                            
                            <FreeTrialButton 
                              courseId={params.courseId} 
                              courseTitle={course?.title}
                              price="免费试用"
                              onPaymentSuccess={handlePaymentSuccess}
                            />
                          </div>
                        )
                      ) : (
                        <Link 
                          href={`/auth/login?callbackUrl=${encodeURIComponent(`/courses/${params.courseId}`)}`}
                          className="block w-full py-3 bg-[#ed8936] text-white text-center font-semibold rounded-md hover:bg-[#ed8936]/90 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                        >
                          {t('courseDetail.purchase.loginToExperience')}
                        </Link>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-center text-gray-600 text-sm mb-6">
                      <i className="fa fa-credit-card mr-2"></i>
                      <span>{t('courseDetail.purchase.subscriptionCancelable')}</span>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="font-semibold text-gray-800 mb-3">{t('courseDetail.purchase.courseIncludes')}：</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <i className="fa fa-video-camera text-[#ed8936] mt-1 mr-3"></i>
                          <span>{course.chapters.reduce((total: number, chapter: any) => total + chapter.lessons.length, 0)} {t('courseDetail.purchase.videoLessons')} ({Math.round(course.chapters.reduce((total: number, chapter: any) => total + chapter.totalDuration, 0) / 60 * 10) / 10} {t('courseDetail.stats.hours')})</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fa fa-mobile text-[#ed8936] mt-1 mr-3 text-lg"></i>
                          <span>{t('courseDetail.purchase.mobileAccess')}</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fa fa-comments text-[#ed8936] mt-1 mr-3"></i>
                          <span>{t('courseDetail.purchase.whatsappAccess')}</span>
                        </li>
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content Tabs */}
      <section className="course-content bg-gray-50 py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex overflow-x-auto scrollbar-hide">
              {[
                { id: 'overview', label: t('courseDetail.tabs.overview') },
                { id: 'curriculum', label: `${t('courseDetail.tabs.curriculum')} (${course.chapters.reduce((total: number, chapter: any) => total + chapter.lessons.length, 0)} ${t('courseDetail.stats.lessons')})` },
                { id: 'instructor', label: t('courseDetail.tabs.instructor') },
                { id: 'reviews', label: t('courseDetail.tabs.reviews') },
                { id: 'discussions', label: t('courseDetail.tabs.discussions') }
              ].map((tab) => (
                <button
                  key={tab.id}
                  data-tab={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'border-[#ed8936] text-[#ed8936]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          
          {/* Tab Content: Overview */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-10">
                {/* What You'll Learn */}
                <div className="section-fade">
                  <h2 className="font-bold text-2xl text-[#1a365d] mb-6">{t('courseDetail.overview.whatYouWillLearn')}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {getMultiLangArrayContent(course.learningGoals, currentLocale).map((goal: string, index: number) => (
                      <div key={index} className="flex items-start">
                        <i className="fa fa-check-circle text-green-500 mt-1 mr-3"></i>
                        <span>{goal}</span>
                      </div>
                    ))}
               </div>
             </div>

                {/* Course Description */}
                <div className="section-fade">
                  <h2 className="font-bold text-2xl text-[#1a365d] mb-6">{t('courseDetail.overview.courseDescription')}</h2>
                  <div className="prose prose-lg text-gray-700 max-w-none">
                    <p>{getMultiLangContent(course.description, currentLocale)}</p>
                    
                    <h3 className="text-xl font-semibold mt-6 mb-3">{t('courseDetail.overview.suitableFor')}</h3>
                    <ul className="list-disc pl-6 space-y-2">
                   {getMultiLangArrayContent(course.suitableFor, currentLocale).map((person: string, index: number) => (
                        <li key={index}>{person}</li>
                   ))}
                 </ul>
                    
                    <h3 className="text-xl font-semibold mt-6 mb-3">{t('courseDetail.overview.requirements')}</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>{t('courseDetail.overview.noExperienceRequired')}</li>
                      <li>{t('courseDetail.overview.comfortableClothes')}</li>
                      <li>{t('courseDetail.overview.martialArtsUniform')}</li>
                      <li>{t('courseDetail.overview.practiceSpace')}</li>
                 </ul>
               </div>
             </div>
           </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-8">
                {/* Course Summary */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h3 className="font-semibold text-lg text-gray-800 mb-4">{t('courseDetail.overview.courseSummary')}</h3>
                  <ul className="space-y-3">
                    <li className="flex justify-between pb-3 border-b border-gray-100">
                      <span className='text-gray-600'>{t('courseDetail.overview.level')}</span>
                      <span className="font-medium">{getMultiLangContent(course.difficulty, currentLocale)}</span>
                    </li>
                    <li className="flex justify-between pb-3 border-b border-gray-100">
                      <span className='text-gray-600'>{t('courseDetail.overview.duration')}</span>
                      <span className='font-medium'>{t('courseDetail.overview.suggestedWeeks', {weeks: Math.ceil(parseInt(course.duration) / 2)})}</span>
                    </li>
                    <li className="flex justify-between pb-3 border-b border-gray-100">
                      <span className='text-gray-600'>{t('courseDetail.overview.totalVideoDuration')}</span>
                      <span className="font-medium">{course.duration}</span>
                    </li>
                    <li className="flex justify-between pb-3 border-b border-gray-100">
                      <span className='text-gray-600'>{t('courseDetail.overview.lessonCount')}</span>
                      <span className="font-medium">{course.chapters.reduce((total: number, chapter: any) => total + chapter.lessons.length, 0)}</span>
                    </li>
                    <li className="flex justify-between pb-3 border-b border-gray-100">
                      <span className='text-gray-600'>{t('courseDetail.overview.lastUpdated')}</span>
                      <span className="font-medium">2024年6月</span>
                    </li>
                    <li className="flex justify-between">
                      <span className='text-gray-600'>{t('courseDetail.overview.language')}</span>
                      <span className='font-medium'>{t('courseDetail.overview.chinese')}</span>
                    </li>
                  </ul>
                </div>
                
                {/* Instructor Preview */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h3 className="font-semibold text-lg text-gray-800 mb-4">{t('courseDetail.overview.yourInstructor')}</h3>
                  <div className="flex items-start">
                    <div className="w-16 h-16 bg-[#1a365d]/10 rounded-full flex items-center justify-center mr-4">
                      <span className="text-2xl">👨‍🏫</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{course.instructor}</h4>
                      <p className="text-gray-600 text-sm mb-2">{course.intro}</p>
                      <button 
                        onClick={() => setActiveTab('instructor')}
                        className="text-[#ed8936] text-sm font-medium hover:underline transition-colors"
                      >
                        {t('courseDetail.overview.viewFullProfile')} <i className="fa fa-arrow-right ml-1"></i>
                      </button>
                    </div>
                 </div>
               </div>
                           </div>
                           </div>
                         )}
          
                     {/* Tab Content: Curriculum */}
           {activeTab === 'curriculum' && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2">
                 <div className="bg-white rounded-xl shadow-md overflow-hidden">
                   
                   {/* Course Modules */}
                   {course.chapters.map((chapter: any, index: any) => (
                     <div key={index} className="border-b border-gray-100 last:border-b-0">
                       <button 
                         className="w-full flex justify-between items-center p-6 text-left focus:outline-none module-toggle hover:bg-gray-50 transition-all duration-300"
                         onClick={() => toggleModule(index)}
                       >
                         <div className="flex items-center">
                           <i className={`fa fa-chevron-${expandedModules.includes(index) ? 'down' : 'right'} text-gray-400 mr-3 transition-transform duration-300`}></i>
                           <div>
                             <h3 className="font-semibold text-gray-800">{t('courseDetail.curriculum.chapter', {number: index + 1})}: {getMultiLangContent(chapter.title, currentLocale)}</h3>
                           </div>
                         </div>
                         <div className="hidden sm:block">
                           <span className="text-gray-400 text-sm">{chapter.lessons.length} {t('courseDetail.curriculum.lessons')}</span>
                         </div>
                       </button>
                       
                       {/* Module Content */}
                       {expandedModules.includes(index) && (
                         <div className="module-content px-6 pb-6">
                           <p className="text-gray-600 mb-4">{getMultiLangContent(chapter.description, currentLocale)}</p>
                           <ul className="space-y-3">
                             {chapter.lessons.map((lesson: any) => {
                               const isCurrentlyPlaying = currentPlayingLesson?.chapterId === chapter.id && currentPlayingLesson?.lessonId === lesson.id;
                               return (
                                 <li 
                                   key={lesson.id} 
                                   className={`flex items-center p-3 hover:bg-gray-50 rounded-md transition-all duration-300 cursor-pointer ${
                                     isCurrentlyPlaying ? 'bg-orange-50 border-l-4 border-orange-500' : ''
                                   }`}
                                   onClick={() => {
                                     console.log('📋 课程大纲点击:', { 
                                       chapterIndex: index, 
                                       chapterId: chapter.id,
                                       lessonId: lesson.id, 
                                       lessonTitle: lesson.title,
                                       currentPlaying: currentPlayingLesson 
                                     });
                                     setCurrentPlayingLesson({ chapterId: chapter.id, lessonId: lesson.id });
                                     // 保持在当前TAB，不跳转
                                   }}
                                 >
                                   <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                     isCurrentlyPlaying ? 'bg-orange-100' : 'bg-gray-100'
                                   }`}>
                                     {isCurrentlyPlaying ? (
                                       <i className="fa fa-play-circle text-orange-500 text-sm animate-pulse"></i>
                                     ) : (
                                       <i className="fa fa-play text-gray-600 text-sm"></i>
                                     )}
                                   </div>
                                   <div className="flex-grow">
                                     <div className="flex items-center justify-between">
                                       <div>
                                         <p className={`font-medium ${
                                           isCurrentlyPlaying ? 'text-orange-700' : 'text-gray-800'
                                         }`}>{getMultiLangContent(lesson.title, currentLocale)}</p>
                                         <p className="text-gray-500 text-sm">{getMultiLangContent(lesson.description, currentLocale)}</p>
                                       </div>
                                       <div className="flex items-center space-x-2">
                                         <span className="text-gray-500 text-sm">{lesson.duration} {t('courseDetail.curriculum.minutes')}</span>
                                         {isCurrentlyPlaying && (
                                           <div className="flex items-center space-x-1">
                                             <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                                             <span className="text-xs text-orange-600 font-medium">{t('courseDetail.curriculum.playing')}</span>
                                           </div>
                                         )}
                                       </div>
                                     </div>
                                   </div>
                                 </li>
                               );
                             })}
                           </ul>
                         </div>
                       )}
                     </div>
                   ))}
                 </div>
               </div>
               
               {/* Milestone Timeline */}
               <div className="lg:col-span-1">
                 <MilestoneTimeline chapters={course.chapters} />
               </div>
             </div>
           )}
          
          {/* Tab Content: Instructor */}
          {activeTab === 'instructor' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-md p-8">
                  <div className="flex flex-col md:flex-row md:items-center mb-8">
                    <div className="w-32 h-32 bg-[#1a365d]/10 rounded-full flex items-center justify-center mb-4 md:mb-0 md:mr-6">
                      <span className="text-6xl">👨‍🏫</span>
                    </div>
                    <div>
                      <h2 className="font-bold text-2xl text-[#1a365d] mb-2">{course.instructor}</h2>
                      <p className="text-gray-600 text-lg mb-3">{course.intro}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-[#1a365d]/10 text-[#1a365d] px-3 py-1 rounded-full text-sm">{t('courseDetail.tags.kungfu')}</span>
                        <span className="bg-[#1a365d]/10 text-[#1a365d] px-3 py-1 rounded-full text-sm">{t('courseDetail.tags.selfDefense')}</span>
                        <span className="bg-[#1a365d]/10 text-[#1a365d] px-3 py-1 rounded-full text-sm">{t('courseDetail.tags.martialArtsPhilosophy')}</span>
                      </div>
                 </div>
             </div>

                  <div className="mb-8">
                    <h3 className="font-semibold text-xl text-gray-800 mb-4">{t('courseDetail.instructor.aboutInstructor', {name: course.instructor})}</h3>
                    <div className="prose prose-lg text-gray-700 max-w-none">
                      <p>{course.intro}，{t('courseDetail.instructor.description')}</p>
                    </div>
                  </div>
                      </div>
                    </div>
              
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
                  <h3 className="font-semibold text-lg text-gray-800 mb-4">{t('courseDetail.instructor.contactInstructor')}</h3>
                  <p className="text-gray-600 mb-6">{t('courseDetail.instructor.contactDesc')}</p>
                  
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h4 className="font-medium text-gray-800 mb-3">{t('courseDetail.instructor.youWillGet')}：</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <i className="fa fa-check text-green-500 mt-1 mr-3"></i>
                        <span className='text-sm text-gray-600'>{t('courseDetail.instructor.personalizedFeedback')}</span>
                      </li>
                      <li className="flex items-start">
                        <i className="fa fa-check text-green-500 mt-1 mr-3"></i>
                        <span className='text-sm text-gray-600'>{t('courseDetail.instructor.answerQuestions')}</span>
                      </li>
                      <li className="flex items-start">
                        <i className="fa fa-check text-green-500 mt-1 mr-3"></i>
                        <span className='text-sm text-gray-600'>{t('courseDetail.instructor.progressGuidance')}</span>
                      </li>
                    </ul>
                  </div>
                  
                  {session?.user ? (
                    <button className="block w-full py-3 bg-[#ed8936] text-white text-center font-semibold rounded-md hover:bg-[#ed8936]/90 transition-all duration-300 shadow-md hover:shadow-lg">
                      {t('courseDetail.instructor.purchaseToContact')}
                    </button>
                  ) : (
                    <Link 
                      href={`/auth/login?callbackUrl=${encodeURIComponent(`/courses/${params.courseId}`)}`}
                      className="block w-full py-3 bg-[#ed8936] text-white text-center font-semibold rounded-md hover:bg-[#ed8936]/90 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      {t('courseDetail.instructor.loginToExperience')}
                    </Link>
                  )}
                </div>
              </div>
           </div>
          )}
          
          {/* Tab Content: Reviews */}
          {activeTab === 'reviews' && (
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                  <h2 className="font-bold text-2xl text-[#1a365d] mb-2">{t('courseDetail.reviews.studentReviews')}</h2>
                  <p className="text-gray-600">{t('courseDetail.reviews.reviewsCount', {count: reviewStats.totalReviews})}</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <div className="flex items-center">
                    <span className="text-4xl font-bold text-[#1a365d] mr-4">
                      {reviewStats.totalReviews > 0 ? reviewStats.averageRating : '0.0'}
                    </span>
                    <div>
                      <div className="flex text-yellow-400 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <i key={i} className={`fa fa-star ${i < Math.floor(reviewStats.averageRating) ? '' : 'fa-star-o'}`}></i>
                        ))}
                      </div>
                      <p className="text-gray-600 text-sm">
                        {reviewStats.totalReviews > 0 ? reviewStats.averageRating : '0.0'} {t('courseDetail.reviews.averageRating')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {!showReviews ? (
                <div className="text-center py-8">
                  {status === 'loading' ? (
                    <div className="px-6 py-2 bg-gray-300 text-gray-600 font-semibold rounded-md">
                      加载中...
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-gray-600 mb-4">{t('courseDetail.reviews.loginToView')}</p>
                      <Link 
                        href={`/auth/login?callbackUrl=${encodeURIComponent(`/courses/${params.courseId}`)}`}
                        className="px-6 py-2 bg-[#ed8936] text-white font-semibold rounded-md hover:bg-[#ed8936]/90 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                      >
                        {t('courseDetail.reviews.loginNow')}
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-6">
                  
                  {/* Review stats */}
                  <div className="mb-8">
                    {reviewStats.totalReviews > 0 ? (
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((star) => (
                          <div key={star} className="flex items-center">
                            <span className="w-16 text-gray-600">{star}{t('courseDetail.reviews.star')}</span>
                            <div className="flex-grow h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-yellow-400 rounded-full" 
                                style={{ width: `${reviewStats.ratingPercentages[star as keyof typeof reviewStats.ratingPercentages]}%` }}
                              ></div>
                            </div>
                            <span className="w-10 text-right text-gray-600">
                              {reviewStats.ratingPercentages[star as keyof typeof reviewStats.ratingPercentages]}%
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <p>{t('courseDetail.reviews.noReviews')}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Review form */}
                  {session?.user && !reviews.some((review: any) => review.user.id === session.user.id) && (
                    <div className="border-t border-b border-gray-100 py-8 mb-8">
                      <h3 className="font-semibold text-xl text-gray-800 mb-4">{t('courseDetail.reviews.writeReview')}</h3>
                      <p className="text-gray-600 mb-6">{t('courseDetail.reviews.shareExperience')}</p>
                      
                      <button 
                        onClick={() => setShowReviewModal(true)}
                        className="inline-flex items-center px-6 py-3 bg-[#1a365d] text-white font-semibold rounded-md hover:bg-[#1a365d]/90 transition-all duration-300"
                      >
                        <i className="fa fa-pencil mr-2"></i> {t('courseDetail.reviews.writeReview')}
                      </button>
                    </div>
                  )}
                  
                  {/* 已评价提示 */}
                  {session?.user && reviews.some((review: any) => review.user.id === session.user.id) && (
                    <div className="border-t border-b border-gray-100 py-8 mb-8">
                      <div className="flex items-center text-gray-600">
                        <i className="fa fa-check-circle text-green-500 mr-2"></i>
                        <span>{t('courseDetail.reviews.alreadyReviewed')}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Reviews list */}
                  <div className="space-y-8">
                    {reviews && reviews.length > 0 ? (
                      reviews.map((review: any) => (
                        <div key={review.id} className="border-b border-gray-100 pb-8">
                          <div className="flex items-start">
                            <img 
                              src={review.user.avatar || "https://picsum.photos/id/91/100/100"} 
                              alt={review.user.name} 
                              className="w-12 h-12 rounded-full object-cover mr-4" 
                            />
                            <div className="flex-grow">
                              <div className="flex flex-wrap items-start justify-between mb-2">
                                <h4 className="font-semibold text-gray-800">{review.user.name}</h4>
                                <div className="flex text-yellow-400">
                                  {[...Array(5)].map((_, i) => (
                                    <i key={i} className={`fa fa-star ${i < review.rating ? '' : 'fa-star-o'}`}></i>
                                  ))}
                                </div>
                              </div>
                              <p className="text-gray-600 mb-3">{review.content}</p>
                              <div className="flex items-center text-gray-500 text-sm">
                                <span>{new Date(review.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}评价</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        {t('courseDetail.reviews.noReviews')}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center mt-8">
                    <button className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-all duration-300">
                      {t('courseDetail.reviews.loadMore')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Tab Content: Discussions */}
          {activeTab === 'discussions' && (
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="font-bold text-2xl text-[#1a365d] mb-2">{t('courseDetail.discussions.courseDiscussions')}</h2>
                    <p className="text-gray-600">{t('courseDetail.discussions.discussWithOthers')}</p>
                  </div>
                  
                  {session?.user ? (
                    <>
                      <div className="p-6 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-800 mb-4">{t('courseDetail.discussions.startNewDiscussion')}</h3>
                        <button 
                          onClick={() => setShowDiscussionModal(true)}
                          className="block w-full py-3 border border-dashed border-gray-300 text-center text-gray-600 font-medium rounded-md hover:bg-gray-50 transition-all duration-300"
                        >
                          <i className="fa fa-plus mr-2"></i> {t('courseDetail.discussions.postQuestion')}
                        </button>
                      </div>
                      
                      <div className="divide-y divide-gray-100">
                        {discussions && discussions.length > 0 ? (
                          discussions.map((discussion: any) => (
                        <div key={discussion.id} className="p-6">
                          <div className="flex items-start">
                            <img 
                              src={discussion.user.image || "https://picsum.photos/id/22/100/100"} 
                              alt={discussion.user.name} 
                              className="w-10 h-10 rounded-full object-cover mr-3" 
                            />
                            <div className="flex-grow">
                              <div className="flex flex-wrap items-start justify-between mb-2">
                                <h4 className="font-semibold text-gray-800">{discussion.user.name}</h4>
                                <span className="text-gray-500 text-sm">
                                  {new Date(discussion.createdAt).toLocaleDateString('zh-CN', { 
                                    year: 'numeric', 
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                              <p className="text-gray-600 mb-4">{discussion.content}</p>
                              
                              {/* Replies */}
                              {discussion.replies && discussion.replies.length > 0 && (
                                <div className="space-y-4 mb-4">
                                  {discussion.replies.map((reply: any) => (
                                    <div key={reply.id} className="bg-gray-50 p-4 rounded-lg">
                                      <div className="flex items-start">
                                        <img 
                                          src={reply.user.image || "https://picsum.photos/id/64/100/100"} 
                                          alt={reply.user.name} 
                                          className="w-8 h-8 rounded-full object-cover mr-2" 
                                        />
                                        <div>
                                          <div className="flex items-center mb-1">
                                            <h6 className="font-semibold text-gray-800 text-sm">
                                              {reply.user.name}
                                              {reply.isInstructor && (
                                                <span className="ml-2 bg-[#1a365d]/10 text-[#1a365d] text-xs px-2 py-0.5 rounded">讲师</span>
                                              )}
                                            </h6>
                                            <span className="text-gray-500 text-xs ml-2">
                                              {new Date(reply.createdAt).toLocaleDateString('zh-CN', { 
                                                year: 'numeric', 
                                                month: 'long',
                                                day: 'numeric'
                                              })}
                                            </span>
                                          </div>
                                          <p className="text-gray-600 text-sm">{reply.content}</p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              <div className="flex items-center text-sm">
                                <button 
                                  onClick={() => {
                                    setReplyForm({
                                      content: '',
                                      discussionId: discussion.id
                                    });
                                    setShowReplyModal(true);
                                  }}
                                  className="flex items-center text-gray-500 hover:text-[#1a365d] transition-all duration-300 mr-6"
                                >
                                  <i className="fa fa-reply mr-1"></i> 回复
                                </button>
                                <button 
                                  onClick={async () => {
                                    if (!session?.user?.id) {
                                      console.warn('未登录用户无法点赞');
                                      return;
                                    }
                                    
                                    // 防抖处理：防止快速连续点击
                                    if (likeDebounceMap.has(discussion.id)) {
                                      console.warn('操作过于频繁，请稍后再试');
                                      return;
                                    }
                                    
                                    // 防止重复点赞
                                    if (likingDiscussionId === discussion.id) {
                                      console.warn('正在点赞中，请勿重复点击');
                                      return;
                                    }
                                    
                                    // 乐观更新：立即更新UI
                                    const isCurrentlyLiked = discussion.likeRecords?.some((like: any) => like.userId === session.user.id);
                                    const currentLikes = discussion.likes;
                                    
                                    // 立即更新本地状态
                                    setDiscussions(prevDiscussions => 
                                      prevDiscussions.map(d => 
                                        d.id === discussion.id 
                                          ? {
                                              ...d,
                                              likes: isCurrentlyLiked ? currentLikes - 1 : currentLikes + 1,
                                              likeRecords: isCurrentlyLiked 
                                                ? d.likeRecords?.filter((like: any) => like.userId !== session.user.id) || []
                                                : [...(d.likeRecords || []), { userId: session.user.id, discussionId: d.id }]
                                            }
                                          : d
                                      )
                                    );
                                    
                                    setLikingDiscussionId(discussion.id);
                                    
                                    try {
                                      const res = await fetch(`/api/courses/${params.courseId}/discussions/${discussion.id}/like`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({})
                                      });
                                      
                                      if (res.ok) {
                                        const likeData = await res.json();
                                        console.log('点赞操作成功:', likeData);
                                        
                                        // 使用服务器返回的数据更新状态
                                        setDiscussions(prevDiscussions => 
                                          prevDiscussions.map(d => 
                                            d.id === discussion.id 
                                              ? {
                                                  ...d,
                                                  likes: likeData.likes,
                                                  likeRecords: likeData.isLiked 
                                                    ? [...(d.likeRecords || []), { userId: session.user.id, discussionId: d.id }]
                                                    : d.likeRecords?.filter((like: any) => like.userId !== session.user.id) || []
                                                }
                                              : d
                                          )
                                        );
                                      } else {
                                        // 如果API失败，回滚乐观更新
                                        setDiscussions(prevDiscussions => 
                                          prevDiscussions.map(d => 
                                            d.id === discussion.id 
                                              ? {
                                                  ...d,
                                                  likes: currentLikes,
                                                  likeRecords: isCurrentlyLiked 
                                                    ? d.likeRecords || []
                                                    : d.likeRecords?.filter((like: any) => like.userId !== session.user.id) || []
                                                }
                                              : d
                                          )
                                        );
                                        
                                        const errorData = await res.json().catch(() => ({}));
                                        console.error('点赞失败:', errorData);
                                        alert('操作失败，请稍后重试');
                                      }
                                    } catch (e) {
                                      // 如果网络错误，回滚乐观更新
                                      setDiscussions(prevDiscussions => 
                                        prevDiscussions.map(d => 
                                          d.id === discussion.id 
                                            ? {
                                                ...d,
                                                likes: currentLikes,
                                                likeRecords: isCurrentlyLiked 
                                                  ? d.likeRecords || []
                                                  : d.likeRecords?.filter((like: any) => like.userId !== session.user.id) || []
                                              }
                                            : d
                                        )
                                      );
                                      
                                      console.error('点赞失败', e);
                                      alert('操作失败，请检查网络连接');
                                    } finally {
                                      setLikingDiscussionId(null);
                                      
                                      // 设置防抖延迟
                                      const debounceTimeout = setTimeout(() => {
                                        setLikeDebounceMap(prev => {
                                          const newMap = new Map(prev);
                                          newMap.delete(discussion.id);
                                          return newMap;
                                        });
                                      }, 1000); // 1秒防抖
                                      
                                      setLikeDebounceMap(prev => {
                                        const newMap = new Map(prev);
                                        newMap.set(discussion.id, debounceTimeout);
                                        return newMap;
                                      });
                                    }
                                  }}
                                  disabled={likingDiscussionId === discussion.id}
                                  className={`flex items-center transition-all duration-300 ${
                                    likingDiscussionId === discussion.id 
                                      ? 'text-gray-400 cursor-not-allowed' 
                                      : discussion.likeRecords?.some((like: any) => like.userId === session?.user?.id)
                                      ? 'text-red-500 hover:text-red-600'
                                      : 'text-gray-500 hover:text-[#1a365d]'
                                  }`}
                                >
                                  <i className={`fa fa-thumbs-up mr-1 ${
                                    discussion.likeRecords?.some((like: any) => like.userId === session?.user?.id) ? 'text-red-500' : ''
                                  }`}></i> 
                                  {likingDiscussionId === discussion.id ? (
                                    <span className="flex items-center">
                                      <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
                                    </span>
                                  ) : (
                                    `${discussion.likes} 赞`
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        {t('courseDetail.discussions.noDiscussions')}
                      </div>
                    )}
                      </div>
                    </>
                  ) : (
                    <div className="p-6">
                      <div className="space-y-4 text-center">
                        <p className="text-gray-600 mb-4">{t('courseDetail.discussions.loginToParticipate')}</p>
                        <Link 
                          href={`/auth/login?callbackUrl=${encodeURIComponent(`/courses/${params.courseId}`)}`}
                          className="inline-block px-6 py-2 bg-[#ed8936] text-white font-semibold rounded-md hover:bg-[#ed8936]/90 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                        >
                          {t('courseDetail.reviews.loginNow')}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
         </div>
       </section>
       
       {/* You May Also Like Section */}
       <section className="py-16 bg-white">
         <div className="container mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-12">
             <h2 className="font-bold text-3xl text-[#1a365d] mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t('courseDetail.relatedCourses.title')}</h2>
             <p className="text-gray-600 text-lg max-w-2xl mx-auto">{t('courseDetail.relatedCourses.subtitle')}</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {courses && courses.length > 0 && courses
               .filter((relatedCourse: any) => relatedCourse.id !== course.id)
               .slice(0, 4)
               .map((relatedCourse: any) => (
                 <Link key={relatedCourse.id} href={`/courses/${relatedCourse.id}`} className="block">
                   <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                   <div className="relative">
                     <img 
                       src={relatedCourse.image} 
                       alt={relatedCourse.title} 
                       className="w-full h-48 object-cover"
                     />
                     <div className="absolute top-3 right-3 text-white text-xs font-bold px-2 py-1 rounded" style={{ 
                       backgroundColor: relatedCourse.id === 'shaolin-legacy' ? 'rgb(147 51 234 / var(--tw-bg-opacity, 1))' :
                                   relatedCourse.id === 'wing-chun-combat' ? 'rgb(239 68 68 / var(--tw-bg-opacity, 1))' :
                                   'rgb(237 137 54 / var(--tw-bg-opacity, 1))'
                     }}>
                       {relatedCourse.id === 'shaolin-legacy' ? t('courseDetail.relatedCourses.category.weapons') :
                        relatedCourse.id === 'wing-chun-combat' ? t('courseDetail.relatedCourses.category.combat') :
                        t('courseDetail.relatedCourses.category.fist')}
                     </div>
                   </div>
                   <div className="p-5">
                     <div className="flex items-center text-yellow-400 text-sm mb-2">
                       {[...Array(5)].map((_, i) => (
                         <i key={i} className={`fa fa-star ${i < Math.floor(relatedCourse.rating) ? '' : 'fa-star-o'}`}></i>
                       ))}
                       <span className="text-gray-500 ml-1">({Math.floor(relatedCourse.rating * 100)})</span>
                     </div>
                     
                     <h3 className="font-semibold text-lg text-gray-800 mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                       {getMultiLangContent(relatedCourse.title, currentLocale)}
                     </h3>
                     
                     <p className="text-gray-600 text-sm mb-3 line-clamp-2" style={{ 
                       display: '-webkit-box',
                       WebkitLineClamp: 2,
                       WebkitBoxOrient: 'vertical' as const,
                       overflow: 'hidden',
                       lineHeight: '1.4em',
                       maxHeight: '2.8em'
                     }}>
                       {getMultiLangContent(relatedCourse.description, currentLocale)}
                     </p>
                     
                     <div className="flex items-center justify-between">
                       <span className="font-bold text-lg text-[#1a365d]">{relatedCourse.price}</span>
                       <span className="text-gray-500 text-sm">{getMultiLangContent(relatedCourse.difficulty, currentLocale)}</span>
                     </div>
                   </div>
                 </div>
                 </Link>
               ))}
           </div>
         </div>
       </section>
       
       {/* 写评价浮层 */}
       {showReviewModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
           <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
             <div className="p-6 border-b border-gray-200">
               <div className="flex items-center justify-between">
                 <h2 className="text-2xl font-bold text-gray-800">写评价</h2>
                 <button 
                   onClick={() => setShowReviewModal(false)}
                   className="text-gray-400 hover:text-gray-600 transition-colors"
                 >
                   <i className="fa fa-times text-xl"></i>
                 </button>
               </div>
             </div>
             
             <div className="p-6">
               <div className="mb-6">
                 <label className="block text-sm font-medium text-gray-700 mb-2">评分</label>
                 <div className="flex items-center space-x-2">
                   {[1, 2, 3, 4, 5].map((star) => (
                     <button
                       key={star}
                       onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                       className={`text-2xl transition-colors ${
                         star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'
                       }`}
                     >
                       <i className="fa fa-star"></i>
                     </button>
                   ))}
                   <span className="ml-2 text-sm text-gray-600">{reviewForm.rating} 星</span>
                 </div>
               </div>
               
               <div className="mb-6">
                 <label className="block text-sm font-medium text-gray-700 mb-2">评价内容</label>
                 <textarea
                   value={reviewForm.content}
                   onChange={(e) => setReviewForm(prev => ({ ...prev, content: e.target.value }))}
                   placeholder="分享您对这门课程的体验，帮助其他学员做出决定..."
                   className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:border-transparent resize-none"
                 />
               </div>
               
               
               
               <div className="flex space-x-4">
                 <button
                   onClick={() => setShowReviewModal(false)}
                   className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                 >
                   取消
                 </button>
                 <button
                   onClick={() => {
                     if (!session?.user?.id) {
                       console.warn('未登录用户无法提交评价');
                       return;
                     }

                     reviewSubmission.submit(async () => {
                       const res = await fetch(`/api/courses/${params.courseId}/reviews`, {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify({
                           rating: reviewForm.rating,
                           title: undefined,
                           content: reviewForm.content,
                         })
                       });

                       if (!res.ok) {
                         const err = await res.json().catch(() => ({}));
                         throw new Error(`提交评价失败: ${err.error || '未知错误'}`);
                       }

                       const listRes = await fetch(`/api/courses/${params.courseId}/reviews`);
                       if (listRes.ok) {
                         const list = await listRes.json();
                         setReviews(list);
                       }
                     });
                   }}
                   disabled={!reviewForm.content.trim() || reviewSubmission.isSubmitting}
                   className="flex-1 px-4 py-2 bg-[#1a365d] text-white rounded-md hover:bg-[#1a365d]/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                 >
                   {reviewSubmission.isSubmitting ? '提交中...' : '提交评价'}
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}
       
       {/* 发布讨论浮层 */}
       {showDiscussionModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
           <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
             <div className="p-6 border-b border-gray-200">
               <div className="flex items-center justify-between">
                 <h2 className="text-2xl font-bold text-gray-800">发布新讨论</h2>
                 <button 
                   onClick={() => setShowDiscussionModal(false)}
                   className="text-gray-400 hover:text-gray-600 transition-colors"
                 >
                   <i className="fa fa-times text-xl"></i>
                 </button>
               </div>
             </div>
             
             <div className="p-6">
               <div className="mb-6">
                 <label className="block text-sm font-medium text-gray-700 mb-2">您的问题或想法</label>
                 <textarea
                   value={discussionForm.content}
                   onChange={(e) => setDiscussionForm(prev => ({ ...prev, content: e.target.value }))}
                   placeholder="分享您的问题或想法，与其他学员和讲师进行交流..."
                   className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:border-transparent resize-none"
                 />
               </div>
               
               <div className="flex space-x-4">
                 <button
                   onClick={() => setShowDiscussionModal(false)}
                   className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                 >
                   取消
                 </button>
                 <button
                   onClick={() => {
                     if (!session?.user?.id) {
                       console.warn('未登录用户无法发布讨论');
                       return;
                     }

                     discussionSubmission.submit(async () => {
                       const res = await fetch(`/api/courses/${params.courseId}/discussions`, {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify({
                           content: discussionForm.content,
                         })
                       });

                       if (!res.ok) {
                         const err = await res.json().catch(() => ({}));
                         throw new Error(`发布讨论失败: ${err.error || '未知错误'}`);
                       }

                       // 刷新讨论列表
                       const listRes = await fetch(`/api/courses/${params.courseId}/discussions`);
                       if (listRes.ok) {
                         const list = await listRes.json();
                         setDiscussions(list);
                       }
                     });
                   }}
                   disabled={!discussionForm.content.trim() || discussionSubmission.isSubmitting}
                   className="flex-1 px-4 py-2 bg-[#1a365d] text-white rounded-md hover:bg-[#1a365d]/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                 >
                   {discussionSubmission.isSubmitting ? '发布中...' : '发布讨论'}
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}
       
       {/* 回复浮层 */}
       {showReplyModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
           <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
             <div className="p-6 border-b border-gray-200">
               <div className="flex items-center justify-between">
                 <h2 className="text-2xl font-bold text-gray-800">回复讨论</h2>
                 <button 
                   onClick={() => setShowReplyModal(false)}
                   className="text-gray-400 hover:text-gray-600 transition-colors"
                 >
                   <i className="fa fa-times text-xl"></i>
                 </button>
               </div>
             </div>
             
             <div className="p-6">
               <div className="mb-6">
                 <label className="block text-sm font-medium text-gray-700 mb-2">您的回复</label>
                 <textarea
                   value={replyForm.content}
                   onChange={(e) => setReplyForm(prev => ({ ...prev, content: e.target.value }))}
                   placeholder="输入您的回复内容..."
                   className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:border-transparent resize-none"
                 />
               </div>
               
               <div className="flex space-x-4">
                 <button
                   onClick={() => setShowReplyModal(false)}
                   className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                 >
                   取消
                 </button>
                 <button
                   onClick={() => {
                     if (!session?.user?.id) {
                       console.warn('未登录用户无法回复');
                       return;
                     }

                     replySubmission.submit(async () => {
                       const res = await fetch(`/api/courses/${params.courseId}/discussions/${replyForm.discussionId}/replies`, {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify({
                           content: replyForm.content,
                         })
                       });

                       if (!res.ok) {
                         const err = await res.json().catch(() => ({}));
                         throw new Error(`发布回复失败: ${err.error || '未知错误'}`);
                       }

                       // 刷新讨论列表
                       const listRes = await fetch(`/api/courses/${params.courseId}/discussions`);
                       if (listRes.ok) {
                         const list = await listRes.json();
                         setDiscussions(list);
                       }
                     });
                   }}
                   disabled={!replyForm.content.trim() || replySubmission.isSubmitting}
                   className="flex-1 px-4 py-2 bg-[#1a365d] text-white rounded-md hover:bg-[#1a365d]/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                 >
                   {replySubmission.isSubmitting ? '发布中...' : '发布回复'}
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}
    </main>
  );
}
