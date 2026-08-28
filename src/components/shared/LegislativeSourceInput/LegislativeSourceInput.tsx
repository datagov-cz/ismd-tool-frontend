import { FieldValues, Path, PathValue, useFormContext } from 'react-hook-form';

import { LegislativeSourcePicker } from '@/components/shared/LegislativeSourceInput/LegislativeSourcePicker';

interface Props<T extends FieldValues> {
  name: Path<T>;
  anchor?: string;
  onRemove?: () => void;
  autoFocus?: boolean;
  id: string;
  initialManualEntry?: boolean;
}

export const LegislativeSourceInput = <T extends FieldValues>({
  name,
  anchor,
  onRemove,
  autoFocus,
  id,
  initialManualEntry,
}: Props<T>) => {
  const { formState, getFieldState, setValue, trigger, watch } =
    useFormContext<T>();

  const value = (watch(name) as string | undefined) ?? '';
  const error = getFieldState(name, formState).error?.message;

  const handleChange = (iri: string) =>
    setValue(name, iri as PathValue<T, Path<T>>, {
      shouldDirty: true,
    });

  const handleBlur = () => void trigger(name);

  return (
    <LegislativeSourcePicker
      value={value}
      onChange={handleChange}
      anchor={anchor}
      onRemove={onRemove}
      autoFocus={autoFocus}
      id={id}
      initialManualEntry={initialManualEntry}
      onBlur={handleBlur}
      error={error}
    />
  );
};
