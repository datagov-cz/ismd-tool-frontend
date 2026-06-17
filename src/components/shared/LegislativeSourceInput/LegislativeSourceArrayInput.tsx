import { useEffect, useRef } from 'react';
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
  // `Path<T>` (not `ArrayPath<T>`): RHF's `ArrayPath` excludes primitive-array
  // fields like `string[]`, which is exactly what we store (an array of IRIs).
  name: Path<T>;
  anchor?: string;
}

// Drives the single-value `LegislativeSourceInput` as an RHF array: each row is a
// fragment IRI stored at `${name}.${index}`. The wrapper owns add/remove; each row
// owns its own search/pick/display lifecycle.
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

  // Hide "add another" while the last row is still an empty (unfilled) search —
  // there's no point offering a new row until the current one has a value.
  const values = (watch(name) as string[] | undefined) ?? [];
  const lastRowEmpty = fields.length > 0 && !values[fields.length - 1];

  const containerRef = useRef<HTMLDivElement>(null);
  const focusLastOnAdd = useRef(false);

  // After appending a row, focus its (freshly mounted) search input.
  useEffect(() => {
    if (!focusLastOnAdd.current) return;
    focusLastOnAdd.current = false;
    requestAnimationFrame(() => {
      const inputs = containerRef.current?.querySelectorAll('input');
      inputs?.[inputs.length - 1]?.focus();
    });
  }, [fields.length]);

  const handleAdd = () => {
    focusLastOnAdd.current = true;
    append('' as never);
  };

  return (
    <div ref={containerRef} id={anchor} className="w-full flex flex-col">
      {fields.map((field, index) => (
        <LegislativeSourceInput<T>
          key={field.id}
          label={index === 0 ? label : ''}
          name={`${name}.${index}` as Path<T>}
          onRemove={() => remove(index)}
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
            <ButtonInput onClick={handleAdd}>
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
