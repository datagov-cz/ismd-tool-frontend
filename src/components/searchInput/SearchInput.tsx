'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  GovFormGroup,
  GovFormInput,
  GovIcon,
} from '@gov-design-system-ce/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useSearch } from '@/api/generated';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { useScreenSize } from '@/hooks/useScreenSize';

import { SearchResultsPopover } from './SearchResultsPopover';
import {
  filterToApiParams,
  SearchFilter,
  SearchTypesPopover,
} from './SearchTypesPopover';

export const SearchInput = () => {
  const t = useTranslations('Home.MainControls');
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilter[]>([]);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLGovFormInputElement | null>(null);

  const size = useScreenSize();

  const focusInput = useCallback(() => {
    (
      inputRef.current as unknown as { inputRef: HTMLInputElement }
    )?.inputRef?.focus();
  }, []);

  const closeResults = useCallback(() => {
    setDebouncedQuery('');
    setQuery('');
  }, []);

  const ref = useOutsideClick(closeResults);
  const { type, source } = filterToApiParams(filters);

  const { data, isLoading } = useSearch(
    { limit: 5, q: debouncedQuery, type, source },
    {
      query: {
        enabled: debouncedQuery.trim().length > 3,
      },
    },
  );

  useEffect(() => {
    setDebouncedQuery(query);
  }, [filters]);

  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      const isCtrlK = e.key === 'k' && (e.ctrlKey || e.metaKey);

      if (isCtrlK) {
        e.preventDefault();
        focusInput();
      }
    };

    document.addEventListener('keydown', handleShortcut);
    return () => document.removeEventListener('keydown', handleShortcut);
  }, [focusInput]);

  const handleInput = useCallback((e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    setQuery(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedQuery(value), 300);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return;
      const trimmed = query.trim();
      if (trimmed.length < 4) return;

      const params = new URLSearchParams({ q: trimmed });
      if (type) params.set('type', type);
      if (source) params.set('source', source);
      router.push(`/search?${params.toString()}`);
    },
    [query, type, source, router],
  );

  const showResults =
    (!!data?.data && debouncedQuery.trim().length > 3) ||
    isLoading ||
    (query.trim().length > 0 && query.trim().length <= 3);

  return (
    <div className="w-full max-w-150 relative" ref={ref}>
      <GovFormGroup className="relative">
        <GovFormInput
          ref={inputRef}
          placeholder={t(
            size === 'l' ? 'SearchPlaceholder' : 'SearchPlaceholderMobile',
          )}
          size={size}
          value={query}
          onGovInput={handleInput}
          onGovKeydown={(e) =>
            e.detail.originalEvent &&
            handleKeyDown(e.detail.originalEvent as KeyboardEvent)
          }
        >
          <GovIcon
            type="components"
            color="neutral"
            name="search"
            slot="icon-start"
            size="s"
          />
        </GovFormInput>
        <SearchTypesPopover value={filters} onChange={setFilters} />
      </GovFormGroup>

      {showResults && (
        <SearchResultsPopover
          data={data?.data}
          query={debouncedQuery}
          type={type}
          onClose={() => setDebouncedQuery('')}
          loading={isLoading}
        />
      )}
    </div>
  );
};
