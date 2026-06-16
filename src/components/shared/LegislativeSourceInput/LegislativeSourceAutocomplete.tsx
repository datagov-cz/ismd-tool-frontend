import { useEffect, useRef, useState } from 'react';
import { GovFormAutocomplete, GovIcon } from '@gov-design-system-ce/react';

import { searchLaws } from '@/api/generated';
import { LegislativeSource } from '@/components/shared/LegislativeSourceInput/types';

// `searchLaws` returns already-filtered results — map them to { iri, label }
// so `label` matches the autocomplete's nameKey.
const fetchResults = async (query: string): Promise<LegislativeSource[]> => {
  const res = await searchLaws({ q: query });
  return (res.data ?? []).map((law) => ({
    iri: law.iri ?? '',
    cislo: law.cislo ?? '',
    rok: law.rok ?? 0,
    label: law.displayName ?? law.citace ?? '',
  }));
};

type Props = {
  onSourceSelect: (_selectedSource: LegislativeSource) => void;
};

export const LegislativeSourceAutocomplete = ({ onSourceSelect }: Props) => {
  const [searchQuery, setSearchQuery] = useState('');
  const ref = useRef<HTMLGovFormAutocompleteElement>(null);

  useEffect(() => {
    ref.current?.setSearchCallback(fetchResults);
  }, []);

  return (
    <div className="relative">
      <GovFormAutocomplete
        ref={ref}
        value={searchQuery}
        nameKey="label"
        minlength={1}
        throttleTime={300}
        messageEmpty="Žádné výsledky"
        className="border-0!"
        onGovInput={(e) => {
          setSearchQuery(e.detail.value);
        }}
        onGovSelect={(e) => {
          const item = e.detail.selected as LegislativeSource | null;
          if (item) {
            onSourceSelect(item);
          }
        }}
      />
      <GovIcon
        type="components"
        name="search"
        size="s"
        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
      />
    </div>
  );
};
