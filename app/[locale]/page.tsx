"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations, useLocale } from 'next-intl';
import Header from "../../components/Header";
import ContactModal from "../../components/ContactModal";
import FAQModal from "../../components/FAQModal";
import { getMultiLangContent, getLocaleFromPath, SupportedLocale } from "../../utils/i18n";

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();
  const [currentLocale, setCurrentLocale] = useState<SupportedLocale>('zh');
  const [fullLocale, setFullLocale] = useState<string>('zh-CN'); // 完整的语言代码，如 zh-CN, en-US
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isFAQModalOpen, setIsFAQModalOpen] = useState(false);
  
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

  // 课程数据将在 useEffect 中动态导入
  const [popularCourses, setPopularCourses] = useState<any[]>([]);
  useEffect(() => {
    // 获取当前语言（简化格式）
    const locale = getLocaleFromPath(window.location.pathname);
    setCurrentLocale(locale);

    // 获取完整的语言代码（从URL路径中提取）
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const fullLocaleFromPath = pathSegments[0] || 'zh-CN'; // 默认使用 zh-CN
    setFullLocale(fullLocaleFromPath);
    // Mobile menu toggle
    const mobileMenuButton = document.querySelector('.fa-bars')?.parentElement;
    const mobileMenu = document.querySelector('.md\\:hidden:not(.hidden)');
    
    if (mobileMenuButton && mobileMenu) {
      mobileMenuButton.addEventListener('click', function () {
        mobileMenu.classList.toggle('hidden');
      });
    }
    
    // Header scroll effect
    const handleScroll = () => {
      const header = document.querySelector('header');
      if (header) {
        if (window.scrollY > 50) {
          header.classList.add('shadow-md');
          header.classList.add('bg-white/95');
          header.classList.add('backdrop-blur-sm');
        } else {
          header.classList.remove('shadow-md');
          header.classList.remove('bg-white/95');
          header.classList.remove('backdrop-blur-sm');
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // 动态导入课程数据
    const loadCourseData = async () => {
      try {
        const { getPopularCourses } = await import('../../data/courses');
        const courses = getPopularCourses(4);
        setPopularCourses(courses);
      } catch (error) {
        console.error('Failed to load course data:', error);
      }
    };
    
    loadCourseData();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <main>
      <Header />

      {/* Hero Section */}
             <section className="relative text-white overflow-hidden" style={{ backgroundColor: 'rgb(26 54 93 / var(--tw-bg-opacity, 1))' }}>
        <div className="absolute inset-0 bg-black/30 z-10"></div>
        <div className="absolute inset-0">
          <Image 
            src="https://picsum.photos/id/176/1920/1080" 
            alt="Martial arts training" 
            fill
            className="object-cover" 
          />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-20">
          <div className="max-w-3xl">
                         <h1 className="font-bold text-[clamp(2.5rem,5vw,4rem)] leading-tight mb-6 drop-shadow-lg" style={{ fontFamily: 'Montserrat, sans-serif' }} dangerouslySetInnerHTML={{ __html: t('home.hero.title') }}>
            </h1>
            <p className="text-[clamp(1rem,2vw,1.25rem)] text-gray-100 mb-8 max-w-2xl">
              {t('home.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={`/${locale}/courses`} className="px-8 py-3 text-white font-semibold rounded-md hover:bg-orange-600 transition-all duration-300 text-center shadow-lg hover:shadow-xl transform hover:-translate-y-1" style={{ backgroundColor: 'rgb(237 137 54 / var(--tw-bg-opacity, 1))' }}>
                 {t('home.hero.exploreCourses')}
               </Link>
            </div>
            </div>
          </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
                         <h2 className="font-bold text-[clamp(1.8rem,3vw,2.5rem)] mb-4" style={{ color: 'rgb(26 54 93 / var(--tw-text-opacity, 1))', fontFamily: 'Montserrat, sans-serif' }}>{t('home.features.title')}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">{t('home.features.subtitle')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
               <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'rgb(26 54 93 / 0.1)' }}>
                 <i className="fa fa-video-camera text-blue-900" style={{ fontSize: '1.5rem !important' }}></i>
               </div>
               <h3 className="font-semibold text-xl text-gray-800 mb-3">{t('home.features.highQuality')}</h3>
               <p className="text-gray-600">{t('home.features.highQualityDesc')}</p>
             </div>
            
                         <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
               <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'rgb(26 54 93 / 0.1)' }}>
                 <i className="fa fa-users text-blue-900" style={{ fontSize: '1.5rem !important' }}></i>
               </div>
               <h3 className="font-semibold text-xl text-gray-800 mb-3">{t('home.features.expertInstructors')}</h3>
               <p className="text-gray-600">{t('home.features.expertInstructorsDesc')}</p>
             </div>
            
                         <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
               <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'rgb(26 54 93 / 0.1)' }}>
                 <i className="fa fa-comments text-blue-900" style={{ fontSize: '1.5rem !important' }}></i>
               </div>
               <h3 className="font-semibold text-xl text-gray-800 mb-3">{t('home.features.flexibleLearning')}</h3>
               <p className="text-gray-600">{t('home.features.flexibleLearningDesc')}</p>
             </div>
          </div>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
                             <h2 className="font-bold text-[clamp(1.8rem,3vw,2.5rem)] mb-3" style={{ color: 'rgb(26 54 93 / var(--tw-text-opacity, 1))', fontFamily: 'Montserrat, sans-serif' }}>{t('home.courses.title')}</h2>
              <p className="text-gray-600 max-w-2xl">{t('home.courses.subtitle')}</p>
            </div>
            <Link href={`/${locale}/courses`} className="hidden sm:flex items-center font-medium transition-all duration-300" style={{ color: 'rgb(237 137 54 / var(--tw-text-opacity, 1))' }} onMouseEnter={(e) => e.currentTarget.style.color = 'rgb(26 54 93 / var(--tw-text-opacity, 1))'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgb(237 137 54 / var(--tw-text-opacity, 1))'}>
               {t('home.courses.viewAll')} <i className="fa fa-arrow-right ml-2"></i>
             </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {popularCourses && popularCourses.length > 0 ? popularCourses.map((course: any, index: number) => (
              <div key={course.id} className="bg-gray-50 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group flex flex-col">
                <div className="relative">
                  <Image 
                    src={course.image} 
                    alt={course.title} 
                    width={600}
                    height={400}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-all duration-500" 
                  />
                  {index === 0 && (
                    <div className="absolute top-3 right-3 text-white text-sm font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: 'rgb(237 137 54 / var(--tw-bg-opacity, 1))' }}>
                      {t('home.courses.mostPopular')}
                    </div>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <span className="flex items-center"><i className="fa fa-clock-o mr-1"></i> {course.duration}</span>
                    <span className="mx-3">•</span>
                    <span className="flex items-center"><i className="fa fa-signal mr-1"></i> {getMultiLangContent(course.difficulty, currentLocale)}</span>
                  </div>
                  <h3 className="font-semibold text-lg text-gray-800 mb-2 transition-all duration-300 group-hover:text-[#ed8936]">{getMultiLangContent(course.title, currentLocale)}</h3>
                  <p className="text-gray-600 text-sm mb-4 flex-1" style={textTruncateStyle}>{getMultiLangContent(course.shortDescription, currentLocale)}</p>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <Image 
                        src="https://picsum.photos/id/64/100/100" 
                        alt={course.instructor} 
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover" 
                      />
                      <span className="text-sm text-gray-600 ml-2">{course.instructor}</span>
                    </div>
                    <span className="font-semibold" style={{ color: 'rgb(26 54 93 / var(--tw-text-opacity, 1))' }}>{course.price}</span>
                  </div>
                  <Link href={`/${fullLocale}/courses/${course.id}`} className="block w-full py-2 text-white text-center rounded-md hover:bg-blue-800 transition-all duration-300" style={{ backgroundColor: 'rgb(26 54 93 / var(--tw-bg-opacity, 1))' }}>
                    {t('home.courses.viewCourse')}
                  </Link>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">{t('home.courses.loadingCourses')}</p>
              </div>
            )}
          </div>
          
                     <div className="mt-8 text-center sm:hidden">
            <Link href={`/${locale}/courses`} className="inline-flex items-center font-medium transition-all duration-300" style={{ color: 'rgb(237 137 54 / var(--tw-text-opacity, 1))' }} onMouseEnter={(e) => e.currentTarget.style.color = 'rgb(26 54 93 / var(--tw-text-opacity, 1))'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgb(237 137 54 / var(--tw-text-opacity, 1))'}>
               {t('home.courses.viewAll')} <i className="fa fa-arrow-right ml-2"></i>
                </Link>
           </div>
         </div>
       </section>

      {/* Membership Section */}
             <section className="py-16 text-white" style={{ backgroundColor: 'rgb(26 54 93 / var(--tw-bg-opacity, 1))' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
                         <h2 className="font-bold text-[clamp(1.8rem,3vw,2.5rem)] mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t('home.membership.title')}</h2>
            <p className="text-gray-200 max-w-2xl mx-auto text-lg">{t('home.membership.subtitle')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl">
              <div className="flex items-center mb-6">
                                 <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: 'rgb(237 137 54 / var(--tw-bg-opacity, 1))' }}>
                                     <i className="fa fa-unlock-alt text-white" style={{ fontSize: '1.25rem !important' }}></i>
                </div>
                <h3 className="font-bold text-2xl">{t('home.membership.monthlyMembership')}</h3>
              </div>
              
              <div className="mb-6">
                <span className="text-4xl font-bold">{t('home.membership.price')}</span>
                <span className="text-gray-300">{t('home.membership.perMonth')}</span>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <i className="fa fa-check text-orange-500 mt-1 mr-3"></i>
                  <span>{t('home.membership.features.unlimitedAccess')}</span>
                </li>
                <li className="flex items-start">
                  <i className="fa fa-check text-orange-500 mt-1 mr-3"></i>
                  <span>{t('home.membership.features.downloadVideos')}</span>
                </li>
                <li className="flex items-start">
                  <i className="fa fa-check text-orange-500 mt-1 mr-3"></i>
                  <span>{t('home.membership.features.whatsappAccess')}</span>
                </li>
                <li className="flex items-start">
                  <i className="fa fa-check text-orange-500 mt-1 mr-3"></i>
                  <span>{t('home.membership.features.liveQA')}</span>
                </li>
                <li className="flex items-start">
                  <i className="fa fa-check text-orange-500 mt-1 mr-3"></i>
                  <span>{t('home.membership.features.exclusiveContent')}</span>
                </li>
              </ul>
              
              <Link href={`/${locale}/courses`} className="block w-full py-3 text-white text-center font-semibold rounded-md hover:bg-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl" style={{ backgroundColor: 'rgb(237 137 54 / var(--tw-bg-opacity, 1))' }}>
                 {t('home.membership.freeTrial')}
               </Link>
              
            </div>
            
            <div className="relative">
              <Image 
                src="https://picsum.photos/id/42/800/600" 
                alt="Martial arts training" 
                width={800}
                height={600}
                className="w-full h-auto rounded-xl shadow-2xl" 
              />
                             <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg max-w-xs hidden md:block" style={{ color: 'rgb(26 54 93 / var(--tw-text-opacity, 1))' }}>
                <div className="flex items-center mb-2">
                  <Image 
                    src="https://picsum.photos/id/64/100/100" 
                    alt="Sarah J." 
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover mr-3" 
                  />
                  <div>
                    <h4 className="font-semibold">{t('home.testimonials.sarah.name')}</h4>
                    <div className="flex text-yellow-400 text-xs">
                      <i className="fa fa-star"></i>
                      <i className="fa fa-star"></i>
                      <i className="fa fa-star"></i>
                      <i className="fa fa-star"></i>
                      <i className="fa fa-star"></i>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-700">"{t('home.testimonials.sarah.comment')}"</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
                           <h2 className="font-bold text-[clamp(1.8rem,3vw,2.5rem)] mb-4" style={{ color: 'rgb(26 54 93 / var(--tw-text-opacity, 1))', fontFamily: 'Montserrat, sans-serif' }}>{t('home.testimonials.mainTitle')}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">{t('home.testimonials.mainSubtitle')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-80">
              <div className="flex text-yellow-400 mb-4">
                <i className="fa fa-star"></i>
                <i className="fa fa-star"></i>
                <i className="fa fa-star"></i>
                <i className="fa fa-star"></i>
                <i className="fa fa-star"></i>
              </div>
              <p className="text-gray-600 mb-6 italic flex-1" style={{
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical' as const,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: '1.5em',
                maxHeight: '6em'
              }}>"{t('home.testimonials.michael.comment')}"</p>
              <div className="flex items-center mt-auto">
                <Image 
                  src="https://picsum.photos/id/91/100/100" 
                  alt="Michael T." 
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover mr-4" 
                />
                <div>
                  <h4 className="font-semibold text-gray-800">{t('home.testimonials.michael.name')}</h4>
                  <p className="text-gray-500 text-sm">{t('home.testimonials.michael.title')}</p>
                </div>
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-80">
              <div className="flex text-yellow-400 mb-4">
                <i className="fa fa-star"></i>
                <i className="fa fa-star"></i>
                <i className="fa fa-star"></i>
                <i className="fa fa-star"></i>
                <i className="fa fa-star"></i>
              </div>
              <p className="text-gray-600 mb-6 italic flex-1" style={{
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical' as const,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: '1.5em',
                maxHeight: '6em'
              }}>"{t('home.testimonials.sophia.comment')}"</p>
              <div className="flex items-center mt-auto">
                <Image 
                  src="https://picsum.photos/id/65/100/100" 
                  alt="Sophia L." 
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover mr-4" 
                />
                <div>
                  <h4 className="font-semibold text-gray-800">{t('home.testimonials.sophia.name')}</h4>
                  <p className="text-gray-500 text-sm">{t('home.testimonials.sophia.title')}</p>
                </div>
              </div>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-80">
              <div className="flex text-yellow-400 mb-4">
                <i className="fa fa-star"></i>
                <i className="fa fa-star"></i>
                <i className="fa fa-star"></i>
                <i className="fa fa-star"></i>
                <i className="fa fa-star-half-o"></i>
              </div>
              <p className="text-gray-600 mb-6 italic flex-1" style={{
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical' as const,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: '1.5em',
                maxHeight: '6em'
              }}>"{t('home.testimonials.david.comment')}"</p>
              <div className="flex items-center mt-auto">
                <Image 
                  src="https://picsum.photos/id/22/100/100" 
                  alt="David R." 
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover mr-4" 
                />
                <div>
                  <h4 className="font-semibold text-gray-800">{t('home.testimonials.david.name')}</h4>
                  <p className="text-gray-500 text-sm">{t('home.testimonials.david.title')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
             <section className="py-20" style={{ backgroundColor: 'rgb(237 137 54 / var(--tw-bg-opacity, 1))' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                     <h2 className="font-bold text-[clamp(1.8rem,3vw,2.5rem)] text-white mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t('home.cta.title')}</h2>
          <p className="text-white/90 max-w-2xl mx-auto text-lg mb-8">{t('home.cta.subtitle')}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href={`/${locale}/courses`} className="px-8 py-3 bg-white font-semibold rounded-md hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1" style={{ color: 'rgb(237 137 54 / var(--tw-text-opacity, 1))' }}>
               {t('home.cta.getStarted')}
             </Link>
            <Link href={`/${locale}/courses`} className="px-8 py-3 bg-transparent text-white font-semibold rounded-md border border-white/30 hover:bg-white/10 transition-all duration-300">
              {t('home.cta.browseAll')}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
             <footer className="text-white pt-16 pb-8" style={{ backgroundColor: 'rgb(26 54 93 / var(--tw-bg-opacity, 1))' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
              <div className="flex items-center mb-6">
                                 <i className="fa fa-shield text-orange-500 mr-2" style={{ fontSize: '1.875rem !important' }}></i>
                                 <span className="font-bold text-2xl" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t('home.footer.brandName')}</span>
              </div>
              <p className="text-gray-300 mb-6">{t('home.footer.brandDescription')}</p>
              <div className="flex space-x-4">
                                 <Link href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-orange-500">
                   <i className="fa fa-facebook"></i>
                 </Link>
                                 <Link href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-orange-500">
                   <i className="fa fa-instagram"></i>
                 </Link>
                                 <Link href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-orange-500">
                   <i className="fa fa-youtube-play"></i>
                 </Link>
                                 <Link href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-orange-500">
                   <i className="fa fa-twitter"></i>
                 </Link>
              </div>
          </div>
            
          <div>
                             <h3 className="font-semibold text-lg mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t('home.footer.quickLinks')}</h3>
              <ul className="space-y-3">
                <li><Link href={`/${locale}/courses`} className="text-gray-300 hover:text-orange-500 transition-all duration-300">{t('home.footer.allCourses')}</Link></li>
                <li><Link href={`/${locale}/courses`} className="text-gray-300 hover:text-orange-500 transition-all duration-300">{t('home.footer.instructors')}</Link></li>
                <li><Link href={`/${locale}/my`} className="text-gray-300 hover:text-orange-500 transition-all duration-300">{t('home.footer.membership')}</Link></li>
                <li><Link href={`/${locale}/courses`} className="text-gray-300 hover:text-orange-500 transition-all duration-300">{t('home.footer.freeResources')}</Link></li>
                {/* <li><Link href="#" className="text-gray-300 hover:text-orange-500 transition-all duration-300">{t('home.footer.blog')}</Link></li> */}
            </ul>
          </div>
            
          <div>
                             <h3 className="font-semibold text-lg mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t('home.footer.support')}</h3>
              <ul className="space-y-3">
                <li><button onClick={() => setIsFAQModalOpen(true)} className="text-gray-300 hover:text-orange-500 transition-all duration-300 text-left">{t('home.footer.faqs')}</button></li>
                <li><button onClick={() => setIsContactModalOpen(true)} className="text-gray-300 hover:text-orange-500 transition-all duration-300 text-left">{t('home.footer.contactUs')}</button></li>
                <li><Link href={`/${locale}/legal/privacy`} className="text-gray-300 hover:text-orange-500 transition-all duration-300">{t('home.footer.privacyPolicy')}</Link></li>
                <li><Link href={`/${locale}/legal/terms`} className="text-gray-300 hover:text-orange-500 transition-all duration-300">{t('home.footer.termsOfService')}</Link></li>
                <li><Link href={`/${locale}/legal/refund`} className="text-gray-300 hover:text-orange-500 transition-all duration-300">{t('home.footer.refundPolicy')}</Link></li>
            </ul>
          </div>
            
          <div>
                             <h3 className="font-semibold text-lg mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t('home.footer.newsletter')}</h3>
              <p className="text-gray-300 mb-4">{t('home.footer.newsletterDescription')}</p>
              <form className="mb-4">
                <div className="flex">
                  <input type="email" placeholder={t('home.footer.emailPlaceholder')} className="px-4 py-2 w-full rounded-l-md focus:outline-none text-gray-800" />
                                     <button type="submit" className="px-4 py-2 rounded-r-md hover:bg-orange-600 transition-all duration-300" style={{ backgroundColor: 'rgb(237 137 54 / var(--tw-bg-opacity, 1))' }}>
                     <i className="fa fa-paper-plane"></i>
                   </button>
                </div>
              </form>
              <p className="text-gray-400 text-sm">{t('home.footer.privacyNotice')}</p>
          </div>
        </div>
          
          <div className="border-t border-white/10 pt-8">
            <p className="text-center text-gray-400 text-sm">{t('home.footer.copyright')}</p>
          </div>
        </div>
      </footer>

      {/* 联系我们弹框 */}
      <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
      
      {/* 常见问题弹框 */}
      <FAQModal isOpen={isFAQModalOpen} onClose={() => setIsFAQModalOpen(false)} />
    </main>
  );
}
