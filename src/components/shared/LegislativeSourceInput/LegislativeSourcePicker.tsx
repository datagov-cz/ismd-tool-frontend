import { ReactNode, useState } from 'react';
import { GovFormLabel, GovIcon } from '@gov-design-system-ce/react';
import clsx from 'clsx';

import { LegislativeSourceAutocomplete } from '@/components/shared/LegislativeSourceInput/LegislativeSourceAutocomplete';
import { LegislativeSourceSelected } from '@/components/shared/LegislativeSourceInput/LegislativeSourceSelected';
import { LegislativeSource } from '@/components/shared/LegislativeSourceInput/types';
import { useActiveAnchor } from '@/hooks/useActiveAnchor';

import { LegislativeSourceDetail } from './LegislativeSourceDetail';

interface Props {
  label: string | null;
  value: string | null;
  onChange: (_iri: string) => void;
  anchor?: string;
  onRemove?: () => void;
  autoFocus?: boolean;
  startAdornment?: ReactNode;
}

export const LegislativeSourcePicker = ({
  label,
  value,
  onChange,
  anchor,
  onRemove,
  autoFocus,
  startAdornment,
}: Props) => {
  const isActive = useActiveAnchor(anchor);

  const selectedIri = value ?? '';
  const [selected, setSelected] = useState<LegislativeSource | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const setIri = (iri: string) => onChange(iri);

  const handleSelectSource = (source: LegislativeSource) => {
    setSelected(source);
    setIri('');
    setIsDetailOpen(true);
  };

  const handleClear = () => {
    if (onRemove) {
      onRemove();
      return;
    }
    setSelected(null);
    setIri('');
  };

  const handleOpenChange = (open: boolean) => {
    setIsDetailOpen(open);
    if (!open && !selectedIri) {
      setSelected(null);
    }
  };

  return (
    <div
      className={clsx(
        'w-full grid grid-cols-7 gap-y-4 gap-x-2 px-2.5 py-1 items-center',
        isActive && 'bg-blue-subtle',
      )}
      id={anchor}
    >
      {label ? (
        <GovFormLabel className="w-fit!">
          <span className="font-bold">{label}</span>
        </GovFormLabel>
      ) : null}
      <div
        className={clsx('relative min-h-15 flex flex-col justify-center', {
          'col-span-7': !label,
          'col-span-6 ml-10': label,
        })}
      >
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
          <LegislativeSourceSelected iri={selectedIri} onClear={handleClear} />
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <LegislativeSourceAutocomplete
                onSourceSelect={handleSelectSource}
                autoFocus={autoFocus}
                startAdornment={startAdornment}
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
