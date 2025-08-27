import { useTranslations } from 'next-intl';
import { NewsArticle } from './NewsArticle';
import { tempArticles } from '@/lib/constants';

export function NewsSidebar() {
  const t = useTranslations('Home');

  return (
    <aside className="lg:border-r lg:border-b-0 border-b border-secondary lg:pr-4 pb-6 lg:pb-0 space-y-6 w-full lg:max-w-[300px]">
      <h3 className="font-medium text-lg lg:text-xl">{t('News.Title')}</h3>
      <div className="space-y-4 lg:space-y-6">
        {tempArticles.map((article) => (
          <NewsArticle
            key={article.id}
            date={article.date}
            title={article.title}
            description={article.description}
            href={article.href}
          />
        ))}
      </div>
    </aside>
  );
}
