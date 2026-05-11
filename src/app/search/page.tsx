'use client';

import { GovButton } from '@gov-design-system-ce/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import {
  SearchSource,
  SearchType as ApiSearchType,
  useGetCurrentUser,
} from '@/api/generated';
import { useSearch } from '@/api/generated';
import { CircularLoader } from '@/components/shared/CircularLoader';
import { ConceptCard } from '@/components/shared/ConceptCard/ConceptCard';
import { DictionaryCard } from '@/components/shared/DictionaryCard/DictionaryCard';

const isApiSearchType = (v: string | null): v is ApiSearchType =>
  Object.values(ApiSearchType).includes(v as ApiSearchType);

const isSearchSource = (v: string | null): v is SearchSource =>
  Object.values(SearchSource).includes(v as SearchSource);

const Search = () => {
  const t = useTranslations('Search');
  const tTypes = useTranslations('SearchTypes');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const q = searchParams.get('q') ?? '';

  const rawType = searchParams.get('type');
  const activeType = isApiSearchType(rawType) ? rawType : undefined;

  const rawSource = searchParams.get('source');
  const activeSource = isSearchSource(rawSource) ? rawSource : undefined;

  const { data: user } = useGetCurrentUser();

  const toggleType = (type: ApiSearchType) => {
    const params = new URLSearchParams(searchParams.toString());
    if (activeType === type) {
      params.delete('type');
    } else {
      params.set('type', type);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleSource = (source: SearchSource) => {
    const params = new URLSearchParams(searchParams.toString());
    if (activeSource === source) {
      params.delete('source');
    } else {
      params.set('source', source);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const { data, isLoading } = useSearch(
    { q, type: activeType, source: activeSource },
    { query: { enabled: q.trim().length > 1 } },
  );

  if (isLoading)
    return (
      <div className="h-full flex-1 flex items-center justify-center">
        <CircularLoader />
      </div>
    );

  if (!data?.success) return null;

  return (
    <div className="w-full py-10">
      <div className="max-w-250 mx-auto space-y-3">
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-center text-xl font-medium">
            {t('SearchesFor')} &#39;{q}&#39;
          </h1>

          <div className="flex gap-2">
            <span className="font-bold text-sm">{t('FilterLabel')} </span>
            <GovButton
              type={
                activeType === ApiSearchType.ONTOLOGY ? 'solid' : 'outlined'
              }
              onGovClick={() => toggleType(ApiSearchType.ONTOLOGY)}
              color="success"
              size="xs"
            >
              {tTypes('Types.Slovník')}{' '}
              {activeType !== 'CONCEPT' && `[${data.data?.totalOntologies}]`}
            </GovButton>
            <GovButton
              type={activeType === ApiSearchType.CONCEPT ? 'solid' : 'outlined'}
              onGovClick={() => toggleType(ApiSearchType.CONCEPT)}
              color="primary"
              size="xs"
            >
              {tTypes('Types.Pojem')}{' '}
              {activeType !== 'ONTOLOGY' && `[${data.data?.totalConcepts}]`}
            </GovButton>
            {user?.success === true && (
              <GovButton
                type={
                  activeSource === SearchSource.UNPUBLISHED
                    ? 'solid'
                    : 'outlined'
                }
                onGovClick={() => toggleSource(SearchSource.UNPUBLISHED)}
                color="warning"
                size="xs"
              >
                {tTypes('Types.Rozpracovaný')}
              </GovButton>
            )}
          </div>
        </div>

        {data.data?.results?.map((item) => {
          if (item.type === 'ONTOLOGY') {
            const cardProps =
              item.source === 'ISMD'
                ? // TODO - BE musi pridat od odpovedi i ID upravit jak bude pridano
                  { type: 'ISMD' as const, id: 2 }
                : { type: 'NKD' as const, ontologyIRI: item.iri ?? '' };

            return (
              <DictionaryCard
                {...cardProps}
                key={item.label}
                title={item.label || ''}
                text={item.description || item.definition || ''}
                link={
                  item.source === 'ISMD'
                    ? `/dictionary/${item.slug}`
                    : `/dictionary/nkd?iri=${item.iri}`
                }
                concepts={0}
                modified={
                  item.lastModified ? new Date(item.lastModified) : undefined
                }
              />
            );
          }

          if (item.type === 'CONCEPT') {
            return (
              <ConceptCard
                key={item.label}
                title={item.label || ''}
                text={item.description || item.definition || ''}
                modified={
                  item.lastModified ? new Date(item.lastModified) : undefined
                }
                link={
                  item.source === 'ISMD'
                    ? `/concept/${item.slug}`
                    : `/concept/nkd?iri=${item.iri}`
                }
              />
            );
          }
        })}
      </div>
    </div>
  );
};

export default Search;
