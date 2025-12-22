'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { BlogPost } from '@/lib/blogs';
import { SidebarContainer } from '../shared/SidebarContainer';

import { NewsArticle } from './NewsArticle';

export function NewsSidebar() {
  const t = useTranslations('Home');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const cached = localStorage.getItem('cached-blogs');
    if (cached) {
      setBlogPosts(JSON.parse(cached));
    }

    fetch('/api/blogs')
      .then((res) => res.json())
      .then((data) => {
        setBlogPosts(data);
        localStorage.setItem('cached-blogs', JSON.stringify(data));
      })
      .catch(() => {
        if (cached) setBlogPosts(JSON.parse(cached));
      });
  }, []);

  return (
    <SidebarContainer>
      <h3 className="font-medium text-lg lg:text-xl">{t('News.Title')}</h3>
      <div className="space-y-4 lg:space-y-6">
        {blogPosts.length > 0 &&
          blogPosts.map((article) => (
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
