import { useState } from 'react';
import { GovFormLabel } from '@gov-design-system-ce/react';
import clsx from 'clsx';
import { FieldValues, Path } from 'react-hook-form';

import { LegislativeSourceAutocomplete } from '@/components/shared/LegislativeSourceInput/LegislativeSourceAutocomplete';
import { LegislativeSource } from '@/components/shared/LegislativeSourceInput/types';
import { useActiveAnchor } from '@/hooks/useActiveAnchor';

import { LegislativeSourceDetail } from './LegislativeSourceDetail';

interface Props<T extends FieldValues> {
  label: string;
  name: Path<T>;
  anchor?: string;
}

export const LegislativeSourceInput = <T extends FieldValues>({
  label,
  // name,
  anchor,
}: Props<T>) => {
  // const { setValue } = useFormContext<T>();
  const isActive = useActiveAnchor(anchor);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selected, setSelected] = useState<LegislativeSource | null>(null);

  const handleSelectSource = (source: LegislativeSource) => {
    setSelected(source);
    setIsDetailOpen(true);
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
            onOpenChange={setIsDetailOpen}
            onClear={() => setSelected(null)}
          />
        ) : (
          <LegislativeSourceAutocomplete onSourceSelect={handleSelectSource} />
        )}
      </div>
    </div>
  );
};
