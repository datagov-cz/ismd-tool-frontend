import { useEffect, useRef } from 'react';
import {
  GovFormAutocomplete,
  GovFormLabel,
  GovIcon,
} from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { FieldValues, Path, useFormContext } from 'react-hook-form';

import { searchLaws } from '@/api/generated';
import { useActiveAnchor } from '@/hooks/useActiveAnchor';

interface LegislativeSource {
  iri: string;
  label: string;
}

// `searchLaws` returns already-filtered results — map them to { iri, label }
// so `label` matches the autocomplete's nameKey.
const fetchResults = async (query: string): Promise<LegislativeSource[]> => {
  const res = await searchLaws({ q: query });
  return (res.data ?? []).map((law) => ({
    iri: law.iri ?? '',
    label: law.displayName ?? law.citace ?? '',
  }));
};

interface Props<T extends FieldValues> {
  label: string;
  name: Path<T>;
  anchor?: string;
}

export const LegislativeSourceInput = <T extends FieldValues>({
  label,
  name,
  anchor,
}: Props<T>) => {
  const { setValue, getValues } = useFormContext<T>();
  const isActive = useActiveAnchor(anchor);
  const ref = useRef<HTMLGovFormAutocompleteElement>(null);

  // `options` is only read via @Watch/imperative API — the initial prop value is
  // ignored. Register an async search callback instead (component shows its own
  // loading skeleton while the promise resolves).
  useEffect(() => {
    ref.current?.setSearchCallback(fetchResults);
  }, []);

  return (
    <div
      className={clsx(
        'w-full grid grid-cols-7 gap-y-4 gap-x-2 p-2.5 rounded-lg',
        isActive && 'bg-blue-subtle',
      )}
      id={anchor}
    >
      <GovFormLabel className="w-fit! pt-2.5">
        <span className="font-bold">{label}</span>
      </GovFormLabel>
      <div className="col-span-6 ml-10">
        {/*
          The icon is overlaid, NOT slotted into the autocomplete: it's a scoped
          (non-shadow) Stencil component, and slotting a React-rendered child into
          its <slot> crashes (`__insertBefore`/`getRootNode` on null) when the
          results list re-renders. The list is `position:absolute`, so this
          relative wrapper stays input-height and the icon centers on the input.
        */}
        <div className="relative">
          <GovFormAutocomplete
            ref={ref}
            name={name}
            value={getValues(name) ?? ''}
            nameKey="label"
            minlength={1}
            throttleTime={300}
            messageEmpty="Žádné výsledky"
            className="border-0!"
            onGovInput={(e) => {
              setValue(name, e.detail.value as never, { shouldDirty: true });
            }}
            onGovSelect={(e) => {
              const selected = e.detail.selected as LegislativeSource | null;
              if (selected) {
                setValue(name, selected.label as never, { shouldDirty: true });
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
      </div>
    </div>
  );
};
