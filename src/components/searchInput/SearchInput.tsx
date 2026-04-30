'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  GovFormGroup,
  GovFormInput,
  GovIcon,
} from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';

import { SearchType as ApiSearchType } from '@/api/generated';
import { useSearch } from '@/api/generated';
import { useOutsideClick } from '@/hooks/useOutsideClick';

import { SearchResultsPopover } from './SearchResultsPopover';
import { SearchType, SearchTypesPopover } from './SearchTypesPopover';

function toApiType(selected: SearchType[]): ApiSearchType | undefined {
  const hasConcept = selected.includes('Pojem');
  const hasOntology =
    selected.includes('Slovník') || selected.includes('Rozpracovaný');

  if (hasConcept && !hasOntology) return ApiSearchType.CONCEPT;
  if (hasOntology && !hasConcept) return ApiSearchType.ONTOLOGY;
  return undefined;
}

export const SearchInput = () => {
  const t = useTranslations('Home.MainControls');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selected, setSelected] = useState<SearchType[]>([]);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeResults = useCallback(() => {
    setDebouncedQuery('');
    setQuery('');
  }, []);

  const ref = useOutsideClick(closeResults);

  const apiType = toApiType(selected);

  const { data, isLoading } = useSearch(
    { q: debouncedQuery, type: apiType },
    { query: { enabled: debouncedQuery.trim().length > 1 } },
  );

  useEffect(() => {
    setDebouncedQuery(query);
  }, [apiType]);

  const handleInput = useCallback((e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    setQuery(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedQuery(value), 300);
  }, []);

  const showResults =
    (!!data?.data && debouncedQuery.trim().length > 1) || isLoading;

  return (
    <div className="w-full max-w-150 relative" ref={ref}>
      <GovFormGroup className="relative">
        <GovFormInput
          placeholder={t('SearchPlaceholder')}
          size="l"
          value={query}
          onGovInput={handleInput}
        >
          <GovIcon
            type="components"
            color="neutral"
            name="search"
            slot="icon-start"
            size="s"
            className="transition-transform duration-200"
          />
        </GovFormInput>
        <SearchTypesPopover
          selected={selected}
          onSelectionChange={setSelected}
        />
      </GovFormGroup>

      {showResults && (
        <SearchResultsPopover
          data={data?.data}
          query={debouncedQuery}
          type={apiType}
          onClose={() => setDebouncedQuery('')}
          loading={isLoading}
        />
      )}
    </div>
  );
};
