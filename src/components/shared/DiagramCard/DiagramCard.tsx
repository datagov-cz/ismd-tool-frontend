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
    <div className="rounded-xl border border-border-default dark:border-diagram-border overflow-hidden shadow-subtle flex flex-col">
      <div className="grow group px-3 py-2 flex flex-col bg-white dark:bg-diagram-surface text-black dark:text-white">
        <Link
          href={link}
          className="flex gap-2 transition-shadow duration-200 cursor-pointer"
        >
          <GovIcon
            name="diagram-3"
            type="components"
            size="m"
            className="mt-0.5! text-purple"
          />
          <p className="font-medium text-blue-primary dark:text-blue-300 text-[16px]">
            {title}
          </p>
        </Link>
        <span className="pl-6 flex">
          {ontologyName && (
            <div className="text-sm text-card-description dark:text-gray-300">
              Patří k slovníku:{' '}
              <Link
                className="underline font-semibold text-blue-primary dark:text-blue-300 hover:no-underline"
                href={`/dictionary/${ontologySlug}`}
              >
                {ontologyName}
              </Link>
            </div>
          )}
        </span>
      </div>
      <div className="flex justify-between bg-page-background dark:bg-diagram-surface-footer dark:text-gray-100 pl-9 pr-4 py-0.5">
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
