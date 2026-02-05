import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || 'https://www.kongfunow.com';
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/'] },
    sitemap: `${baseUrl.replace(/\/$/, '')}/sitemap.xml`,
  };
}
