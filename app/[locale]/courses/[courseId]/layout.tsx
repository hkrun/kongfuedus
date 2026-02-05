import { getCourseDetailById } from '@/data/courses';
import { getContentKeyFromLocale } from '@/lib/i18n';
import { getMultiLangContent } from '@/utils/i18n';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string; courseId: string }>;
};

export default async function CourseDetailLayout({ children, params }: Props) {
  const { locale, courseId } = await params;
  const course = getCourseDetailById(courseId);
  const contentKey = getContentKeyFromLocale(locale) as 'zh' | 'en' | 'ja' | 'ko' | 'de' | 'fr' | 'ar';
  return (
    <>
      {course ? (
        <section className="sr-only" aria-hidden="true" data-seo-content>
          <h1>{getMultiLangContent(course.title, contentKey)}</h1>
          <p>{getMultiLangContent(course.description, contentKey)}</p>
        </section>
      ) : null}
      {children}
    </>
  );
}
