import createNextIntlPlugin from 'next-intl/plugin';
import { createRequire } from 'module';
import path from 'path';

const require = createRequire(import.meta.url);
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // typedRoutes: true, // 暂时禁用以避免路由类型检查问题
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config) => {
    try {
      const pkgDir = path.dirname(require.resolve('next-mdx-remote/package.json'));
      config.resolve.alias = config.resolve.alias || {};
      config.resolve.alias['next-mdx-remote/rsc'] = path.join(pkgDir, 'rsc.js');
    } catch (_) {
      // 若 next-mdx-remote 未安装则忽略
    }
    return config;
  },
};

export default withNextIntl(nextConfig);

