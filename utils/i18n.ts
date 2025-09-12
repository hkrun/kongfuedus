import { MultiLangContent, MultiLangOrString } from '../data/types';

// 支持的语言类型
export type SupportedLocale = 'zh' | 'en' | 'ja' | 'ko' | 'de' | 'fr' | 'ar';

// 获取多语言内容
export function getMultiLangContent(
  content: MultiLangOrString,
  locale: SupportedLocale = 'zh'
): string {
  // 如果是字符串，直接返回（向后兼容）
  if (typeof content === 'string') {
    return content;
  }
  
  // 如果是多语言对象，返回对应语言的内容
  return content[locale] || content.zh || '';
}

// 获取多语言数组内容
export function getMultiLangArrayContent(
  content: MultiLangOrString[],
  locale: SupportedLocale = 'zh'
): string[] {
  // 如果是字符串数组，直接返回（向后兼容）
  if (Array.isArray(content) && content.length > 0 && typeof content[0] === 'string') {
    return content as string[];
  }
  
  // 如果是多语言对象数组，返回对应语言的内容数组
  return content.map(item => getMultiLangContent(item, locale));
}

// 从URL路径获取语言
export function getLocaleFromPath(pathname: string): SupportedLocale {
  const segments = pathname.split('/');
  const locale = segments[1];
  
  // 处理Next.js国际化路由格式 (ja-JP, en-US, ko-KR等)
  if (locale === 'ja-JP') return 'ja';
  if (locale === 'en-US') return 'en';
  if (locale === 'ko-KR') return 'ko';
  if (locale === 'zh-CN') return 'zh';
  if (locale === 'de-DE') return 'de';
  if (locale === 'fr-FR') return 'fr';
  if (locale === 'ar-SA') return 'ar';
  
  // 处理简化格式
  if (['en', 'ja', 'ko', 'de', 'fr', 'ar'].includes(locale)) {
    return locale as SupportedLocale;
  }
  
  return 'en'; // 默认英文
}

// 获取当前语言显示名称
export function getLanguageDisplayName(locale: SupportedLocale): string {
  const names = {
    zh: '中文',
    en: 'English',
    ja: '日本語',
    ko: '한국어',
    de: 'Deutsch',
    fr: 'Français',
    ar: 'العربية'
  };
  
  return names[locale];
}
