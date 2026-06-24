import { FieldValues, Path, PathValue, useFormContext } from 'react-hook-form';

import { LegislativeSourcePicker } from '@/components/shared/LegislativeSourceInput/LegislativeSourcePicker';

interface Props<T extends FieldValues> {
  label: string | null;
  name: Path<T>;
  anchor?: string;
  onRemove?: () => void;
  autoFocus?: boolean;
}

export const LegislativeSourceInput = <T extends FieldValues>({
  label,
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
      label={label}
      value={value}
      onChange={handleChange}
      anchor={anchor}
      onRemove={onRemove}
      autoFocus={autoFocus}
    />
  );
};
