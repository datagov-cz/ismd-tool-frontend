import { useState } from 'react';
import {
  GovFormControl,
  GovFormInput,
  GovIcon,
} from '@gov-design-system-ce/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { useGetConceptsByIri } from '@/api/generated';
import { CircularLoader } from '../shared/CircularLoader';

export const OtherOntologyConcepts = ({
  ontology,
  source,
}: {
  ontology: string;
  source: 'NKD' | 'ISMD';
}) => {
  const [search, setSearch] = useState('');
  const t = useTranslations('ConceptDetail');

  const { data, isLoading } = useGetConceptsByIri({ iri: ontology, source });

  const concepts = data?.data;

  const filtered = concepts?.filter((item) => {
    return item.name?.cs?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="py-6 flex flex-col max-h-[50vh]">
      <div>
        <span className="font-bold mb-4 block">
          {t('Groups.AnotherConcepts')}
        </span>
        <GovFormControl>
          <GovFormInput
            identifier="other-ontology-concepts-filter"
            placeholder={t('Groups.Search')}
            size="s"
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value ?? '')}
            iconStart={<GovIcon name="funnel" />}
          />
        </GovFormControl>
      </div>
      {isLoading ? (
        <CircularLoader />
      ) : (
        <div className="flex flex-col overflow-y-auto mt-2">
          {filtered?.map((item) => (
            <Link
              key={item.iri}
              href={
                item.slug && item.slug.length > 0
                  ? `/concept/${item.slug}`
                  : `/concept/nkd?iri=${item.iri}`
              }
              className="flex gap-3 items-center px-2 py-3 border-b border-gray-border hover:bg-border-primary-subtle/20"
            >
              <GovIcon
                slot="icon-start"
                name={
                  item.conceptType === 'VZTAH'
                    ? 'bezier2'
                    : item.conceptType === 'VLASTNOST'
                      ? 'tag'
                      : 'card-heading'
                }
                color="primary"
              />
              {item.name?.cs ?? ''}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
