import { GovIcon } from '@gov-design-system-ce/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { CardStat } from '../DictionaryCard/CardStat';

export type DiagramCardProps = {
  title: string;
  link: string;
  modified?: Date;
  ontologyName?: string;
  ontologySlug?: string;
};

export const DiagramCard = ({
  title,
  link,
  modified,
  ontologyName,
  ontologySlug,
}: DiagramCardProps) => {
  const t = useTranslations('DictionaryDetail.Main.ControlPanel');
  return (
    <div className="rounded-xl border border-border-grey overflow-hidden shadow-subtle flex flex-col">
      <Link
        href={link}
        className="grow px-3 py-2 flex gap-2 transition-shadow duration-200 hover:shadow-md cursor-pointer bg-white dark:bg-dark-bg text-black dark:text-white"
      >
        <GovIcon
          slot="icon-start"
          name={'diagram-3'}
          type="components"
          size="m"
          className="mt-0.5! text-purple"
        />
        <span>
          <p className="font-medium text-blue-primary text-[16px]">{title}</p>
          {ontologyName && (
            <div className="text-sm text-card-description ">
              Patří k slovníku:{' '}
              <Link
                className="underline font-semibold text-blue-primary hover:no-underline"
                href={`/dictionary/${ontologySlug}`}
              >
                {ontologyName}
              </Link>
            </div>
          )}
        </span>
      </Link>
      <div className="flex justify-between bg-page-background pl-9 pr-4 py-0.5">
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
