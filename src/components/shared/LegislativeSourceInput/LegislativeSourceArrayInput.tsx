import { useState } from 'react';
import { GovFormLabel } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';
import {
  ArrayPath,
  FieldValues,
  Path,
  useFieldArray,
  useFormContext,
} from 'react-hook-form';

import { LegislativeSourceInput } from '@/components/shared/LegislativeSourceInput/LegislativeSourceInput';
import { LegislativeSourcePicker } from '@/components/shared/LegislativeSourceInput/LegislativeSourcePicker';

interface Props<T extends FieldValues> {
  label: string;
  name: Path<T>;
  anchor?: string;
}

export const LegislativeSourceArrayInput = <T extends FieldValues>({
  label,
  name,
  anchor,
}: Props<T>) => {
  const t = useTranslations('LegislativeSource');
  const { control, watch } = useFormContext<T>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: name as unknown as ArrayPath<T>,
  });

  const values = (watch(name) as string[] | undefined) ?? [];
  const lastRowEmpty = fields.length > 0 && !values[fields.length - 1];
  const [autoFocusIndex, setAutoFocusIndex] = useState<number | null>(null);

  const handleAdd = () => {
    setAutoFocusIndex(fields.length);
    append('' as never);
  };

  return (
    <div
      id={anchor}
      className="w-full grid grid-cols-7 gap-x-2 px-2.5 items-start"
    >
      <GovFormLabel className="w-fit! min-h-15 items-center">
        <span className="font-bold">{label}</span>
      </GovFormLabel>

      <div className="col-span-6 ml-10 flex flex-col">
        {fields.map((field, index) => (
          <LegislativeSourceInput<T>
            key={field.id}
            name={`${name}.${index}` as Path<T>}
            onRemove={() => remove(index)}
            autoFocus={index === autoFocusIndex}
          />
        ))}

        {fields.length === 0 ? (
          <LegislativeSourcePicker
            value=""
            onChange={(iri) => {
              if (iri) {
                append(iri as never);
              }
            }}
          />
        ) : !lastRowEmpty ? (
          <button
            type="button"
            onClick={handleAdd}
            className="self-start text-sm py-1 font-bold text-blue-primary cursor-pointer"
          >
            {`+ ${t('AddAnother')}`}
          </button>
        ) : null}
      </div>
    </div>
  );
};
