import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware({
  // 支持的语言列表
  locales: ['en-US', 'zh-CN', 'de-DE', 'fr-FR', 'ja-JP', 'ko-KR', 'ar-SA'],
  
  // 默认语言（当浏览器语言不支持时的回退语言）
  defaultLocale: 'en-US',
  
  // 始终在 URL 中显示语言前缀
  localePrefix: 'always',
  
  // 启用自动语言检测（基于 Accept-Language 头）
  localeDetection: true
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
  
  // 如果访问根路径或不带语言代码的路径，intl middleware 会：
  // 1. 读取 Accept-Language 头
  // 2. 匹配支持的语言
  // 3. 重定向到对应的语言版本（如 /zh-CN/, /ja-JP/, /en-US/ 等）
  // 4. 如果浏览器语言不支持，使用 defaultLocale (en-US)
  
  // 如果路径已经包含语言代码，直接使用该语言，不做检测
  // 这样用户手动切换语言后不会被自动检测覆盖
  
  const response = intlMiddleware(request);
  
  // 确保不设置语言偏好 cookie，每次都重新检测
  // （对于不带语言代码的请求）
  if (!pathnameHasLocale && response) {
    // 删除可能的语言偏好 cookie
    response.cookies.delete('NEXT_LOCALE');
  }
  
  return response;
}

export const config = {
  // 匹配所有路径，但排除:
  // - _next (Next.js 内部文件)
  // - _vercel (Vercel 内部文件)  
  // - 静态文件（包含点号的文件，如 .jpg, .css 等）
  matcher: ['/((?!_next|_vercel|.*\\..*).*)']
};
