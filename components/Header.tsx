"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import Logo from "./Logo";
import { locales, localeNames, localeFlags } from '@/lib/i18n';

export default function Header() {
  const { data: session, status } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  // 监听session变化，确保用户名更新时能及时反映
  useEffect(() => {
    console.log('Header: Session changed', { 
      sessionName: session?.user?.name, 
      currentUserName: userName 
    });
    if (session?.user?.name) {
      setUserName(session.user.name);
    }
  }, [session?.user?.name]);

  // 初始化用户名
  useEffect(() => {
    if (session?.user?.name && !userName) {
      setUserName(session.user.name);
    }
  }, [session?.user?.name, userName]);

  // 监听自定义事件来更新用户名
  useEffect(() => {
    const handleUserUpdate = (event: CustomEvent) => {
      console.log('Header: Received user update event', event.detail);
      if (event.detail?.name) {
        setUserName(event.detail.name);
      }
    };

    window.addEventListener('userUpdated', handleUserUpdate as EventListener);
    return () => {
      window.removeEventListener('userUpdated', handleUserUpdate as EventListener);
    };
  }, []);

  // 从localStorage获取最新的用户名
  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName && storedUserName !== userName) {
      setUserName(storedUserName);
    }
  }, [userName]);

  const handleAuthAction = () => {
    if (session) {
      signOut({ callbackUrl: `/${locale}` });
    } else {
      // 记录当前页面URL，登录后返回
      const currentUrl = pathname + window.location.search;
      const loginUrl = `/${locale}/auth/login?callbackUrl=${encodeURIComponent(currentUrl)}`;
      router.push(loginUrl);
    }
  };

  const handleMyPage = () => {
    setShowDropdown(false);
    router.push(`/${locale}/my`);
  };

  const handleSignOut = () => {
    setShowDropdown(false);
    signOut({ callbackUrl: `/${locale}` });
  };

  // 语言切换功能
  const handleLanguageChange = (newLocale: string) => {
    setShowLanguageDropdown(false);
    // 替换当前路径中的语言部分
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  // 点击外部区域关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Logo />
          </div>
          
          <div className="flex items-center space-x-4">
            {status === "loading" ? (
              <div className="px-4 py-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
              </div>
            ) : session ? (
              // 用户已登录，显示头像下拉菜单
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-orange-500 flex items-center justify-center">
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt={t('header.userAvatar')}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-medium text-sm">
                        {userName?.charAt(0) || session.user?.email?.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                      showDropdown ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* 下拉菜单 */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                    <button
                      onClick={handleMyPage}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {t('header.myPage')}
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      {t('header.signOut')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // 用户未登录，显示登录按钮
              <button
                onClick={handleAuthAction}
                className="px-4 py-2 bg-orange-500 text-white font-medium rounded-md hover:bg-orange-600 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                {t('common.login')}
              </button>
            )}
            
            {/* Language Selector */}
            <div className="relative" ref={languageDropdownRef}>
              <button
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-all duration-300"
                title={t('header.language')}
              >
                <span className="text-lg">{localeFlags[locale as keyof typeof localeFlags]}</span>
                <svg
                  className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                    showLanguageDropdown ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Language Dropdown */}
              {showLanguageDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  {locales.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => handleLanguageChange(loc)}
                      className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 transition-colors duration-200 ${
                        locale === loc ? 'bg-orange-50 text-orange-600' : 'text-gray-700'
                      }`}
                    >
                      <span className="text-lg mr-3">{localeFlags[loc]}</span>
                      {localeNames[loc]}
                      {locale === loc && (
                        <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Mobile menu button */}
            <button type="button" className="md:hidden text-gray-700 hover:text-orange-500 transition-all duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
