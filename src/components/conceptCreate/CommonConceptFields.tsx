'use client';

import {
  GovFormControl,
  GovFormInput,
  GovFormLabel,
  GovFormSelect,
} from '@gov-design-system-ce/react';
import {
  Control,
  FieldErrors,
  useFieldArray,
  UseFormRegister,
  UseFormReturn,
} from 'react-hook-form';

import { CreateConceptFormData } from './createConceptSchema';
import { TextWithLanguageInput } from './inputs/TextWithLanguage';

export interface CommonFieldsProps {
  register: UseFormRegister<CreateConceptFormData>;
  errors: FieldErrors<CreateConceptFormData>;
  control: Control<CreateConceptFormData>;
  form: UseFormReturn<CreateConceptFormData, unknown, unknown>;
}

export const CommonConceptFields = ({
  register,
  errors,
  control,
  form,
}: CommonFieldsProps) => {
  const { fields } = useFieldArray({
    control: form.control,
    name: 'altNameModel',
  });

  return (
    <>
      <TextWithLanguageInput
        textInput={{ label: 'Název', name: 'nameModel.name' }}
        languageInput={{ label: 'Jazyk', name: 'nameModel.languageTag' }}
        register={register}
        errors={errors}
        control={control}
        form={form}
      />

      {fields.map((fields, index) => (
        <TextWithLanguageInput
          key={fields.id}
          textInput={{
            label: 'Alternativní název',
            name: `altNameModel.${index}.altName`,
          }}
          languageInput={{
            label: 'Jazyk',
            name: `altNameModel.${index}.languageTag`,
          }}
          register={register}
          errors={errors}
          control={control}
          form={form}
        />
      ))}

      <GovFormControl>
        <GovFormLabel size="m" required>
          Slovník
        </GovFormLabel>
        <GovFormInput
          {...register('ontologyGraphName')}
          invalid={!!errors.ontologyGraphName}
        />
        {errors.ontologyGraphName && (
          <span className="text-red-600 text-sm">
            {errors.ontologyGraphName.message}
          </span>
        )}
      </GovFormControl>

      <GovFormControl className="w-full">
        <GovFormLabel size="m">Concept Type</GovFormLabel>
        <GovFormInput {...register('conceptType')} />
      </GovFormControl>

      <GovFormControl className="w-full">
        <GovFormLabel size="m">Namespace</GovFormLabel>
        <GovFormInput {...register('namespace')} />
      </GovFormControl>

      <GovFormControl>
        <GovFormLabel size="m">Identifikátor</GovFormLabel>
        <GovFormInput {...register('identifier')} />
      </GovFormControl>

      <TextWithLanguageInput
        textInput={{ label: 'Popis', name: 'descriptionModel.description' }}
        languageInput={{ label: 'Jazyk', name: 'descriptionModel.languageTag' }}
        register={register}
        errors={errors}
        control={control}
        form={form}
      />

      <TextWithLanguageInput
        textInput={{ label: 'Definice', name: 'definitionModel.definition' }}
        languageInput={{ label: 'Jazyk', name: 'definitionModel.languageTag' }}
        register={register}
        errors={errors}
        control={control}
        form={form}
      />

      <GovFormControl>
        <GovFormLabel size="m">V Tezaurus</GovFormLabel>
        <GovFormSelect {...register('inTezaurus')}>
          <option value="ano" label="Ano" />
          <option value="ne" label="Ne" />
        </GovFormSelect>
      </GovFormControl>

      <GovFormControl>
        <GovFormLabel size="m">Agenda Code</GovFormLabel>
        <GovFormInput {...register('agendaCode')} />
      </GovFormControl>

      <GovFormControl>
        <GovFormLabel size="m">Agenda System Code</GovFormLabel>
        <GovFormInput {...register('agendaSystemCode')} />
      </GovFormControl>

      <GovFormControl>
        <GovFormLabel size="m">Content Type</GovFormLabel>
        <GovFormInput {...register('contentType')} />
      </GovFormControl>

      <GovFormControl>
        <GovFormLabel size="m">Acquisition Method</GovFormLabel>
        <GovFormInput {...register('acquisitionMethod')} />
      </GovFormControl>

      <GovFormControl>
        <GovFormLabel size="m">Je veřejný</GovFormLabel>
        <GovFormSelect {...register('isPublic')}>
          <option value="ano" label="Ano" />
          <option value="ne" label="Ne" />
        </GovFormSelect>
      </GovFormControl>

      <GovFormControl>
        <GovFormLabel size="m">Sharing Method</GovFormLabel>
        <GovFormInput {...register('sharingMethod')} />
      </GovFormControl>

      <GovFormControl>
        <GovFormLabel size="m">Privacy Provision</GovFormLabel>
        <GovFormInput {...register('privacyProvision')} />
      </GovFormControl>

      <GovFormControl className="flex flex-row">
        <div className="flex gap-2 items-center">
          <input type="checkbox" {...register('isInPPDF')} className="w-fit" />
          <GovFormLabel size="m" className="w-fit mb-0!">
            Je v PPDF
          </GovFormLabel>
        </div>
      </GovFormControl>
    </>
  );
};
