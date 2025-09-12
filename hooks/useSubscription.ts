import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface SubscriptionStatus {
  isActive: boolean;
  isTrial: boolean;
  trialEnd?: number;
  currentPeriodEnd?: number;
  planType?: string;
}

export function useSubscription() {
  const { data: session, status } = useSession();
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    isActive: false,
    isTrial: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      checkSubscriptionStatus();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status, session]);

  const checkSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/stripe/subscription-status');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error('Failed to check subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
      });
      
      if (response.ok) {
        await checkSubscriptionStatus();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      return false;
    }
  };

  return {
    subscription,
    loading,
    checkSubscriptionStatus,
    cancelSubscription,
  };
}
