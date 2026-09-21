import { useEffect, useRef, useState } from 'react';
import { GovIcon } from '@gov-design-system-ce/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { NkodDatasetListItemDto } from '@/api/generated';

export type DictionaryCardProps = NkodDatasetListItemDto;

const TruncatedText = ({ text }: { text: string }) => {
  const t = useTranslations('Term');
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    setIsTruncated(el.scrollHeight > el.clientHeight);
  }, [text]);

  return (
    <p className={`text-sm text-card-description ${!expanded ? 'flex' : ''}`}>
      <span ref={textRef} className={!expanded ? 'line-clamp-1' : ''}>
        {text}
      </span>
      {(isTruncated || expanded) && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          className="ml-1 text-blue-button-active hover:underline text-xs font-medium shrink-0"
        >
          {expanded ? t('ShowLess') : t('ShowMore')}
        </button>
      )}
    </p>
  );
};

export const getPreferredTranslation = (
  translations?: Record<string, string>,
): string | undefined =>
  translations?.cs || translations?.sk || translations?.en;

export const DatasetCard = ({ iri, název, popis }: DictionaryCardProps) => {
  const displayedTitle = getPreferredTranslation(název);
  const displayedText = getPreferredTranslation(popis);

  return (
    <div className="rounded-xl border border-border-grey overflow-hidden shadow-subtle flex flex-col">
      <Link
        href={`/dataset/detail?iri=${iri}`}
        className="grow px-3 py-2 flex gap-2 transition-shadow duration-200 hover:shadow-md cursor-pointer bg-white dark:bg-dark-bg text-black dark:text-white"
      >
        <GovIcon
          slot="icon-start"
          name="database"
          type="components"
          size="m"
          color="primary"
          className="mt-0.5!"
        />
        <span>
          <p className="font-medium text-blue-primary text-[16px]">
            {displayedTitle}
          </p>
          {displayedText && <TruncatedText text={displayedText} />}
        </span>
      </Link>
    </div>
  );
};
