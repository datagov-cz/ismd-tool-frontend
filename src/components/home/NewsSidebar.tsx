import { useTranslations } from 'next-intl';

import { tempArticles } from '@/lib/constants';
import { SidebarContainer } from '../shared/SidebarContainer';

import { NewsArticle } from './NewsArticle';

export function NewsSidebar() {
  const t = useTranslations('Home');

  return (
    <SidebarContainer>
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
    </SidebarContainer>
  );
}
