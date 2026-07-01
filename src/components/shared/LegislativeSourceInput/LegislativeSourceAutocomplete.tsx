import { ReactNode, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useDebounceValue } from 'usehooks-ts';

import { LawDto, useSearchLaws } from '@/api/generated';
import { Autocomplete } from '@/components/shared/Autocomplete';
import { LegislativeSource } from '@/components/shared/LegislativeSourceInput/types';

type Props = {
  onSourceSelect: (_selectedSource: LegislativeSource) => void;
  autoFocus?: boolean;
  startAdornment?: ReactNode;
};

const DEBOUNCE_MS = 300;

export const LegislativeSourceAutocomplete = ({
  onSourceSelect,
  autoFocus,
  startAdornment,
}: Props) => {
  const t = useTranslations('LegislativeSource');
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounceValue(query, DEBOUNCE_MS);

  const { data, isFetching } = useSearchLaws(
    { q: debouncedQuery },
    { query: { enabled: debouncedQuery.length > 0 } },
  );

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
      results={data?.data ?? []}
      isFetching={isFetching}
      autoFocus={autoFocus}
      placeholder={t('SearchPlaceholder')}
      loadingMessage={t('Loading')}
      emptyMessage={t('NoResults')}
      getItemKey={(law) => law.iri ?? ''}
      onSelect={handleSelect}
      renderItem={(law) => <>{law.displayName}</>}
      startAdornment={startAdornment}
    />
  );
};
