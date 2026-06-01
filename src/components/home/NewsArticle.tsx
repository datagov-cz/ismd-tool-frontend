import { GovCard, GovIcon } from '@gov-design-system-ce/react';
import Link from 'next/link';

interface NewsArticleProps {
  date: string;
  title: string;
  description: string;
  href: string;
}

export function NewsArticle({
  date,
  title,
  description,
  href,
}: NewsArticleProps) {
  return (
    <Link href={href}>
      <GovCard className="flex flex-col gap-y-2">
        <div>
          <h4 className="font-medium lg:text-lg">{title}</h4>
          <span className="text-sm flex items-center gap-x-1 opacity-70">
            <GovIcon
              type="components"
              color="neutral"
              name="calendar-event"
              slot="icon-start"
              size="s"
              className="transition-transform duration-200"
            />
            {date}
          </span>
          <p className="line-clamp-3 text-sm lg:text-base pt-3">
            {description}
          </p>
        </div>
      </GovCard>
    </Link>
  );
}
