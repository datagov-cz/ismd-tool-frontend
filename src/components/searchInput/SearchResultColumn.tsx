'use client';

import { GovButton } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { SearchResultDto, SearchType } from '@/api/generated';

import { SearchResultItem } from './SearchResultItem';

type Props = {
  type: SearchType;
  items: SearchResultDto[];
  remaining?: number;
  moreHref: string;
  onClose?: () => void;
  query: string;
};

const TYPE_CONFIG = {
  [SearchType.ONTOLOGY]: {
    titleKey: 'Ontologies' as const,
    emptyKey: 'NoOntologies' as const,
    hrefPrefix: '/dictionary',
  },
  [SearchType.CONCEPT]: {
    titleKey: 'Concepts' as const,
    emptyKey: 'NoConcepts' as const,
    hrefPrefix: '/concept',
  },
};

export const SearchResultColumn = ({
  type,
  items,
  remaining,
  moreHref,
  onClose,
  query,
}: Props) => {
  const t = useTranslations('Search');
  const config = TYPE_CONFIG[type];
  const hasItems = items.length > 0;

  const getItemHref = (item: SearchResultDto) => {
    if (item.source === 'ISMD') return `${config.hrefPrefix}/${item.slug}`;
    if (item.source === 'NKD') {
      return `${config.hrefPrefix}/nkd?iri=${encodeURIComponent(item.iri || '')}`;
    }
    return `${config.hrefPrefix}/${item.iri}`;
  };

  return (
    <div className="p-4">
      <p className="text-sm font-semibold text-gray-700 mb-3">
        {t(config.titleKey)}
      </p>

      {hasItems ? (
        <>
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.iri}>
                <SearchResultItem
                  type={type}
                  label={item.label || ''}
                  isPublished={item.isPublished}
                  query={query}
                  href={getItemHref(item)}
                  onClose={onClose}
                />
              </li>
            ))}
          </ul>

          {remaining != null && remaining > 0 && (
            <div className="w-full flex items-center justify-center mt-2">
              <GovButton
                href={moreHref}
                color="primary"
                size="s"
                type="base"
                onClick={onClose}
              >
                {t('More')} ({remaining})
              </GovButton>
            </div>
          )}
        </>
      ) : (
        <p className="text-xs text-gray-400 italic">{t(config.emptyKey)}</p>
      )}
    </div>
  );
};
