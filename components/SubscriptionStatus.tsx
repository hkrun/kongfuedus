"use client";

import { useSubscription } from '@/hooks/useSubscription';
import { useTranslations, useLocale } from 'next-intl';

export default function SubscriptionStatus() {
  const t = useTranslations();
  const locale = useLocale();
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
        <h3 className="font-semibold text-gray-800 mb-2">{t('subscription.status')}</h3>
        <p className="text-gray-600 text-sm">{t('subscription.noSubscription')}</p>
        <p className="text-orange-600 text-xs mt-1">{t('subscription.startTrialHint')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-gray-800 mb-2">{t('subscription.status')}</h3>
      
      {subscription.isTrial ? (
        <div className="space-y-2">
          <div className="flex items-center">
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
              {t('subscription.freeTrial')}
            </span>
          </div>
          {subscription.trialEnd && (
            <p className="text-gray-600 text-sm">
              {t('subscription.trialEnds')}{new Date(subscription.trialEnd * 1000).toLocaleDateString(locale)}
            </p>
          )}
          <p className="text-orange-600 text-xs">
            {t('subscription.trialAutoConvert')}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center">
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
              {t('subscription.monthlyMember')}
            </span>
          </div>
          {subscription.currentPeriodEnd && (
            <p className="text-gray-600 text-sm">
              {t('subscription.nextBilling')}{new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString(locale)}
            </p>
          )}
          <p className="text-gray-600 text-xs">{t('subscription.monthlyPrice')}</p>
        </div>
      )}
    </div>
  );
}
