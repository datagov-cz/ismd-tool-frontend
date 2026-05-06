import {
  GovButton,
  GovChip,
  GovDropdown,
  GovFormInput,
  GovFormLabel,
  GovIcon,
} from '@gov-design-system-ce/react';
import {
  ArrayPath,
  FieldArray,
  FieldValues,
  useFieldArray,
  useFormContext,
} from 'react-hook-form';

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
}

export const LanguageInput = <T extends FieldValues>({
  label,
  placeholder,
  name,
  multiline,
}: Props<T>) => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<T>();

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

  return (
    <div className="w-full space-y-2">
      {fields.map((field, index) => {
        const lang = (field as unknown as LanguageEntry).languageTag;
        const fieldPath = `${name}.${index}.name` as Parameters<
          typeof register
        >[0];
        const fieldError = (
          errors as Record<
            string,
            { [i: number]: { name?: { message?: string } } }
          >
        )?.[name as string]?.[index]?.name?.message;

        return (
          <div
            key={field.id}
            className="w-full grid grid-cols-7 gap-y-4 gap-x-2 relative"
          >
            <GovFormLabel className="w-fit! pt-2.5">
              <span className="font-bold">{index === 0 ? label : ''}</span>
            </GovFormLabel>
            <div className="col-span-6 relative flex items-center gap-2">
              <GovChip
                type="outlined"
                color="primary"
                size="xs"
                className="uppercase absolute -translate-x-full -left-2 top-1/2 -translate-y-1/2"
              >
                {lang}
              </GovChip>
              <GovFormInput
                {...register(fieldPath)}
                placeholder={placeholder}
                className="border-0! flex-1"
                multiline={multiline}
                rows={multiline ? 4 : undefined}
              />
              {fieldError && (
                <span className="text-red-600 text-sm absolute bottom-0 left-10 translate-y-full">
                  {fieldError}
                </span>
              )}
            </div>

            {index === 0 && (
              <LanguageDropDownSelect
                availableLanguages={remainingLanguages}
                onClick={(lang) =>
                  append({
                    name: '',
                    languageTag: lang,
                  } as unknown as FieldArray<T, ArrayPath<T>>)
                }
              />
            )}

            {index > 0 && (
              <GovButton
                className="absolute! right-1 top-1/2 -translate-y-1/2"
                type="base"
                color="error"
                size="s"
                onGovClick={() => remove(index)}
              >
                <GovIcon type="components" name="trash" slot="icon-start" />
              </GovButton>
            )}
          </div>
        );
      })}
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
  return (
    <GovDropdown className="absolute! right-1 top-1/2 -translate-y-1/2 z-100!">
      <GovButton color="primary" type="base" size="s">
        <GovIcon type="components" name="translate" slot="icon-start" />
        <GovIcon type="components" name="plus" slot="icon-end" />
      </GovButton>
      <ul slot="list" className="p-0!">
        {availableLanguages.map((item) => (
          <li key={item}>
            <GovButton
              expanded={true}
              type="base"
              color="neutral"
              onGovClick={() => onClick(item)}
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
    </GovDropdown>
  );
};
