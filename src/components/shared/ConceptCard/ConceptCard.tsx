import { useEffect, useRef, useState } from 'react';
import { GovIcon } from '@gov-design-system-ce/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { SearchResultDtoConceptType } from '@/api/generated';
import { CardStat } from '../DictionaryCard/CardStat';

export type DictionaryCardProps = {
  title: string;
  link: string;
  text?: string;
  modified?: Date;
  conceptType?: SearchResultDtoConceptType;
};

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

export const ConceptCard = ({
  title,
  link,
  text,
  modified,
  conceptType,
}: DictionaryCardProps) => {
  const t = useTranslations('DictionaryDetail.Main.ControlPanel');

  return (
    <div className="rounded-xl border border-border-default overflow-hidden shadow-subtle flex flex-col">
      <Link
        href={link}
        className="grow px-3 py-2 flex gap-2 transition-shadow duration-200 hover:shadow-md cursor-pointer bg-surface text-foreground"
      >
        <GovIcon
          slot="icon-start"
          name={
            conceptType === 'VZTAH'
              ? 'bezier2'
              : conceptType === 'VLASTNOST'
                ? 'tag'
                : 'card-heading'
          }
          type="components"
          size="m"
          color="primary"
          className="mt-0.5!"
        />
        <span>
          <p className="font-medium text-accent text-base">{title}</p>
          {text && <TruncatedText text={text} />}
        </span>
      </Link>

      <div className="flex justify-between bg-surface-muted pl-9 pr-4 py-0.5">
        <div className="flex gap-3 items-center min-h-6">
          {modified && (
            <CardStat
              label={t('Updated')}
              value={modified?.toLocaleDateString('CS')}
            />
          )}
        </div>
      </div>
    </div>
  );
};
