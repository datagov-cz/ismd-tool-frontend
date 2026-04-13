'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { normalizeBasePath } from '@/lib/basePath';
import { BlogPost } from '@/lib/blogs';
import { useEnvironment } from '../contexts/Environment';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../shared/Carousel';

import { NewsArticle } from './NewsArticle';

export function NewsSlider() {
  const t = useTranslations('Home');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const { variables } = useEnvironment();
  const callbackBasePath = normalizeBasePath(variables?.NEXT_PUBLIC_BASE_PATH);

  useEffect(() => {
    const cached = localStorage.getItem('cached-blogs');
    if (cached) {
      setBlogPosts(JSON.parse(cached));
    }

    fetch(`${callbackBasePath}/api/blogs`)
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
    <div className="py-21">
      <h3 className="font-medium text-lg lg:text-xl mb-3">{t('News.Title')}</h3>
      <div className="space-y-4 lg:space-y-6">
        <Carousel
          opts={{
            align: 'start',
            containScroll: 'trimSnaps',
            slidesToScroll: 1,
          }}
        >
          <CarouselContent>
            {blogPosts.length > 0 &&
              blogPosts.map((article) => (
                <CarouselItem className="basis-1/2!" key={article.href}>
                  <NewsArticle
                    key={article.id}
                    date={article.date}
                    title={article.title}
                    description={article.description}
                    href={article.href}
                  />
                </CarouselItem>
              ))}
          </CarouselContent>
          <CarouselPrevious size="xl" />
          <CarouselNext size="xl" />
        </Carousel>
      </div>
    </div>
  );
}
