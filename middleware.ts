import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en-US', 'zh-CN', 'de-DE', 'fr-FR', 'ja-JP', 'ko-KR', 'ar-SA'],
  defaultLocale: 'en-US'
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
