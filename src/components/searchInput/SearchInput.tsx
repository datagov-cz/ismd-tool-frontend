'use client';

import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import {
  GovButton,
  GovFormGroup,
  GovFormInput,
  GovIcon,
} from '@gov-design-system-ce/react';
import clsx from 'clsx';
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

type Props = {
  autoFocus?: boolean;
  className?: string;
  onClose?: () => void;
};

export const SearchInput = ({ autoFocus, className, onClose }: Props) => {
  const t = useTranslations('Home.MainControls');
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilter[]>([]);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

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
    if (!autoFocus) return;

    const frame = requestAnimationFrame(focusInput);
    return () => cancelAnimationFrame(frame);
  }, [autoFocus, focusInput]);

  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      const isCtrlK = e.key === 'k' && (e.ctrlKey || e.metaKey);

      if (isCtrlK && inputRef.current?.offsetParent) {
        e.preventDefault();
        focusInput();
      }
    };

    document.addEventListener('keydown', handleShortcut);
    return () => document.removeEventListener('keydown', handleShortcut);
  }, [focusInput]);

  const handleInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
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
      onClose?.();
    },
    [query, type, source, router, onClose],
  );

  const showResults =
    (!!data?.data && debouncedQuery.trim().length > 3) ||
    isLoading ||
    (query.trim().length > 0 && query.trim().length <= 3);

  return (
    <div className={clsx('w-full relative', className)} ref={ref}>
      <GovFormGroup className={clsx('relative', onClose && '[&_input]:pr-36!')}>
        <GovFormInput
          identifier="search-input"
          ref={inputRef}
          placeholder={t('SearchPlaceholder')}
          size={size}
          value={query}
          onChange={handleInput}
          onKeyDown={(e) => handleKeyDown(e.nativeEvent)}
          iconStart={
            <GovIcon type="components" color="neutral" name="search" size="s" />
          }
        />
        <SearchTypesPopover
          value={filters}
          onChange={setFilters}
          offsetClassName={onClose ? 'right-10!' : 'right-0!'}
        />
        {onClose && (
          <GovButton
            type="base"
            color="neutral"
            size="s"
            aria-label={t('CloseSearch')}
            className="absolute! top-1/2! right-1! -translate-y-1/2! z-100 hover:bg-transparent!"
            onClick={onClose}
            iconStart={<GovIcon type="components" name="x-lg" size="s" />}
          ></GovButton>
        )}
      </GovFormGroup>

      {showResults && (
        <SearchResultsPopover
          data={data?.data}
          query={debouncedQuery}
          type={type}
          onClose={() => {
            setDebouncedQuery('');
            onClose?.();
          }}
          loading={isLoading}
        />
      )}
    </div>
  );
};
