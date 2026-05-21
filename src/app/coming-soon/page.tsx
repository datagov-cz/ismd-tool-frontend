import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('ComingSoon');
  return {
    title: `ISMD - ${t('Title')}`,
    description: t('Description'),
  };
}

export default async function ComingSoonPage() {
  const t = await getTranslations('ComingSoon');
  return (
    <main className="min-h-[calc(100vh-12rem)] bg-page-background flex items-center justify-center px-5 py-16">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl desktop:text-5xl font-medium text-blue mb-6">
          {t('Title')}
        </h1>
        <p className="text-lg desktop:text-xl text-dark-primary leading-relaxed mb-4">
          {t('Description')}
        </p>
        <p className="text-base text-dark-secondary">{t('Thanks')}</p>
      </div>
    </main>
  );
}
