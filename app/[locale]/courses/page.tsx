"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from 'next-intl';
import Header from "../../../components/Header";
import { getMultiLangContent, getLocaleFromPath, SupportedLocale } from "../../../utils/i18n";

export default function CoursesPage() {
  const t = useTranslations();
  const [activeCategory, setActiveCategory] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState<SupportedLocale>('zh');

  // 添加自定义样式用于文本截断
  const textTruncateStyle = {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: '1.4em',
    maxHeight: '2.8em'
  };

  // 导入分类信息
  const [categoryInfo, setCategoryInfo] = useState<any>({});

  // 课程数据
  const [courses, setCourses] = useState<any[]>([]);

  // 过滤课程
  const filteredCourses = activeCategory === 'all' 
    ? courses 
    : courses.filter(course => course.category === activeCategory);

  // 渲染星级评分
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={i} className="fa fa-star"></i>);
    }
    
    if (hasHalfStar) {
      stars.push(<i key="half" className="fa fa-star-half-o"></i>);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="fa fa-star-o"></i>);
    }

    return stars;
  };

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
        const { courses: allCourses } = await import('../../../data/courses');
        const { categories } = await import('../../../data/categories');
        setCategoryInfo(categories.reduce((acc: any, cat: any) => {
          acc[cat.id] = cat;
          return acc;
        }, {}));
        setCourses(allCourses);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    
    loadData();
    
    // Header scroll effect
    const handleScroll = () => {
      const header = document.querySelector('header');
      if (header) {
        if (window.scrollY > 50) {
          header.classList.add('shadow-md');
          header.classList.remove('shadow-sm');
        } else {
          header.classList.remove('shadow-md');
          header.classList.add('shadow-sm');
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <main className="bg-gray-50 font-sans text-gray-800">
      <Header />

      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="text-sm text-gray-500">
            <Link href="/" className="hover:text-orange-500 transition-all duration-300">{t('common.home')}</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-700">{t('courses.allCourses')}</span>
          </div>
        </div>
      </div>

      <main className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="font-bold text-[clamp(1.8rem,3vw,2.8rem)] mb-4" style={{ color: 'rgb(26 54 93 / var(--tw-text-opacity, 1))', fontFamily: 'Montserrat, sans-serif' }}>{t('courses.pageTitle')}</h1>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg">{t('courses.pageDescription')}</p>
          </div>
          
          {/* Category Filters */}
          <div className="mb-10 overflow-x-auto scrollbar-hide">
            <div className="flex space-x-2 md:space-x-4 min-w-max justify-center pb-2">
              <button 
                className={`category-filter px-4 py-2 rounded-full font-medium transition-all duration-300 ${activeCategory === 'all' ? 'text-white' : 'text-gray-700 hover:bg-gray-300'}`}
                style={{ backgroundColor: activeCategory === 'all' ? 'rgb(26 54 93 / var(--tw-bg-opacity, 1))' : 'rgb(229 231 235 / var(--tw-bg-opacity, 1))' }}
                onClick={() => setActiveCategory('all')}
              >
{t('courses.allCourses')}
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
                <i className="fa fa-circle-o-notch mr-2"></i>太极类
              </button>
              <button 
                className={`category-filter px-4 py-2 rounded-full font-medium transition-all duration-300 ${activeCategory === 'weapons' ? 'text-white' : 'text-gray-700 hover:bg-gray-300'}`}
                style={{ backgroundColor: activeCategory === 'weapons' ? 'rgb(26 54 93 / var(--tw-bg-opacity, 1))' : 'rgb(229 231 235 / var(--tw-bg-opacity, 1))' }}
                onClick={() => setActiveCategory('weapons')}
              >
                <i className="fa fa-balance-scale mr-2"></i>器械类
              </button>
              <button 
                className={`category-filter px-4 py-2 rounded-full font-medium transition-all duration-300 ${activeCategory === 'health' ? 'text-white' : 'text-gray-700 hover:bg-gray-300'}`}
                style={{ backgroundColor: activeCategory === 'health' ? 'rgb(26 54 93 / var(--tw-bg-opacity, 1))' : 'rgb(229 231 235 / var(--tw-bg-opacity, 1))' }}
                onClick={() => setActiveCategory('health')}
              >
                <i className="fa fa-heartbeat mr-2"></i>养生类
              </button>
              <button 
                className={`category-filter px-4 py-2 rounded-full font-medium transition-all duration-300 ${activeCategory === 'combat' ? 'text-white' : 'text-gray-700 hover:bg-gray-300'}`}
                style={{ backgroundColor: activeCategory === 'combat' ? 'rgb(26 54 93 / var(--tw-bg-opacity, 1))' : 'rgb(229 231 235 / var(--tw-bg-opacity, 1))' }}
                onClick={() => setActiveCategory('combat')}
              >
                <i className="fa fa-shield mr-2"></i>实战类
              </button>
              <button 
                className={`category-filter px-4 py-2 rounded-full font-medium transition-all duration-300 ${activeCategory === 'mixed' ? 'text-white' : 'text-gray-700 hover:bg-gray-300'}`}
                style={{ backgroundColor: activeCategory === 'mixed' ? 'rgb(26 54 93 / var(--tw-bg-opacity, 1))' : 'rgb(229 231 235 / var(--tw-bg-opacity, 1))' }}
                onClick={() => setActiveCategory('mixed')}
              >
                <i className="fa fa-random mr-2"></i>综合类
              </button>
            </div>
          </div>
          
          {/* Category Headers */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center justify-between">
              <div>
                <h2 className="font-bold text-2xl mb-2" style={{ color: 'rgb(26 54 93 / var(--tw-text-opacity, 1))', fontFamily: 'Montserrat, sans-serif' }}>{categoryInfo[activeCategory as keyof typeof categoryInfo]?.title || activeCategory}</h2>
                <p className="text-gray-600">{categoryInfo[activeCategory as keyof typeof categoryInfo]?.description || ''}</p>
              </div>
              <div className="mt-4 sm:mt-0">
                <select className="bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                  <option>Most Popular</option>
                  <option>Newest</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Highest Rated</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Courses Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses && filteredCourses.length > 0 ? filteredCourses.map((course: any) => (
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
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                      <i className="fa fa-play-circle text-white play-icon-large"></i>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center text-yellow-400 text-sm mb-2">
                      {renderStars(course.rating)}
                      <span className="text-gray-500 ml-1">({Math.round(course.rating * 20)})</span>
                    </div>
                    <h3 className="font-semibold text-lg text-gray-800 mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>{getMultiLangContent(course.title, currentLocale)}</h3>
                    <p className="text-gray-600 text-sm mb-3" style={textTruncateStyle}>{getMultiLangContent(course.description, currentLocale)}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold" style={{ color: 'rgb(26 54 93 / var(--tw-text-opacity, 1))' }}>{course.price}</span>
                      <div className="flex items-center text-gray-500 text-sm">
                        <i className="fa fa-users mr-1"></i>
                        <span>{course.students.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )) : (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-500 text-lg">加载课程中...</div>
              </div>
            )}
          </div>
          
          {/* Load More Button */}
          <div className="mt-12 text-center">
            <button className="px-8 py-3 bg-white border border-gray-300 font-semibold rounded-md hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow" style={{ color: 'rgb(26 54 93 / var(--tw-text-opacity, 1))' }}>
              Load More Courses <i className="fa fa-refresh ml-2"></i>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-white pt-16 pb-8 mt-20" style={{ backgroundColor: 'rgb(26 54 93 / var(--tw-bg-opacity, 1))' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center mb-6">
                <i className="fa fa-shield mr-2" style={{ fontSize: '1.875rem', color: 'rgb(237 137 54 / var(--tw-text-opacity, 1))' }}></i>
                <span className="font-bold text-2xl" style={{ fontFamily: 'Montserrat, sans-serif' }}>Kong Fu Master</span>
              </div>
              <p className="text-gray-300 mb-6">Learn from the world's leading martial arts instructors and master your chosen discipline at your own pace.</p>
              <div className="flex space-x-4">
                <Link href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-orange-500 transition-all duration-300">
                  <i className="fa fa-facebook"></i>
                </Link>
                <Link href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-orange-500 transition-all duration-300">
                  <i className="fa fa-twitter"></i>
                </Link>
                <Link href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-orange-500 transition-all duration-300">
                  <i className="fa fa-instagram"></i>
                </Link>
                <Link href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-orange-500 transition-all duration-300">
                  <i className="fa fa-youtube-play"></i>
                </Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>Quick Links</h3>
              <ul className="space-y-3">
                <li><Link href="/" className="text-gray-300 hover:text-orange-500 transition-all duration-300">Home</Link></li>
                <li><Link href="/courses" className="text-gray-300 hover:text-orange-500 transition-all duration-300">All Courses</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-orange-500 transition-all duration-300">Instructors</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-orange-500 transition-all duration-300">About Us</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-orange-500 transition-all duration-300">Blog</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-orange-500 transition-all duration-300">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>Course Categories</h3>
              <ul className="space-y-3">
                <li><Link href="#" className="text-gray-300 hover:text-orange-500 transition-all duration-300">拳术类</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-orange-500 transition-all duration-300">太极类</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-orange-500 transition-all duration-300">器械类</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-orange-500 transition-all duration-300">养生类</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-orange-500 transition-all duration-300">实战类</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-orange-500 transition-all duration-300">综合类</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <i className="fa fa-map-marker mt-1 mr-3" style={{ color: 'rgb(237 137 54 / var(--tw-text-opacity, 1))' }}></i>
                  <span className="text-gray-300">123 Martial Arts Street, Tokyo, Japan</span>
                </li>
                <li className="flex items-center">
                  <i className="fa fa-phone mr-3" style={{ color: 'rgb(237 137 54 / var(--tw-text-opacity, 1))' }}></i>
                  <span className="text-gray-300">+81 123 456 7890</span>
                </li>
                <li className="flex items-center">
                  <i className="fa fa-envelope mr-3" style={{ color: 'rgb(237 137 54 / var(--tw-text-opacity, 1))' }}></i>
                  <span className="text-gray-300">info@martialartsmastery.com</span>
                </li>
              </ul>
              
              <div className="mt-6">
                <h4 className="font-medium mb-3">Subscribe to our newsletter</h4>
                <form className="flex">
                  <input type="email" placeholder="Your email" className="px-4 py-2 rounded-l-md w-full focus:outline-none text-gray-800" />
                  <button type="submit" className="px-4 py-2 rounded-r-md transition-all duration-300" style={{ backgroundColor: 'rgb(237 137 54 / var(--tw-bg-opacity, 1))' }}>
                    <i className="fa fa-paper-plane"></i>
                  </button>
                </form>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">© 2023 Martial Arts Mastery. All rights reserved.</p>
              <div className="flex space-x-6">
                <Link href="#" className="text-gray-400 hover:text-orange-500 text-sm transition-all duration-300">Privacy Policy</Link>
                <Link href="#" className="text-gray-400 hover:text-orange-500 text-sm transition-all duration-300">Terms of Service</Link>
                <Link href="#" className="text-gray-400 hover:text-orange-500 text-sm transition-all duration-300">Cookie Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
