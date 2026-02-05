"use client";

import { useLocale } from 'next-intl';
import { getLocalizedPath, type Locale } from '@/lib/i18n';

/**
 * Hook to generate localized paths for client components
 * Automatically handles the default locale (en-US) without prefix
 * and other locales with prefix
 */
export function useLocalizedPath() {
  const locale = useLocale();

  return (path: string) => {
    const localizedPath = getLocalizedPath(path, locale as Locale);
    // 如果返回空字符串（根路径的默认语言），返回 '/'
    return localizedPath || '/';
  };
}
