import { readFileSync } from 'fs';
import { join } from 'path';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getTranslations } from 'next-intl/server';
import Header from '@/components/Header';
import BackButton from '@/components/BackButton';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations();
  
  // 读取对应语言的MDX文件
  const contentPath = join(
    process.cwd(),
    'app',
    '[locale]',
    'legal',
    'privacy',
    'content',
    `privacy.${locale}.mdx`
  );
  
  let content = '';
  try {
    content = readFileSync(contentPath, 'utf-8');
  } catch (error) {
    console.error('Failed to read MDX file:', error);
  }

  return (
    <main>
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* 返回按钮 */}
        <nav className="mb-6">
          <BackButton />
        </nav>
        
        {/* MDX内容 */}
        <article className="prose prose-lg max-w-none">
          {content ? <MDXRemote source={content} /> : <p>Loading...</p>}
        </article>
      </div>
    </main>
  );
}

