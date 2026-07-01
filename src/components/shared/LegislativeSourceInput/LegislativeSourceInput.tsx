import { FieldValues, Path, PathValue, useFormContext } from 'react-hook-form';

import { LegislativeSourcePicker } from '@/components/shared/LegislativeSourceInput/LegislativeSourcePicker';

interface Props<T extends FieldValues> {
  name: Path<T>;
  anchor?: string;
  onRemove?: () => void;
  autoFocus?: boolean;
}

export const LegislativeSourceInput = <T extends FieldValues>({
  name,
  anchor,
  onRemove,
  autoFocus,
}: Props<T>) => {
  const { setValue, watch } = useFormContext<T>();

  const value = (watch(name) as string | undefined) ?? '';

  const handleChange = (iri: string) =>
    setValue(name, iri as PathValue<T, Path<T>>, {
      shouldDirty: true,
      shouldValidate: true,
    });

  return (
    <LegislativeSourcePicker
      value={value}
      onChange={handleChange}
      anchor={anchor}
      onRemove={onRemove}
      autoFocus={autoFocus}
    />
  );
};
