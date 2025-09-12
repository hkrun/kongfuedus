"use client";

import { useSubscription } from '@/hooks/useSubscription';

export default function SubscriptionStatus() {
  const { subscription, loading } = useSubscription();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!subscription.isActive) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-gray-800 mb-2">订阅状态</h3>
        <p className="text-gray-600 text-sm">您还没有激活订阅</p>
        <p className="text-orange-600 text-xs mt-1">点击"3天免费试看"开始试用</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-gray-800 mb-2">订阅状态</h3>
      
      {subscription.isTrial ? (
        <div className="space-y-2">
          <div className="flex items-center">
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
              免费试用中
            </span>
          </div>
          {subscription.trialEnd && (
            <p className="text-gray-600 text-sm">
              试用期结束：{new Date(subscription.trialEnd * 1000).toLocaleDateString('zh-CN')}
            </p>
          )}
          <p className="text-orange-600 text-xs">
            试用期结束后将自动转为$39/月订阅
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center">
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
              月度会员
            </span>
          </div>
          {subscription.currentPeriodEnd && (
            <p className="text-gray-600 text-sm">
              下次扣费：{new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString('zh-CN')}
            </p>
          )}
          <p className="text-gray-600 text-xs">$39/月</p>
        </div>
      )}
    </div>
  );
}
