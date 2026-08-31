import { useState } from 'react';
import {
  GovButton,
  GovChip,
  GovFormInput,
  GovFormLabel,
  GovFormTextarea,
  GovIcon,
} from '@gov-design-system-ce/react';
import clsx from 'clsx';
import {
  ArrayPath,
  FieldArray,
  FieldValues,
  get,
  useFieldArray,
  useFormContext,
} from 'react-hook-form';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shared/Popover';
import { useActiveAnchor } from '@/hooks/useActiveAnchor';

type Language = 'cs' | 'sk' | 'en';

interface LanguageEntry {
  name?: string;
  languageTag?: string;
}

type LanguageArrayPath<T extends FieldValues> = {
  [K in ArrayPath<T>]: FieldArray<T, K> extends LanguageEntry ? K : never;
}[ArrayPath<T>];

interface Props<T extends FieldValues> {
  label: string;
  placeholder: string;
  name: LanguageArrayPath<T>;
  multiline?: boolean;
  anchor?: string;
  layout?: 'grid' | 'flex';
}

export const LanguageInput = <T extends FieldValues>({
  label,
  placeholder,
  name,
  multiline,
  anchor,
  layout = 'grid',
}: Props<T>) => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<T>();

  const isActive = useActiveAnchor(anchor);

  const { fields, append, remove } = useFieldArray({
    control,
    name: name as ArrayPath<T>,
  });

  const availableLanguages = ['cs', 'sk', 'en'] as const;
  const usedTags = fields.map(
    (f) => (f as unknown as LanguageEntry).languageTag,
  );
  const remainingLanguages = availableLanguages.filter(
    (lang) => !usedTags.includes(lang),
  );
  const languageErrors = get(errors, name);
  const errorMessage =
    languageErrors?.message ??
    languageErrors?.root?.message ??
    (Array.isArray(languageErrors)
      ? languageErrors.find((error) => error?.name?.message)?.name?.message
      : undefined);

  return (
    <div
      className={clsx(
        'w-full space-y-2 p-2.5 rounded-lg',
        isActive && 'bg-blue-subtle',
      )}
      id={anchor}
    >
      {fields.map((field, index) => {
        const lang = (field as unknown as LanguageEntry).languageTag;
        const fieldPath = `${name}.${index}.name` as Parameters<
          typeof register
        >[0];

        return (
          <div
            key={field.id}
            className={clsx(
              'w-full',
              layout === 'grid'
                ? 'grid grid-cols-7 gap-y-4 gap-x-2'
                : 'flex flex-col',
            )}
          >
            <GovFormLabel className="w-fit! pt-2.5">
              <span className="font-bold">{index === 0 ? label : ''}</span>
            </GovFormLabel>
            <div className="col-span-6 relative flex items-center gap-2 ml-10">
              <GovChip
                type="outlined"
                color="primary"
                size="xs"
                className="uppercase absolute -translate-x-full -left-2 top-1/2 -translate-y-1/2"
              >
                {lang}
              </GovChip>
              <div className="w-full">
                {multiline ? (
                  <GovFormTextarea
                    {...register(fieldPath)}
                    placeholder={placeholder}
                    className="[&input]:border-0! flex-1 [&_span]:pr-14!"
                    rows={4}
                  />
                ) : (
                  <GovFormInput
                    {...register(fieldPath)}
                    placeholder={placeholder}
                    className="[&input]:border-0! flex-1 [&_span]:pr-14!"
                  />
                )}
              </div>

              {index === 0 && (
                <div className="absolute right-1 top-1/2 -translate-y-1/2">
                  <LanguageDropDownSelect
                    availableLanguages={remainingLanguages}
                    onClick={(lang) =>
                      append({
                        name: '',
                        languageTag: lang,
                      } as unknown as FieldArray<T, ArrayPath<T>>)
                    }
                  />
                </div>
              )}

              {index > 0 && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer flex items-center"
                  onClick={() => remove(index)}
                >
                  <GovIcon
                    type="components"
                    name="x"
                    slot="icon-start"
                    size="2xl"
                  />
                </button>
              )}
            </div>
          </div>
        );
      })}
      {errorMessage && (
        <div
          className={clsx(
            'w-full',
            layout === 'grid'
              ? 'grid grid-cols-7 gap-y-4 gap-x-2'
              : 'flex flex-col',
          )}
        >
          <span
            className="block text-status-error-600 text-sm col-start-2 pl-10 col-span-4"
            role="alert"
          >
            {errorMessage}
          </span>
        </div>
      )}
    </div>
  );
};

export const LanguageDropDownSelect = ({
  availableLanguages,
  onClick,
}: {
  availableLanguages: Language[];
  onClick: (_lang: Language) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <GovButton
          color="primary"
          type="base"
          size="s"
          onClick={() => setOpen(true)}
        >
          <GovIcon type="components" name="translate" slot="icon-start" />
          <GovIcon type="components" name="plus" slot="icon-end" />
        </GovButton>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-0 bg-surface" align="end">
        <ul className="p-0 m-0 list-none">
          {availableLanguages.map((item) => (
            <li key={item}>
              <GovButton
                expanded={true}
                type="base"
                color="neutral"
                onClick={() => {
                  onClick(item);
                  setOpen(false);
                }}
              >
                <GovIcon
                  type="components"
                  name={item}
                  slot="icon-start"
                  size="2xl"
                />
                {item}
              </GovButton>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
};
