import { useEffect, useRef, useState } from 'react';
import { GovIcon } from '@gov-design-system-ce/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { DownloadDialog } from '../../dictionaryDetail/DownloadDialog';

import { CardIconButton } from './CardIconButton';
import { CardStat } from './CardStat';

type Props = {
  title: string;
  link: string;
  text?: string;
  modified?: Date;
  concepts: number;
  isPublished?: boolean;
} & (
  | { type: 'ISMD'; id: number; ontologyIRI?: never }
  | { type: 'NKD'; ontologyIRI: string; id?: never }
);

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

export const DictionaryCard = ({
  title,
  link,
  text,
  modified,
  concepts,
  id,
  type,
  ontologyIRI,
  isPublished,
}: Props) => {
  const [openDownload, setOpenDownload] = useState(false);
  const t = useTranslations('DictionaryDetail.Main.ControlPanel');

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href + link);
      toast(t('LinkCopied'), { type: 'success' });
    } catch {
      toast(t('LinkCopyFailed'), { type: 'error' });
    }
  };

  return (
    <div className="rounded-xl border border-border-grey overflow-hidden shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)] flex flex-col">
      <Link
        href={link}
        className="grow px-3 py-2 flex gap-2 transition-shadow duration-200 hover:shadow-md cursor-pointer bg-white dark:bg-dark-bg text-black dark:text-white"
      >
        <GovIcon
          slot="icon-start"
          name={type === 'NKD' || isPublished ? 'journal-text' : 'journals'}
          type="components"
          size="m"
          color={type === 'NKD' || isPublished ? 'success' : 'warning'}
          className="mt-0.5!"
        />
        <span>
          <p className="font-medium text-blue-primary text-[16px]">{title}</p>
          {text && <TruncatedText text={text} />}
        </span>
      </Link>

      <div className="flex justify-between bg-page-background pl-9 pr-4 py-0.5">
        <div className="flex gap-3 items-center">
          {concepts > 0 && <CardStat label={t('Concepts')} value={concepts} />}
          {concepts > 0 && modified && <span className="bg-link h-3 w-px" />}
          {modified && (
            <CardStat
              label={t('Updated')}
              value={modified?.toLocaleDateString('CS')}
            />
          )}
        </div>
        <div className="flex gap-2 items-center">
          <CardIconButton icon="link" onClick={handleCopyLink} />
          <CardIconButton
            icon="download"
            onClick={() => setOpenDownload(true)}
          />
        </div>
      </div>

      <DownloadDialog
        {...(type === 'ISMD'
          ? { type, ontologyID: id }
          : { type, ontologyIRI })}
        open={openDownload}
        onClose={() => setOpenDownload(false)}
      />
    </div>
  );
};
