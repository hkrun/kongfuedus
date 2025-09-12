"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from 'next-intl';

interface UserProfile {
  user: {
    id: string;
    name: string;
    email: string;
    image: string;
    createdAt: string;
  };
  subscription: {
    id: string;
    status: string;
    planType: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    trialEnd?: string;
  } | null;
  stats: {
    purchaseCount: number;
    totalCourses: number;
    totalWatchTime: number;
    averageProgress: number;
  };
}

export default function UserStatusCard() {
  const t = useTranslations();
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelingSubscription, setCancelingSubscription] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm(t('userStatusCard.confirmCancel'))) {
      return;
    }

    setCancelingSubscription(true);
    try {
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || t('userStatusCard.cancelSuccess'));
        // 重新获取用户信息
        await fetchUserProfile();
      } else {
        const error = await response.json();
        alert(error.error || t('userStatusCard.cancelError'));
      }
    } catch (error) {
      console.error('取消订阅失败:', error);
      alert(t('userStatusCard.cancelError'));
    } finally {
      setCancelingSubscription(false);
    }
  };

  const getUserStatus = () => {
    // 检查是否有活跃的订阅
    if (profile?.subscription) {
      const subscription = profile.subscription;
      
      // 免费试用状态
      if (subscription.status === 'trialing' || subscription.planType === 'FREE_TRIAL') {
        return { type: 'trial', label: t('userStatusCard.userStatus.trial'), color: 'green' };
      }
      
      // 订阅状态（包括即将到期的订阅）
      if (subscription.status === 'active' || 
          (subscription.status === 'canceled' && subscription.cancelAtPeriodEnd)) {
        return { type: 'subscribed', label: t('userStatusCard.userStatus.subscribed'), color: 'purple' };
      }
    }

    // 没有订阅的用户统一为普通用户（包括购买课程的用户）
    return { type: 'free', label: t('userStatusCard.userStatus.free'), color: 'gray' };
  };

  const formatWatchTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          <p>{t('userStatusCard.error')}</p>
        </div>
      </div>
    );
  }

  const userStatus = getUserStatus();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-orange-500 flex items-center justify-center">
            {profile.user.image ? (
              <img
                src={profile.user.image}
                alt={t('userStatusCard.userAvatar')}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-bold text-xl">
                {profile.user.name?.charAt(0) || profile.user.email?.charAt(0) || 'U'}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {profile.user.name || t('userStatusCard.noNameSet')}
            </h2>
            <p className="text-gray-600">{profile.user.email}</p>
            <div className="flex items-center mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                userStatus.color === 'purple' ? 'bg-purple-100 text-purple-800' :
                userStatus.color === 'green' ? 'bg-green-100 text-green-800' :
                userStatus.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                userStatus.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {userStatus.label}
              </span>
            </div>
          </div>
        </div>
        
        {profile.subscription && (
          <div className="text-right">
            <p className="text-sm text-gray-600">{t('userStatusCard.expiryTime')}</p>
            <p className="font-medium text-gray-900">
              {formatDate(profile.subscription.currentPeriodEnd)}
            </p>
            {profile.subscription.cancelAtPeriodEnd && (
              <p className="text-xs text-orange-600 mt-1">{t('userStatusCard.willCancelAfterExpiry')}</p>
            )}
          </div>
        )}
      </div>

      {/* 学习统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {profile.stats.totalCourses}
          </div>
          <div className="text-sm text-gray-600">{t('userStatusCard.learningCourses')}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {profile.stats.purchaseCount}
          </div>
          <div className="text-sm text-gray-600">{t('userStatusCard.purchasedCourses')}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {formatWatchTime(profile.stats.totalWatchTime)}
          </div>
          <div className="text-sm text-gray-600">{t('userStatusCard.learningTime')}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {Math.round(profile.stats.averageProgress)}%
          </div>
          <div className="text-sm text-gray-600">{t('userStatusCard.averageProgress')}</div>
        </div>
      </div>

      {/* 订阅管理 */}
      {profile.subscription && (
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">{t('userStatusCard.subscriptionManagement')}</h3>
              <p className="text-sm text-gray-600">
                {t('userStatusCard.currentPlan')}：{profile.subscription.planType === 'MONTHLY' ? t('userStatusCard.monthlySubscription') : 
                          profile.subscription.planType === 'YEARLY' ? t('userStatusCard.yearlySubscription') : t('userStatusCard.freeTrial')}
              </p>
            </div>
            {!profile.subscription.cancelAtPeriodEnd && (
              <button
                onClick={handleCancelSubscription}
                disabled={cancelingSubscription}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelingSubscription ? t('userStatusCard.processing') : t('userStatusCard.cancelSubscription')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
