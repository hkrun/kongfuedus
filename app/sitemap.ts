import { MetadataRoute } from 'next';
import { locales } from '@/lib/i18n';
import { courses } from '@/data/courses';

export default function sitemap(): MetadataRoute.Sitemap {
  // 获取网站基础URL，优先使用环境变量，否则使用默认值
  const baseUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || 'https://yourdomain.com';

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // 为每个语言版本生成URL
  for (const locale of locales) {
    // 首页
    sitemapEntries.push({
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    });

    // 课程列表页
    sitemapEntries.push({
      url: `${baseUrl}/${locale}/courses`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    });

    // 每个课程详情页
    for (const course of courses) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}/courses/${course.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }

    // 法律页面
    sitemapEntries.push({
      url: `${baseUrl}/${locale}/legal/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    });

    sitemapEntries.push({
      url: `${baseUrl}/${locale}/legal/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    });

    sitemapEntries.push({
      url: `${baseUrl}/${locale}/legal/refund`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    });
  }

  return sitemapEntries;
}

