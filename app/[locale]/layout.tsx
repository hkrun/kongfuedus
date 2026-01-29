import type { Metadata } from "next";
import { headers } from "next/headers";
import "../globals.css";
import AuthProvider from "@/components/auth/AuthProvider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/lib/i18n';
import { getCourseById } from '@/data/courses';
import Script from 'next/script';

const SITE_NAME = 'Kong Fu Master';
const DEFAULT_TITLE = 'Kong Fu Master - Learn Kong Fu Online';
const DEFAULT_DESCRIPTION = 'Learn from world-class instructors anytime, anywhere. Join thousands of martial artists mastering their craft through our expert-led video courses.';
const COURSES_LIST_TITLE = 'Courses | Kong Fu Master';
const COURSES_LIST_DESCRIPTION = 'Browse all martial arts courses. Learn Wing Chun, Tai Chi, self-defense and more from expert instructors.';
const HOME_TITLE = 'Kong Fu Master - Learn Kong Fu Online';
const HOME_DESCRIPTION = 'Learn from world-class instructors anytime, anywhere. Join thousands of martial artists mastering their craft through our expert-led video courses.';

const localeToContentKey: Record<string, string> = {
  'en-US': 'en',
  'zh-CN': 'zh',
  'ja-JP': 'ja',
  'ko-KR': 'ko',
  'de-DE': 'de',
  'fr-FR': 'fr',
  'ar-SA': 'ar',
};

function getMultiLangString(value: { [key: string]: string } | string | undefined, key: string): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[key] || value.en || value.zh || '';
}

function truncateDescription(text: string, maxLen = 158): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 3).trim() + '...';
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = (process.env.NEXTAUTH_URL || process.env.APP_URL || 'https://www.kongfunow.com').replace(/\/$/, '');
  const pathname = (await headers()).get('x-pathname') || `/${locale}`;
  const canonical = `${baseUrl}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
  const pathWithoutLocale = pathname.replace(/^\/[^/]+/, '') || '/';
  const languages: Record<string, string> = {};
  for (const loc of locales) {
    languages[loc] = `${baseUrl}/${loc}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;
  }
  languages['x-default'] = `${baseUrl}/en-US${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;

  const segments = pathname.split('/').filter(Boolean);
  const contentKey = localeToContentKey[locale] || 'en';
  let title = DEFAULT_TITLE;
  let description = DEFAULT_DESCRIPTION;

  if (segments.length >= 3 && segments[1] === 'courses') {
    const courseId = segments[2];
    const course = getCourseById(courseId);
    if (course) {
      const courseTitle = getMultiLangString(course.title as { [key: string]: string } | string, contentKey);
      const courseDesc = getMultiLangString(course.description as { [key: string]: string } | string, contentKey);
      title = courseTitle ? `${courseTitle} | ${SITE_NAME}` : DEFAULT_TITLE;
      description = courseDesc ? truncateDescription(courseDesc) : DEFAULT_DESCRIPTION;
    }
  } else if (segments.length === 2 && segments[1] === 'courses') {
    title = COURSES_LIST_TITLE;
    description = COURSES_LIST_DESCRIPTION;
  } else if (segments.length <= 1 || (segments.length === 1 && segments[0] === locale)) {
    title = HOME_TITLE;
    description = HOME_DESCRIPTION;
  }

  return {
    title,
    description,
    alternates: {
      canonical,
      languages,
    },
  };
}

function buildCourseVideoObjectJsonLd(
  baseUrl: string,
  pathname: string,
  locale: string,
  course: { id: string; image: string; chapters?: Array<{ lessons?: Array<{ videoUrl?: string; title: unknown; description?: unknown }> }> }
): string {
  const contentKey = localeToContentKey[locale] || 'en';
  const pageUrl = `${baseUrl}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
  const thumbnailBase = baseUrl + (course.image?.startsWith('/') ? course.image : `/${course.image}`);
  const videoObjects: Array<{
    '@type': string;
    name: string;
    description?: string;
    contentUrl: string;
    embedUrl: string;
    thumbnailUrl?: string;
    uploadDate?: string;
  }> = [];
  const chapters = course.chapters || [];
  for (const ch of chapters) {
    const lessons = ch.lessons || [];
    for (const lesson of lessons) {
      if (!lesson.videoUrl) continue;
      const name = getMultiLangString(lesson.title as { [key: string]: string } | string | undefined, contentKey) || `Lesson`;
      const desc = getMultiLangString(lesson.description as { [key: string]: string } | string | undefined, contentKey);
      videoObjects.push({
        '@type': 'VideoObject',
        name,
        ...(desc ? { description: truncateDescription(desc, 200) } : {}),
        contentUrl: lesson.videoUrl,
        embedUrl: pageUrl,
        thumbnailUrl: thumbnailBase,
        uploadDate: '2024-06-01',
      });
    }
  }
  if (videoObjects.length === 0) return '';
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': videoObjects });
}

export default async function LocaleLayout({
  children,
  params
}: Props) {
  const { locale } = await params;
  
  // 验证语言是否支持
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // 启用静态渲染
  unstable_setRequestLocale(locale);

  // 获取翻译消息
  const messages = await getMessages();

  // 读取GA ID
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  const baseUrl = (process.env.NEXTAUTH_URL || process.env.APP_URL || 'https://www.kongfunow.com').replace(/\/$/, '');
  const pathname = (await headers()).get('x-pathname') || `/${locale}`;
  const segments = pathname.split('/').filter(Boolean);
  let videoJsonLd = '';
  if (segments.length >= 3 && segments[1] === 'courses') {
    const courseId = segments[2];
    const course = getCourseById(courseId);
    if (course) {
      videoJsonLd = buildCourseVideoObjectJsonLd(baseUrl, pathname, locale, course);
    }
  }

  return (
    <html lang={locale} dir={locale === 'ar-SA' ? 'rtl' : 'ltr'}>
      <head>
        <link href="https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@500;600;700;800&display=swap" rel="stylesheet" />
        {videoJsonLd ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: videoJsonLd }}
          />
        ) : null}
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </NextIntlClientProvider>
        {gaId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
            <Script id="google-analytics">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
