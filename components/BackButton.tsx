'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function BackButton() {
  const router = useRouter();
  const t = useTranslations();

  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center text-sm text-gray-600 hover:text-orange-500 transition-colors"
    >
      <i className="fa fa-arrow-left mr-2"></i>
      {t('common.back')}
    </button>
  );
}

