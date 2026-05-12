import { GovIcon, GovTag } from '@gov-design-system-ce/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { ConceptDetailModel } from '@/api/generated';

import { ControlPanelConcept } from './ControlPanelConcept';

type Props = {
  ontology: string;
  conceptDetail: ConceptDetailModel;
  conceptId?: number;
  commentsCount: number;
  isPublished?: boolean;
  definicniObor?: {
    name: string;
    link: string;
  } | null;
  loggedIn?: boolean;
  source?: 'NKD' | 'ISMD';
  owner: boolean;
  updatedAt?: string;
};

export const ConceptHeader = ({
  ontology,
  conceptDetail,
  definicniObor,
  conceptId,
  isPublished,
  commentsCount,
  loggedIn,
  source,
  owner,
  updatedAt,
}: Props) => {
  const t = useTranslations('ConceptDetail');
  const capitalizeFirst = (text: string) =>
    text.charAt(0).toUpperCase() + text.slice(1);
  return (
    <div className="w-full bg-white">
      <div className="max-w-250 mx-auto py-5 flex flex-col gap-3 w-full">
        <div className="flex items-center justify-between">
          <GovTag
            color="success"
            type="subtle"
            size="xs"
            className="w-fit border bg-white!"
          >
            <GovIcon name="journal-text" slot="icon-start" type="components" />
            <span className="font-bold text-blue-primary">
              {capitalizeFirst(ontology)}
            </span>
          </GovTag>
          {updatedAt && (
            <span className="text-sm text-dark-primary">
              {t('Main.ControlPanel.Updated')}:{' '}
              {new Date(updatedAt).toLocaleDateString('CS')}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-3 w-full">
          <div className="gap-3 flex">
            <GovTag
              color="primary"
              type="subtle"
              size="xs"
              className="h-fit whitespace-nowrap my-1!"
            >
              <GovIcon
                name="card-heading"
                slot="icon-start"
                type="components"
              />
              {conceptDetail.typ
                ?.filter((item: string) => item !== 'Koncept')
                .map(
                  (item: string, index, arr) =>
                    item + ` ${index < arr.length - 1 ? '/ ' : ''}`,
                )}
            </GovTag>
            <h1 className="text-xl lg:text-2xl font-medium">
              {conceptDetail.název?.cs}
            </h1>
          </div>
          <ControlPanelConcept
            commentsCount={commentsCount}
            conceptID={conceptId || 0}
            isPublished={isPublished || false}
            name={conceptDetail.název?.cs || ''}
            loggedIn={loggedIn}
            source={source}
            owner={owner}
          />
        </div>

        {definicniObor?.name && (
          <span className="text-sm">
            {conceptDetail.typ?.[1]} pojmu{' '}
            <Link
              className="text-blue-primary visited:text-blue-primary underline cursor-pointer"
              href={definicniObor.link}
            >
              {capitalizeFirst(definicniObor.name)}
            </Link>
          </span>
        )}
      </div>
    </div>
  );
};
