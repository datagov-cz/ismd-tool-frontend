import { useState } from 'react';
import { GovFormLabel, GovIcon } from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';
import {
  ArrayPath,
  FieldValues,
  Path,
  useFieldArray,
  useFormContext,
} from 'react-hook-form';

import { ButtonInput } from '@/components/shared/ButtonInput';
import { LegislativeSourceInput } from '@/components/shared/LegislativeSourceInput/LegislativeSourceInput';

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
    <div id={anchor} className="w-full flex flex-col">
      {fields.map((field, index) => (
        <LegislativeSourceInput<T>
          key={field.id}
          label={index === 0 ? label : ''}
          name={`${name}.${index}` as Path<T>}
          onRemove={() => remove(index)}
          autoFocus={index === autoFocusIndex}
        />
      ))}

      {!lastRowEmpty && (
        <div className="w-full grid grid-cols-7 gap-x-2 px-2.5 py-1 items-center">
          {fields.length === 0 ? (
            <GovFormLabel className="w-fit!">
              <span className="font-bold">{label}</span>
            </GovFormLabel>
          ) : (
            <span aria-hidden />
          )}
          <div className="col-span-6 ml-10 self-start">
            <ButtonInput
              onClick={handleAdd}
              name={`${name}.${fields.length}` as Path<T>}
            >
              {fields.length === 0 ? (
                <>
                  {t('AddSource')}
                  <GovIcon
                    type="components"
                    name="plus"
                    size="s"
                    color="primary"
                  />
                </>
              ) : (
                `+ ${t('AddAnother')}`
              )}
            </ButtonInput>
          </div>
        </div>
      )}
    </div>
  );
};
