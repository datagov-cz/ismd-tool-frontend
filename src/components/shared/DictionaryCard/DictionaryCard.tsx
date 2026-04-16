import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { DownloadDialog } from '../../dictionaryDetail/DownloadDialog';

import { CardIconButton } from './CardIconButton';
import { CardStat } from './CardStat';

interface Props {
  title: string;
  link: string;
  text: string;
  modified?: Date;
  concepts: number;
  id: number;
}

export const DictionaryCard = ({
  title,
  link,
  text,
  modified,
  concepts,
  id,
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
        className="grow px-4 py-2 flex gap-1 flex-col transition-shadow duration-200 hover:shadow-md cursor-pointer bg-white dark:bg-dark-bg text-black dark:text-white"
      >
        <p className="font-medium text-blue-primary text-[16px]">{title}</p>
        <p className="line-clamp-2 text-sm text-card-description">{text}</p>
      </Link>

      <div className="flex justify-between bg-page-background px-4 py-0.5">
        <div className="flex gap-3 items-center">
          <CardStat label={t('Concepts')} value={concepts} />
          <span className="bg-link h-3 w-px" />
          <CardStat
            label={t('Updated')}
            value={modified?.toLocaleDateString('CS')}
          />
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
        ontologyID={id}
        open={openDownload}
        onClose={() => setOpenDownload(false)}
      />
    </div>
  );
};
