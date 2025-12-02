import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['en-US', 'zh-CN', 'de-DE', 'fr-FR', 'ja-JP', 'ko-KR', 'ar-SA'],
  defaultLocale: 'en-US'
});

export default function middleware(request: NextRequest) {
  // 完全跳过所有 API 路由，特别是 webhook
  if (request.nextUrl.pathname.startsWith('/api')) {
    return;
  }
  
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)']
};
