import { courses } from '@/data/courses';
import { categories } from '@/data/categories';
import { getContentKeyFromLocale } from '@/lib/i18n';
import type { SupportedLocale } from '@/utils/i18n';
import CoursesPageClient from '@/components/CoursesPageClient';

type Props = { params: Promise<{ locale: string }> };

export default async function CoursesPage({ params }: Props) {
  const { locale } = await params;
  const contentKey = getContentKeyFromLocale(locale) as SupportedLocale;
  const categoryInfo = categories.reduce<Record<string, any>>((acc, cat) => {
    acc[cat.id] = cat;
    return acc;
  }, {});
  return (
    <CoursesPageClient
      initialCourses={courses}
      initialCategoryInfo={categoryInfo}
      initialLocaleKey={contentKey}
    />
  );
}
