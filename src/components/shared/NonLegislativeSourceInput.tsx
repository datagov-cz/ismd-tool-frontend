import { useState } from 'react';
import {
  GovButton,
  GovFormInput,
  GovFormLabel,
  GovIcon,
} from '@gov-design-system-ce/react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

type SourceItem = {
  name: string;
  description: string;
  url: string;
};

type SourceItemFieldError = {
  [_K in keyof SourceItem]?: {
    message?: string;
    type?: string;
  };
};

const SourceInputForm = ({
  index,
  fieldName,
  onSave,
  onCancel,
  onDelete,
  isExisting,
}: {
  index: number;
  fieldName: string;
  onSave: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  isExisting: boolean;
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const fieldErrors = (
    errors[fieldName] as SourceItemFieldError[] | undefined
  )?.[index];

  const nameError = fieldErrors?.name?.message;
  const descriptionError = fieldErrors?.description?.message;
  const urlError = fieldErrors?.url?.message;

  return (
    <div className="col-span-6 relative">
      <div className="relative">
        <Controller
          control={control}
          name={`${fieldName}.${index}.name`}
          render={({ field }) => (
            <GovFormInput
              {...field}
              id={`${fieldName}.${index}.name`}
              placeholder="Zadejte název zdroje"
              className={`border-0! [&_span]:rounded-b-none! ${nameError ? '[&_span]:bg-status-error-200/30!' : ''}`}
            />
          )}
        />
        {nameError && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-status-error-600 text-xs pointer-events-none z-10">
            {nameError}
          </span>
        )}
      </div>

      <div className="relative">
        <Controller
          control={control}
          name={`${fieldName}.${index}.description`}
          render={({ field }) => (
            <GovFormInput
              {...field}
              id={`${fieldName}.${index}.description`}
              placeholder="Zadejte popis"
              className={`border-0! [&_span]:rounded-none! [&_span]:border-y-0! ${descriptionError ? '[&_span]:bg-status-error-200/30!' : ''}`}
            />
          )}
        />
        {descriptionError && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-status-error-600 text-xs pointer-events-none z-10">
            {descriptionError}
          </span>
        )}
      </div>

      <div className="relative">
        <Controller
          control={control}
          name={`${fieldName}.${index}.url`}
          render={({ field }) => (
            <GovFormInput
              {...field}
              id={`${fieldName}.${index}.url`}
              placeholder="Zadejte odkaz ke zdroji"
              className={`border-0! [&_span]:rounded-t-none! ${urlError ? '[&_span]:bg-status-error-200/30!' : ''}`}
            />
          )}
        />
        {urlError && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-status-error-600 text-xs pointer-events-none z-10">
            {urlError}
          </span>
        )}
      </div>

      <div className="pt-2 flex gap-2 w-full items-center justify-end">
        {isExisting && onDelete && (
          <button type="button" className="mr-4" onClick={onDelete}>
            <GovIcon color="error" name="trash" />
          </button>
        )}
        <GovButton
          type="outlined"
          color="neutral"
          size="s"
          onGovClick={onCancel}
        >
          <GovIcon
            slot="icon-start"
            name={isExisting ? 'arrow-counterclockwise' : 'x'}
            type="components"
          />
          {isExisting ? 'Zpět' : 'Zrušit'}
        </GovButton>
        <GovButton type="solid" color="primary" size="s" onGovClick={onSave}>
          <GovIcon slot="icon-start" name="floppy" type="components" />
          {isExisting ? 'Upravit' : 'Přidat'}
        </GovButton>
      </div>
    </div>
  );
};

const SourceCard = ({
  data,
  onEdit,
  error,
}: {
  data: SourceItem;
  onEdit: () => void;
  error?: string;
}) => (
  <div className="flex flex-col gap-1">
    <div
      className={`w-full border rounded-lg py-2 pl-4 pr-2 flex gap-2 text-sm items-start justify-between ${
        error ? 'border-status-errtext-status-error-600' : 'border-gray-border'
      }`}
    >
      <div className="flex flex-col">
        <span className="font-bold">{data.name}</span>
        <span>{data.description}</span>
        <span className="font-bold">{data.url}</span>
      </div>
      <button type="button" onClick={onEdit}>
        <GovIcon
          type="components"
          name="pencil-square"
          size="s"
          color="primary"
        />
      </button>
    </div>
    {error && (
      <span className="text-status-error-600 text-xs px-1">{error}</span>
    )}
  </div>
);

export const NonLegislativeSourceInput = ({
  name,
  label,
}: {
  name: string;
  label: string;
}) => {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name });

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [savedIndices, setSavedIndices] = useState<Set<number>>(new Set());

  const watchedFields: SourceItem[] = watch(name) ?? [];

  const handleAddNew = () => {
    append({ name: '', description: '', url: '' });
    setEditingIndex(fields.length);
  };

  const handleSave = (index: number) => {
    setSavedIndices((prev) => new Set(prev).add(index));
    setEditingIndex(null);
  };

  const handleCancel = (index: number, isNew: boolean) => {
    if (isNew) remove(index);
    setEditingIndex(null);
  };

  const handleDelete = (index: number) => {
    remove(index);
    setSavedIndices((prev) => {
      const next = new Set<number>();
      prev.forEach((i) => {
        if (i < index) next.add(i);
        if (i > index) next.add(i - 1);
      });
      return next;
    });
    setEditingIndex(null);
  };

  const getCardError = (index: number): string | undefined => {
    const fieldErrors = (errors[name] as SourceItemFieldError[] | undefined)?.[
      index
    ];
    return (
      fieldErrors?.name?.message ??
      fieldErrors?.description?.message ??
      fieldErrors?.url?.message
    );
  };

  return (
    <div className="w-full grid grid-cols-7 gap-y-4 gap-x-2">
      <GovFormLabel className="w-fit! pt-2.5">
        <span className="font-bold">{label}</span>
      </GovFormLabel>

      <div className="col-span-6 ml-10 flex flex-col gap-2">
        {fields.map((field, index) => {
          const isEditing = editingIndex === index;
          const isSaved = savedIndices.has(index);

          if (isEditing) {
            return (
              <SourceInputForm
                key={field.id}
                index={index}
                fieldName={name}
                isExisting={isSaved}
                onSave={() => handleSave(index)}
                onCancel={() => handleCancel(index, !isSaved)}
                onDelete={() => handleDelete(index)}
              />
            );
          }

          return (
            <SourceCard
              key={field.id}
              data={watchedFields[index]}
              onEdit={() => setEditingIndex(index)}
              error={getCardError(index)}
            />
          );
        })}

        {editingIndex === null &&
          (fields.length === 0 ? (
            <button
              type="button"
              className="w-full border rounded-lg border-gray-border flex justify-between items-center py-2 px-4 text-card-description"
              onClick={handleAddNew}
            >
              Zadejte zdroj
              <GovIcon type="components" name="plus" size="s" color="primary" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAddNew}
              className="self-start text-sm text-blue-primary hover:underline cursor-pointer mt-2 font-medium flex items-center gap-1"
            >
              + Přidat další zdroj
            </button>
          ))}
      </div>
    </div>
  );
};
