"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from 'next-intl';
import Header from "../../../components/Header";
import { getMultiLangContent, getLocaleFromPath, SupportedLocale } from "../../../utils/i18n";

export default function CoursesPageDebug() {
  const t = useTranslations();
  const [activeCategory, setActiveCategory] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState<SupportedLocale>('zh');

  // 课程数据
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 过滤课程
  const filteredCourses = activeCategory === 'all' 
    ? courses 
    : courses.filter(course => course.category === activeCategory);

  // 获取分类标签名称
  const getCategoryName = (category: string) => {
    const categoryNames: { [key: string]: string } = {
      striking: "拳术类",
      taiji: "太极类",
      weapons: "器械类",
      health: "养生类",
      combat: "实战类",
      mixed: "综合类"
    };
    return categoryNames[category] || category;
  };

  useEffect(() => {
    // 获取当前语言
    const locale = getLocaleFromPath(window.location.pathname);
    setCurrentLocale(locale);
    
    // 动态导入分类和课程数据
    const loadData = async () => {
      try {
        console.log('🔄 开始加载课程数据...');
        const { courses: allCourses } = await import('../../../data/courses');
        const { categories } = await import('../../../data/categories');
        
        console.log('📚 加载的课程数据:', allCourses);
        console.log('📂 加载的分类数据:', categories);
        
        setCourses(allCourses);
        setLoading(false);
        
        // 特别检查综合类课程
        const mixedCourses = allCourses.filter(course => course.category === 'mixed');
        console.log('🎯 综合类课程:', mixedCourses);
        
      } catch (error) {
        console.error('❌ 加载数据失败:', error);
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // 调试信息
  useEffect(() => {
    console.log('🔍 当前状态:');
    console.log('  activeCategory:', activeCategory);
    console.log('  courses.length:', courses.length);
    console.log('  filteredCourses.length:', filteredCourses.length);
    
    if (activeCategory === 'mixed') {
      console.log('🎯 综合类过滤结果:', filteredCourses);
    }
  }, [activeCategory, courses, filteredCourses]);

  return (
    <main className="bg-gray-50 font-sans text-gray-800">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4" style={{ color: 'rgb(26 54 93 / var(--tw-text-opacity, 1))', fontFamily: 'Montserrat, sans-serif' }}>
            武术课程
          </h1>
          <p className="text-gray-600">探索我们全面的武术课程集合，按学科分类。</p>
        </div>

        {/* 调试信息 */}
        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 rounded">
          <h3 className="font-bold text-yellow-800">调试信息:</h3>
          <p>当前分类: <strong>{activeCategory}</strong></p>
          <p>总课程数: <strong>{courses.length}</strong></p>
          <p>过滤后课程数: <strong>{filteredCourses.length}</strong></p>
          <p>加载状态: <strong>{loading ? '加载中' : '已完成'}</strong></p>
        </div>

        {/* 分类筛选按钮 */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            <button 
              className={`category-filter px-4 py-2 rounded-full font-medium transition-all duration-300 ${activeCategory === 'all' ? 'text-white' : 'text-gray-700 hover:bg-gray-300'}`}
              style={{ backgroundColor: activeCategory === 'all' ? 'rgb(26 54 93 / var(--tw-bg-opacity, 1))' : 'rgb(229 231 235 / var(--tw-bg-opacity, 1))' }}
              onClick={() => setActiveCategory('all')}
            >
              <i className="fa fa-th mr-2"></i>所有课程
            </button>
            <button 
              className={`category-filter px-4 py-2 rounded-full font-medium transition-all duration-300 ${activeCategory === 'striking' ? 'text-white' : 'text-gray-700 hover:bg-gray-300'}`}
              style={{ backgroundColor: activeCategory === 'striking' ? 'rgb(26 54 93 / var(--tw-bg-opacity, 1))' : 'rgb(229 231 235 / var(--tw-bg-opacity, 1))' }}
              onClick={() => setActiveCategory('striking')}
            >
              <i className="fa fa-fist-raised mr-2"></i>拳术类
            </button>
            <button 
              className={`category-filter px-4 py-2 rounded-full font-medium transition-all duration-300 ${activeCategory === 'taiji' ? 'text-white' : 'text-gray-700 hover:bg-gray-300'}`}
              style={{ backgroundColor: activeCategory === 'taiji' ? 'rgb(26 54 93 / var(--tw-bg-opacity, 1))' : 'rgb(229 231 235 / var(--tw-bg-opacity, 1))' }}
              onClick={() => setActiveCategory('taiji')}
            >
              <i className="fa fa-yin-yang mr-2"></i>太极类
            </button>
            <button 
              className={`category-filter px-4 py-2 rounded-full font-medium transition-all duration-300 ${activeCategory === 'weapons' ? 'text-white' : 'text-gray-700 hover:bg-gray-300'}`}
              style={{ backgroundColor: activeCategory === 'weapons' ? 'rgb(26 54 93 / var(--tw-bg-opacity, 1))' : 'rgb(229 231 235 / var(--tw-bg-opacity, 1))' }}
              onClick={() => setActiveCategory('weapons')}
            >
              <i className="fa fa-sword mr-2"></i>器械类
            </button>
            <button 
              className={`category-filter px-4 py-2 rounded-full font-medium transition-all duration-300 ${activeCategory === 'health' ? 'text-white' : 'text-gray-700 hover:bg-gray-300'}`}
              style={{ backgroundColor: activeCategory === 'health' ? 'rgb(26 54 93 / var(--tw-bg-opacity, 1))' : 'rgb(229 231 235 / var(--tw-bg-opacity, 1))' }}
              onClick={() => setActiveCategory('health')}
            >
              <i className="fa fa-heart mr-2"></i>养生类
            </button>
            <button 
              className={`category-filter px-4 py-2 rounded-full font-medium transition-all duration-300 ${activeCategory === 'combat' ? 'text-white' : 'text-gray-700 hover:bg-gray-300'}`}
              style={{ backgroundColor: activeCategory === 'combat' ? 'rgb(26 54 93 / var(--tw-bg-opacity, 1))' : 'rgb(229 231 235 / var(--tw-bg-opacity, 1))' }}
              onClick={() => setActiveCategory('combat')}
            >
              <i className="fa fa-shield-alt mr-2"></i>实战类
            </button>
            <button 
              className={`category-filter px-4 py-2 rounded-full font-medium transition-all duration-300 ${activeCategory === 'mixed' ? 'text-white' : 'text-gray-700 hover:bg-gray-300'}`}
              style={{ backgroundColor: activeCategory === 'mixed' ? 'rgb(26 54 93 / var(--tw-bg-opacity, 1))' : 'rgb(229 231 235 / var(--tw-bg-opacity, 1))' }}
              onClick={() => {
                console.log('🎯 点击综合类按钮');
                setActiveCategory('mixed');
              }}
            >
              <i className="fa fa-random mr-2"></i>综合类
            </button>
          </div>
        </div>

        {/* 课程列表 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-500 text-lg">加载课程中...</div>
            </div>
          ) : filteredCourses && filteredCourses.length > 0 ? (
            filteredCourses.map((course: any) => (
              <div key={course.id} className="course-card bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <Link href={`/courses/${course.id}`}>
                  <div className="relative">
                    <Image 
                      src={course.image} 
                      alt={course.title} 
                      width={400}
                      height={225}
                      className="w-full h-48 object-cover" 
                    />
                    <div className="absolute top-3 right-3 text-white text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: course.tagColor }}>
                      {getCategoryName(course.category)}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-lg text-gray-800 mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {getMultiLangContent(course.title, currentLocale)}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {getMultiLangContent(course.description, currentLocale)}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold" style={{ color: 'rgb(26 54 93 / var(--tw-text-opacity, 1))' }}>
                        {course.price}
                      </span>
                      <div className="flex items-center text-gray-500 text-sm">
                        <i className="fa fa-users mr-1"></i>
                        <span>{course.students.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-500 text-lg">
                {activeCategory === 'mixed' ? '综合类暂无课程' : '该分类暂无课程'}
              </div>
              <div className="text-gray-400 text-sm mt-2">
                当前分类: {activeCategory} | 总课程数: {courses.length}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
