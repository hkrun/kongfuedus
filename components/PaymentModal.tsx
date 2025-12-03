'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';
import { X, CreditCard, Shield, CheckCircle } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import { purchaseCourse } from '@/lib/analytics';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle?: string;
  price?: string;
  mode?: 'purchase' | 'trial';
  onPaymentSuccess?: (successType: 'trial' | 'one-time') => void;
}

// 延迟加载Stripe，只在需要时初始化
let stripePromise: Promise<any> | null = null;

const getStripePromise = () => {
  if (!stripePromise) {
    console.log('初始化Stripe...');
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

export default function PaymentModal({
  isOpen,
  onClose,
  courseId,
  courseTitle = '课程',
  price = '¥99',
  mode = 'purchase',
  onPaymentSuccess
}: PaymentModalProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [clientSecretCache, setClientSecretCache] = useState<{ secret: string; locale: string } | null>(null);
  const [loadStartTime, setLoadStartTime] = useState<number | null>(null);

  // 优化用户状态检查 - 立即检查并设置状态
  useEffect(() => {
    // 锁定/解锁背景滚动
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // 如果模态框打开且用户已登录，立即设置就绪状态
    if (isOpen && session?.user?.id && session?.user?.email) {
      setLoadStartTime(Date.now());
      setIsReady(true);
    } else if (!isOpen) {
      // 模态框关闭时重置状态
      setError(null);
      setIsReady(false);
      setClientSecretCache(null); // 清除缓存
      setLoadStartTime(null);
    }

    // 清理函数
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, session]);

  // 预加载支付信息 - 当模态框打开时立即开始准备
  useEffect(() => {
    if (isOpen && session?.user?.id && session?.user?.email) {
      // 立即开始准备支付信息，不等待用户状态完全加载
      setIsReady(true);

      // 预加载客户端密钥（如果缓存不存在或语言已改变）
      if (!clientSecretCache || clientSecretCache.locale !== locale) {
        preloadClientSecret();
      }
    }
  }, [isOpen, session?.user?.id, session?.user?.email]);

  // 预加载客户端密钥
  const preloadClientSecret = useCallback(async () => {
    if (!session?.user?.id || !session?.user?.email) return;

    try {
      const apiEndpoint = mode === 'trial'
        ? '/api/stripe/create-checkout-session'
        : '/api/stripe/create-one-time-payment';

      const requestBody = mode === 'trial'
        ? {
          planType: 'FREE_TRIAL',
          courseId,
          locale,
        }
        : {
          courseId,
          userId: session.user.id,
          customerEmail: session.user.email,
          locale,
        };

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.clientSecret) {
          setClientSecretCache({ secret: data.clientSecret, locale });
        }
      }
    } catch (error) {
      console.log('预加载客户端密钥失败，将在需要时重新获取');
    }
  }, [session?.user?.id, session?.user?.email, courseId, mode, locale]);

  // 处理支付成功回调
  const handlePaymentSuccess = useCallback(() => {
    console.log('支付成功回调被触发');
    onClose();

    // 跟踪购买事件（仅限一次性购买，不包括试用）
    if (mode === 'purchase') {
      // 从价格字符串中提取数字（移除货币符号）
      const priceValue = parseFloat(price.replace(/[^\d.]/g, '')) || 0;
      purchaseCourse(courseId, courseTitle, 'Martial Arts Course', priceValue);
    }

    // 显示即时成功提示
    const successMessage = mode === 'trial'
      ? t('payment.trialSuccess')
      : t('payment.purchaseSuccess');

    // 创建临时成功提示
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 z-[10001] bg-green-50 border-l-4 border-green-400 p-4 rounded-lg shadow-lg';
    successDiv.innerHTML = `
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-green-700 font-medium">${successMessage}</p>
        </div>
      </div>
    `;

    document.body.appendChild(successDiv);

    // 根据模式设置不同的成功参数
    const successParam = mode === 'trial' ? 'trial' : 'one-time';

    // 调用父组件的成功回调
    if (onPaymentSuccess) {
      onPaymentSuccess(successParam);
    }

    // 延迟移除临时提示
    setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.parentNode.removeChild(successDiv);
      }
    }, 2000);
  }, [onClose, mode, onPaymentSuccess, courseId, courseTitle, price]);

  // 获取客户端密钥 - 优化版本
  const fetchClientSecret = useCallback(() => {
    if (!session?.user?.id) {
      console.error('用户ID不存在，请先登录');
      return Promise.reject(new Error('用户ID不存在，请先登录'));
    }

    if (!session?.user?.email) {
      console.error('用户邮箱不存在');
      return Promise.reject(new Error('用户邮箱不存在'));
    }

    // 如果有缓存的客户端密钥且语言匹配，直接返回
    if (clientSecretCache && clientSecretCache.locale === locale) {
      console.log('使用缓存的客户端密钥，跳过API调用');
      return Promise.resolve(clientSecretCache.secret);
    }

    const apiStartTime = Date.now();
    console.log('开始API调用获取客户端密钥...');

    // 创建 Checkout Session
    const apiEndpoint = mode === 'trial'
      ? '/api/stripe/create-checkout-session'
      : '/api/stripe/create-one-time-payment';

    const requestBody = mode === 'trial'
      ? {
        planType: 'FREE_TRIAL',
        courseId,
        locale,
      }
      : {
        courseId,
        userId: session.user.id,
        customerEmail: session.user.email,
        locale,
      };

    return fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.error) {
          throw new Error(data.error);
        }

        const apiEndTime = Date.now();
        console.log(`API调用完成，耗时: ${apiEndTime - apiStartTime}ms`);

        // 缓存客户端密钥（包含语言信息）
        setClientSecretCache({ secret: data.clientSecret, locale });
        return data.clientSecret;
      })
      .catch((error) => {
        const apiEndTime = Date.now();
        console.error(`API调用失败，耗时: ${apiEndTime - apiStartTime}ms`, error);
        setError(error.message);
        throw error;
      });
  }, [session?.user?.id, session?.user?.email, courseId, clientSecretCache, mode, locale]);

  const options = {
    fetchClientSecret,
    onComplete: handlePaymentSuccess
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50">
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-5xl h-[80vh] bg-white rounded-lg shadow-xl overflow-hidden mx-2 z-[10000]">
        {/* 关闭按钮 - 右上角 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[10000] p-2 hover:bg-gray-200 active:bg-gray-300 rounded-full transition-colors touch-manipulation bg-white/80 backdrop-blur-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 内容区域 - STRIPE Embedded Checkout */}
        <div className="flex-1 h-full">
          {error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('payment.paymentPreparationFailed')}</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 active:bg-orange-700 transition-colors touch-manipulation"
                >
                  {t('payment.retry')}
                </button>
              </div>
            </div>
          ) : !isReady ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-600">{t('payment.loadingPaymentInfo')}</p>
              </div>
            </div>
          ) : (
            <div className="h-full relative pt-5">
              <EmbeddedCheckoutProvider
                stripe={getStripePromise()}
                options={options}
              >
                <EmbeddedCheckout className="w-full h-full overflow-auto" />
              </EmbeddedCheckoutProvider>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
