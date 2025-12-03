'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import PaymentModal from './PaymentModal';

interface PurchaseButtonProps {
  className?: string;
  courseId?: string;
  courseTitle?: string;
  price?: string;
  onPaymentSuccess?: (successType: 'trial' | 'one-time') => void;
}

export default function PurchaseButton({ 
  className = "", 
  courseId, 
  courseTitle = "课程",
  price = "¥99",
  onPaymentSuccess
}: PurchaseButtonProps) {
  const t = useTranslations();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handlePurchase = async () => {
    if (status === 'loading') return;

    if (!session) {
      // 未登录用户跳转到登录页面
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(`/courses/${courseId}`)}`);
      return;
    }

    if (!session.user?.id || !session.user?.email) {
      return;
    }
    
    // 显示支付浮层
    setShowPaymentModal(true);
  };

  return (
    <>
      <button
        onClick={handlePurchase}
        disabled={status === 'loading' || !session?.user?.id || !session?.user?.email}
        className={`block w-full py-3 bg-[#ed8936] text-white text-center font-semibold rounded-md hover:bg-[#ed8936]/90 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {status === 'loading' ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            {t('common.loading')}
          </div>
        ) : !session?.user?.id || !session?.user?.email ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            {t('payment.preparing')}
          </div>
        ) : (
          t('payment.purchaseThisCourse')
        )}
      </button>

      {/* 支付浮层 */}
      {courseId && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          courseId={courseId}
          courseTitle={courseTitle}
          price={price}
          onPaymentSuccess={onPaymentSuccess}
        />
      )}
    </>
  );
}
