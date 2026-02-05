import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware({
  // 支持的语言列表
  locales: ['en-US', 'zh-CN', 'de-DE', 'fr-FR', 'ja-JP', 'ko-KR', 'ar-SA'],
  
  // 默认语言
  defaultLocale: 'en-US',
  
  // 只在需要时显示语言前缀（默认语言不显示前缀，其他语言显示）
  // 这样根路径 / 直接显示英文内容，无需重定向，SEO 友好
  localePrefix: 'as-needed',
  
  // 关闭自动语言检测，避免根据浏览器语言自动跳转
  localeDetection: false
});

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // 完全跳过所有 API 路由，特别是 webhook
  if (pathname.startsWith('/api')) {
    return;
  }
  
  // 检查路径是否已经包含语言代码
  const locales = ['en-US', 'zh-CN', 'de-DE', 'fr-FR', 'ja-JP', 'ko-KR', 'ar-SA'];
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  
  // 使用 'as-needed' 模式：
  // - 根路径 / 直接显示英文内容，无需重定向（SEO 友好）
  // - /zh-CN/, /ja-JP/ 等路径显示对应语言内容
  // - 用户可以通过页面上的语言切换器选择语言

  // 将 pathname（不含 query）传给 layout，用于生成 canonical 与 hreflang
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);
  const modifiedRequest = new NextRequest(request.url, { method: request.method, headers: requestHeaders });
  const response = intlMiddleware(modifiedRequest);
  
  return response;
}

export const config = {
  // 匹配所有路径，但排除:
  // - _next (Next.js 内部文件)
  // - _vercel (Vercel 内部文件)  
  // - 静态文件（包含点号的文件，如 .jpg, .css 等）
  matcher: ['/((?!_next|_vercel|.*\\..*).*)']
};
