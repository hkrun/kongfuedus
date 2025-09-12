import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// 支持的语言列表
export const locales = ['zh-CN', 'en-US', 'de-DE', 'fr-FR', 'ja-JP', 'ko-KR', 'ar-SA'] as const;
export type Locale = (typeof locales)[number];

// 语言显示名称映射
export const localeNames: Record<Locale, string> = {
  'zh-CN': '中文',
  'en-US': 'English',
  'de-DE': 'Deutsch',
  'fr-FR': 'Français',
  'ja-JP': '日本語',
  'ko-KR': '한국어',
  'ar-SA': 'العربية'
};

// 语言标志映射
export const localeFlags: Record<Locale, string> = {
  'zh-CN': '🇨🇳',
  'en-US': '🇺🇸',
  'de-DE': '🇩🇪',
  'fr-FR': '🇫🇷',
  'ja-JP': '🇯🇵',
  'ko-KR': '🇰🇷',
  'ar-SA': '🇸🇦'
};

// 检查语言是否支持
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

// 获取默认语言
export function getDefaultLocale(): Locale {
  return 'zh-CN';
}

// 语言检测配置
export default getRequestConfig(async ({ locale }) => {
  // 验证语言是否支持
  if (!isValidLocale(locale)) {
    notFound();
  }

  return {
    messages: (await import(`../messages/${locale}.json`)).default,
    timeZone: 'Asia/Shanghai',
    now: new Date(),
    formats: {
      dateTime: {
        short: {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }
      },
      number: {
        precise: {
          maximumFractionDigits: 5
        }
      },
      list: {
        enumeration: {
          style: 'long',
          type: 'conjunction'
        }
      }
    }
  };
});
