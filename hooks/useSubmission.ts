import { useState, useCallback } from 'react';

interface UseSubmissionOptions {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

interface UseSubmissionReturn {
  isSubmitting: boolean;
  submit: (submitFn: () => Promise<any>) => Promise<void>;
  reset: () => void;
}

/**
 * 防重复提交的Hook
 * 防止用户在短时间内多次点击提交按钮
 */
export function useSubmission(options: UseSubmissionOptions = {}): UseSubmissionReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = useCallback(async (submitFn: () => Promise<any>) => {
    // 如果正在提交中，直接返回
    if (isSubmitting) {
      console.warn('正在提交中，请勿重复点击');
      return;
    }

    try {
      setIsSubmitting(true);
      await submitFn();
      options.onSuccess?.();
    } catch (error) {
      console.error('提交失败:', error);
      options.onError?.(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, options]);

  const reset = useCallback(() => {
    setIsSubmitting(false);
  }, []);

  return {
    isSubmitting,
    submit,
    reset,
  };
}
