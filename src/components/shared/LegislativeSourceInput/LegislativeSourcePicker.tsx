import { useState } from 'react';
import clsx from 'clsx';

import { LegislativeSourceAutocomplete } from '@/components/shared/LegislativeSourceInput/LegislativeSourceAutocomplete';
import { LegislativeSourceSelected } from '@/components/shared/LegislativeSourceInput/LegislativeSourceSelected';
import { LegislativeSource } from '@/components/shared/LegislativeSourceInput/types';
import { useActiveAnchor } from '@/hooks/useActiveAnchor';

import { LegislativeSourceDetail } from './LegislativeSourceDetail';

interface Props {
  value: string | null;
  onChange: (_iri: string) => void;
  anchor?: string;
  onRemove?: () => void;
  autoFocus?: boolean;
}

export const LegislativeSourcePicker = ({
  value,
  onChange,
  anchor,
  onRemove,
  autoFocus,
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
        'relative min-h-15 flex flex-col justify-center py-1',
        isActive && 'bg-blue-subtle',
      )}
      id={anchor}
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
        <LegislativeSourceAutocomplete
          onSourceSelect={handleSelectSource}
          autoFocus={autoFocus}
        />
      )}
    </div>
  );
};
