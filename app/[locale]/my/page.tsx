"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from 'next-intl';
import Header from "../../../components/Header";
import UserStatusCard from "../../../components/UserStatusCard";
import PurchasedCoursesList from "../../../components/PurchasedCoursesList";
import RecentVideosList from "../../../components/RecentVideosList";
import AccountSettings from "../../../components/AccountSettings";
import PurchaseHistory from "../../../components/PurchaseHistory";

export default function MyPage() {
  const t = useTranslations();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  // 如果用户未登录，重定向到登录页面
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // 加载中状态
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <span className="ml-3 text-gray-600">{t('myPage.loading')}</span>
          </div>
        </div>
      </div>
    );
  }

  // 未登录状态
  if (!session) {
    return null;
  }

  const tabs = [
    { id: 'overview', label: t('myPage.tabs.overview'), icon: '📊' },
    { id: 'courses', label: t('myPage.tabs.courses'), icon: '📚' },
    { id: 'recent', label: t('myPage.tabs.recent'), icon: '🎬' },
    { id: 'settings', label: t('myPage.tabs.settings'), icon: '⚙️' },
    { id: 'history', label: t('myPage.tabs.history'), icon: '📋' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('myPage.title')}
          </h1>
          <p className="text-gray-600">
            {t('myPage.subtitle')}
          </p>
        </div>

        {/* 标签页导航 */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <UserStatusCard />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PurchasedCoursesList limit={3} />
                <RecentVideosList limit={3} />
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <PurchasedCoursesList />
          )}

          {activeTab === 'recent' && (
            <RecentVideosList />
          )}

          {activeTab === 'settings' && (
            <AccountSettings />
          )}

          {activeTab === 'history' && (
            <PurchaseHistory />
          )}
        </div>
      </div>
    </div>
  );
}
