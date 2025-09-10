import { ButtonLink } from '@/components/shared/ButtonLink';

interface NewsArticleProps {
  date: string;
  title: string;
  description: string;
  href: string;
}

export function NewsArticle({ date, title, description, href }: NewsArticleProps) {
  return (
    <div className="flex flex-col gap-y-2">
      <div>
        <p className="text-sm">{date}</p>
        <h4 className="font-medium lg:text-lg">{title}</h4>
        <p className="line-clamp-3 text-sm lg:text-base">{description}</p>
      </div>
      <ButtonLink href={href} className="self-end">
        Více
      </ButtonLink>
    </div>
  );
}