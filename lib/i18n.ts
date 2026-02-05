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

// 路由 locale 到内容 key 的映射（用于服务端首屏渲染与 SEO）
export const localeToContentKey: Record<string, string> = {
  'en-US': 'en',
  'zh-CN': 'zh',
  'ja-JP': 'ja',
  'ko-KR': 'ko',
  'de-DE': 'de',
  'fr-FR': 'fr',
  'ar-SA': 'ar',
};

export function getContentKeyFromLocale(locale: string): string {
  return localeToContentKey[locale] || 'en';
}

// 检查语言是否支持
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

// 获取默认语言
export function getDefaultLocale(): Locale {
  return 'en-US';
}

// 生成本地化路径（用于as-needed模式）
// 默认语言（en-US）不需要前缀，其他语言需要前缀
export function getLocalizedPath(path: string, locale: Locale): string {
  const defaultLocale = 'en-US';
  
  // 确保路径以 / 开头
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  if (locale === defaultLocale) {
    // 默认语言不需要前缀
    return cleanPath === '/' ? '' : cleanPath;
  } else {
    // 其他语言需要前缀
    return `/${locale}${cleanPath === '/' ? '' : cleanPath}`;
  }
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
