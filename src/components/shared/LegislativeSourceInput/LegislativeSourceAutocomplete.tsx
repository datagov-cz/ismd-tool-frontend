import { useState } from 'react';
import { GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';
import { useDebounceValue } from 'usehooks-ts';

import { LawDto, useSearchLawsGrouped } from '@/api/generated';
import { Autocomplete } from '@/components/shared/Autocomplete';
import { LegislativeSource } from '@/components/shared/LegislativeSourceInput/types';

type Props = {
  onSourceSelect: (_selectedSource: LegislativeSource) => void;
  autoFocus?: boolean;
  placeholder?: string;
  id: string;
};

const DEBOUNCE_MS = 300;

export const LegislativeSourceAutocomplete = ({
  onSourceSelect,
  autoFocus,
  placeholder,
  id,
}: Props) => {
  const t = useTranslations('LegislativeSource');
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounceValue(query, DEBOUNCE_MS);

  // Grouped by číslo: Czech acts renumber each year, so a bare "49" matches dozens of
  // unrelated laws. The groups arrive best-match first and each is already capped, so
  // flattening them preserves that ranking while keeping the flat list Autocomplete expects.
  const { data, isFetching } = useSearchLawsGrouped(
    { q: debouncedQuery },
    { query: { enabled: debouncedQuery.length > 0 } },
  );

  const laws = (data?.data?.groups ?? []).flatMap((group) => group.laws ?? []);

  const handleSelect = (law: LawDto) => {
    onSourceSelect({
      iri: law.iri ?? '',
      cislo: law.cislo ?? '',
      rok: law.rok ?? 0,
      label: law.displayName ?? law.citace ?? '',
    });
  };

  return (
    <Autocomplete<LawDto>
      query={query}
      onQueryChange={setQuery}
      results={laws}
      isFetching={isFetching}
      autoFocus={autoFocus}
      placeholder={placeholder ?? t('SearchPlaceholder')}
      loadingMessage={t('Loading')}
      emptyMessage={t('NoResults')}
      getItemKey={(law) => law.iri ?? ''}
      onSelect={handleSelect}
      renderItem={(law) => <>{law.displayName}</>}
      startAdornment={
        <GovIcon type="components" name="book" size="m" color="primary" />
      }
      id={id}
    />
  );
};
