"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PaymentModal from './PaymentModal';

interface FreeTrialButtonProps {
  className?: string;
  courseId?: string;
  courseTitle?: string;
  price?: string;
  onPaymentSuccess?: (successType: 'trial' | 'one-time') => void;
}

export default function FreeTrialButton({ 
  className = "", 
  courseId, 
  courseTitle = "课程",
  price = "免费试用",
  onPaymentSuccess
}: FreeTrialButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleFreeTrial = async () => {
    if (status === 'loading') return;

    if (!session) {
      // 未登录用户跳转到登录页面
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(`/courses/${courseId}`)}`);
      return;
    }

    if (!session.user?.id || !session.user?.email) {
      return;
    }
    
    // 显示支付弹窗
    setShowPaymentModal(true);
  };

  return (
    <>
      <button
        onClick={handleFreeTrial}
        disabled={status === 'loading' || !session?.user?.id || !session?.user?.email}
        className={`block w-full py-3 bg-[#1a365d] text-white text-center font-semibold rounded-md hover:bg-[#1a365d]/90 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {status === 'loading' ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            加载中...
          </div>
        ) : !session?.user?.id || !session?.user?.email ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            准备中...
          </div>
        ) : (
          <>
            <i className="fa fa-play-circle mr-2"></i>
            3天免费试看
          </>
        )}
      </button>

      {/* 支付弹窗 */}
      {courseId && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          courseId={courseId}
          courseTitle={courseTitle}
          price={price}
          mode="trial"
          onPaymentSuccess={onPaymentSuccess}
        />
      )}
    </>
  );
}
