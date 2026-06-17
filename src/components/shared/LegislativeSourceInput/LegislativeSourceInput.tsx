import { useState } from 'react';
import { GovFormLabel, GovIcon } from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { FieldValues, Path, PathValue, useFormContext } from 'react-hook-form';

import { LegislativeSourceAutocomplete } from '@/components/shared/LegislativeSourceInput/LegislativeSourceAutocomplete';
import { LegislativeSourceSelected } from '@/components/shared/LegislativeSourceInput/LegislativeSourceSelected';
import { LegislativeSource } from '@/components/shared/LegislativeSourceInput/types';
import { useActiveAnchor } from '@/hooks/useActiveAnchor';

import { LegislativeSourceDetail } from './LegislativeSourceDetail';

interface Props<T extends FieldValues> {
  label: string;
  name: Path<T>;
  anchor?: string;
  /** Array mode: clearing removes the whole row instead of resetting the value. */
  onRemove?: () => void;
}

export const LegislativeSourceInput = <T extends FieldValues>({
  label,
  name,
  anchor,
  onRemove,
}: Props<T>) => {
  const isActive = useActiveAnchor(anchor);
  const { setValue, watch } = useFormContext<T>();

  // The RHF value is the selected fragment's IRI — the single source of truth
  // that survives a form reload (the ELI is only derivable from loaded content,
  // so it can't be persisted). Without an IRI the input is incomplete, so
  // `selected` (the chosen law) only drives the detail UI.
  const selectedIri = (watch(name) as string | undefined) ?? '';
  const [selected, setSelected] = useState<LegislativeSource | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const setIri = (iri: string) =>
    setValue(name, iri as PathValue<T, Path<T>>, {
      shouldDirty: true,
      shouldValidate: true,
    });

  const handleSelectSource = (source: LegislativeSource) => {
    setSelected(source);
    setIri(''); // a new law invalidates any previously picked fragment
    setIsDetailOpen(true);
  };

  const handleClear = () => {
    if (onRemove) {
      onRemove(); // array mode: drop the row entirely
      return;
    }
    setSelected(null);
    setIri('');
  };

  const handleOpenChange = (open: boolean) => {
    setIsDetailOpen(open);
    // Closing without an IRI leaves an invalid input — clear the chosen law.
    if (!open && !selectedIri) {
      setSelected(null);
    }
  };

  return (
    <div
      className={clsx(
        'w-full grid grid-cols-7 gap-y-4 gap-x-2 p-2.5 items-center',
        isActive && 'bg-blue-subtle',
      )}
      id={anchor}
    >
      <GovFormLabel className="w-fit!">
        <span className="font-bold">{label}</span>
      </GovFormLabel>
      <div className="col-span-6 ml-10 relative self-start">
        {selected ? (
          <LegislativeSourceDetail
            source={selected}
            open={isDetailOpen}
            onOpenChange={handleOpenChange}
            onClear={handleClear}
            selectedIri={selectedIri || null}
            onSelectIri={setIri}
          />
        ) : selectedIri ? (
          // No in-memory law (e.g. after a form reload) but a persisted IRI —
          // resolve the display from the IRI itself.
          <LegislativeSourceSelected iri={selectedIri} onClear={handleClear} />
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <LegislativeSourceAutocomplete
                onSourceSelect={handleSelectSource}
              />
            </div>
            {onRemove ? (
              <button
                type="button"
                className="shrink-0 cursor-pointer flex items-center"
                onClick={onRemove}
              >
                <GovIcon
                  type="components"
                  name="x"
                  slot="icon-start"
                  size="2xl"
                  color="primary"
                />
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
