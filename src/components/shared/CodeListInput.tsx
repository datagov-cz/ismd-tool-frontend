import { useState } from 'react';
import { GovFormLabel } from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { useFormContext, useWatch } from 'react-hook-form';

import { NkodCodelist, useList as useListNkodCodelists } from '@/api/generated';
import { useActiveAnchor } from '@/hooks/useActiveAnchor';
import { RelatedTerm } from '../conceptDetail/Term/RelatedTerm';

import { Autocomplete } from './Autocomplete';

interface Props {
  label: string;
  placeholder: string;
  noResultsLabel: string;
  name: string;
}

const formatCodeList = (item: NkodCodelist) =>
  item.codeListNumber ? `${item.codeListNumber} - ${item.title}` : item.title;

export const CodeListInput = ({
  label,
  placeholder,
  noResultsLabel,
  name,
}: Props) => {
  const [query, setQuery] = useState('');
  const { setValue } = useFormContext();
  const t = useTranslations('ConceptDetail.Main');

  const selected: NkodCodelist | undefined = useWatch({ name });
  const isActive = useActiveAnchor(name);

  const { data, isFetching } = useListNkodCodelists(
    { q: query },
    { query: { enabled: query.length > 0 } },
  );

  const handleSelect = (item: NkodCodelist) => {
    setValue(name, item, { shouldDirty: true });
  };

  return (
    <div
      className={clsx(
        'w-full space-y-2 p-2.5 rounded-lg',
        isActive && 'bg-blue-subtle',
      )}
      id={name}
    >
      <div className="w-full grid grid-cols-7 gap-x-2 gap-y-4">
        <GovFormLabel size="m" className="w-fit! pt-2.5">
          <span className="font-bold">{label}</span>
        </GovFormLabel>

        <div className="col-span-6 ml-10 flex flex-col gap-2">
          <Autocomplete<NkodCodelist>
            id={`${name}-search`}
            query={query}
            onQueryChange={setQuery}
            results={data?.data ?? []}
            isFetching={isFetching}
            placeholder={placeholder}
            loadingMessage={t('Loading')}
            emptyMessage={noResultsLabel}
            getItemKey={(item) => item.codeListIri}
            onSelect={handleSelect}
            renderItem={(item) => (
              <span className="flex flex-col items-start gap-0.5">
                <span>{formatCodeList(item)}</span>
                <span className="text-xs font-normal text-foreground-muted">
                  {item.publisher}
                </span>
              </span>
            )}
          />
          {selected && (
            <div className="flex flex-wrap gap-2 pt-1">
              <RelatedTerm
                noIcon
                label={formatCodeList(selected)}
                href=""
                remove={() => setValue(name, undefined, { shouldDirty: true })}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
