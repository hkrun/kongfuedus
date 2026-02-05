import { getPopularCourses } from '@/data/courses';
import { getContentKeyFromLocale } from '@/lib/i18n';
import type { SupportedLocale } from '@/utils/i18n';
import HomePageClient from '@/components/HomePageClient';

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const popularCourses = getPopularCourses(4);
  const contentKey = getContentKeyFromLocale(locale) as SupportedLocale;
  return (
    <HomePageClient
      initialPopularCourses={popularCourses}
      initialLocaleKey={contentKey}
      initialFullLocale={locale}
    />
  );
}
