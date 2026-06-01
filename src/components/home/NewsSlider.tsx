'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { fetchApi } from '@/lib/basePath';
import { BlogPost } from '@/lib/blogs';
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

  useEffect(() => {
    const cached = localStorage.getItem('cached-blogs');
    if (cached) {
      setBlogPosts(JSON.parse(cached));
    }

    fetchApi(`/api/blogs`)
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
    <div className="py-21 max-w-191.5 w-full">
      <h3 className="font-medium text-lg lg:text-xl mb-3">{t('News.Title')}</h3>
      <div className="space-y-4 lg:space-y-6">
        <Carousel
          opts={{
            align: 'start',
            containScroll: 'trimSnaps',
            slidesToScroll: 1,
          }}
          className="w-full"
        >
          <CarouselContent className="w-full">
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
