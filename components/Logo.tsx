"use client";

import Link from "next/link";
import { useLocale } from 'next-intl';

export default function Logo() {
  const locale = useLocale();
  
  return (
    <Link href={`/${locale}`} className="logo-container group">
      {/* 使用SVG图标，确保在所有情况下都保持正确大小 */}
      <div className="logo-icon mr-3">
        <svg 
          className="w-full h-full text-orange-500 transition-all duration-300 group-hover:scale-110" 
          viewBox="0 0 24 24" 
          fill="currentColor"
          aria-label="Martial Arts Shield"
        >
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l6 2.67v4.15c0 4.56-2.79 8.84-6 9.82-3.21-.98-6-5.26-6-9.82V7.85l6-2.67z"/>
          <path d="M12 6.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5zm0 3.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
        </svg>
      </div>
      
      {/* 文字部分 - 移动端显示 "Kong Fu"，PC端显示 "Kong Fu Master" */}
      <span className="logo-text md:hidden text-sm text-blue-900 transition-all duration-300 group-hover:text-blue-800">
        Kong Fu
      </span>
      <span className="logo-text hidden md:inline text-base text-blue-900 transition-all duration-300 group-hover:text-blue-800">
        Kong Fu Master
      </span>
    </Link>
  );
}
