'use client';

import {
  GovButton,
  GovFormControl,
  GovFormInput,
  GovFormLabel,
  GovFormSelect,
  GovIcon,
} from '@gov-design-system-ce/react';
import { useTranslations } from 'next-intl';
import {
  Control,
  FieldErrors,
  useFieldArray,
  UseFormRegister,
  UseFormReturn,
} from 'react-hook-form';

import { CreateConceptFormData } from './createConceptSchema';
import { ArrayInput } from './inputs/ArrayInput';
import { ArrayInputLanguage } from './inputs/ArrayInputLanguage';
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
  const t = useTranslations('CreateConcept.CommonConceptFields');

  const {
    fields: sharingMethodFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: 'sharingMethod',
  });

  return (
    <>
      <TextWithLanguageInput
        textInput={{ label: t('Labels.Name'), name: 'nameModel.name' }}
        languageInput={{
          label: t('Labels.Language'),
          name: 'nameModel.languageTag',
        }}
        register={register}
        errors={errors}
      />

      <ArrayInputLanguage
        name="altNameModel"
        register={register}
        errors={errors}
        form={form}
        label={t('Labels.AlternativeName')}
      />

      <GovFormControl>
        <GovFormLabel size="m" required>
          {t('Labels.Dictionary')}
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
        <GovFormLabel size="m">{t('Labels.Namespace')}</GovFormLabel>
        <GovFormInput {...register('namespace')} invalid={!!errors.namespace} />
        {errors.namespace && (
          <span className="text-red-600 text-sm">
            {errors.namespace.message}
          </span>
        )}
      </GovFormControl>

      <GovFormControl>
        <GovFormLabel size="m">{t('Labels.Identifier')}</GovFormLabel>
        <GovFormInput {...register('identifier')} disabled />
      </GovFormControl>

      <ArrayInputLanguage
        name="descriptionModel"
        register={register}
        errors={errors}
        form={form}
        label={t('Labels.Description')}
      />

      <ArrayInputLanguage
        name="definitionModel"
        register={register}
        errors={errors}
        form={form}
        label={t('Labels.Definition')}
      />

      <ArrayInput
        form={form}
        register={register}
        name="definingLegalSource"
        label={t('Labels.DefiningLegalSource')}
        errors={errors}
      />
      <ArrayInput
        form={form}
        register={register}
        name="definingNonLegalSource"
        label={t('Labels.DefiningNonLegalSource')}
        errors={errors}
      />
      <ArrayInput
        form={form}
        register={register}
        name="relatedLegalSource"
        label={t('Labels.RelatedLegalSource')}
        errors={errors}
      />
      <ArrayInput
        form={form}
        register={register}
        name="relatedNonLegalSource"
        label={t('Labels.RelatedNonLegalSource')}
        errors={errors}
      />
      <ArrayInput
        form={form}
        register={register}
        name="exactMatch"
        label={t('Labels.ExactMatch')}
        errors={errors}
      />

      <GovFormControl className="flex flex-row">
        <div className="flex gap-2 items-center">
          <input
            type="checkbox"
            {...register('inTezaurus')}
            className="w-fit"
          />
          <GovFormLabel size="m">{t('Labels.InThesaurus')}</GovFormLabel>
        </div>
      </GovFormControl>

      <GovFormControl>
        <GovFormLabel size="m">{t('Labels.AgendaCode')}</GovFormLabel>
        <GovFormInput
          {...register('agendaCode')}
          invalid={!!errors.agendaCode}
        />
        {errors.agendaCode && (
          <span className="text-red-600 text-sm">
            {errors.agendaCode.message}
          </span>
        )}
      </GovFormControl>

      <GovFormControl>
        <GovFormLabel size="m">{t('Labels.AgendaSystemCode')}</GovFormLabel>
        <GovFormInput
          {...register('agendaSystemCode')}
          invalid={!!errors.agendaSystemCode}
        />
        {errors.agendaSystemCode && (
          <span className="text-red-600 text-sm">
            {errors.agendaSystemCode.message}
          </span>
        )}
      </GovFormControl>

      <GovFormControl>
        <GovFormLabel size="m">{t('Labels.ContentType')}</GovFormLabel>
        <GovFormSelect {...register('contentType')}>
          <option value="" label="" />
          <option
            value="identifikační"
            label={t('Options.ContentType.Identification')}
          />
          <option
            value="evidenční"
            label={t('Options.ContentType.Registration')}
          />
          <option
            value="statistické"
            label={t('Options.ContentType.Statistical')}
          />
        </GovFormSelect>
      </GovFormControl>

      <GovFormControl>
        <GovFormLabel size="m">{t('Labels.AcquisitionMethod')}</GovFormLabel>
        <GovFormSelect {...register('acquisitionMethod')}>
          <option value="" label="" />
          <option
            value="jiných agend"
            label={t('Options.AcquisitionMethod.FromOtherAgendas')}
          />
          <option value="vlastní" label={t('Options.AcquisitionMethod.Own')} />
          <option
            value="provozní"
            label={t('Options.AcquisitionMethod.Operational')}
          />
        </GovFormSelect>
      </GovFormControl>

      <GovFormControl>
        <GovFormLabel size="m">{t('Labels.SharingMethod')}</GovFormLabel>
        <div className="space-y-2 flex items-end gap-3">
          <div className="flex w-full flex-col gap-2">
            {sharingMethodFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start">
                <GovFormSelect
                  {...register(`sharingMethod.${index}.value` as const)}
                  className="flex-1"
                >
                  <option value="" label="" />
                  <option
                    value="veřejně přístupné"
                    label={t('Options.SharingMethod.PubliclyAccessible')}
                  />
                  <option
                    value="poskytované na žádost"
                    label={t('Options.SharingMethod.ProvidedOnRequest')}
                  />
                  <option
                    value="zpřístupňované pro výkon agendy"
                    label={t(
                      'Options.SharingMethod.AccessibleForAgendaExecution',
                    )}
                  />
                </GovFormSelect>
                {sharingMethodFields.length > 1 && (
                  <GovButton
                    nativeType="button"
                    color="error"
                    type="solid"
                    className="mt-2"
                    onGovClick={() => remove(index)}
                  >
                    <GovIcon name="trash" size="l" className="text-white" />
                  </GovButton>
                )}
              </div>
            ))}
          </div>

          <GovButton
            nativeType="button"
            type="outlined"
            color="primary"
            onGovClick={() => append({ value: '' })}
          >
            +
          </GovButton>
        </div>
        {errors.sharingMethod && (
          <span className="text-red-600 text-sm">
            {errors.sharingMethod.message}
          </span>
        )}
      </GovFormControl>

      <GovFormControl className="flex flex-row">
        <div className="flex gap-2 items-center">
          <input type="checkbox" {...register('isPublic')} className="w-fit" />
          <GovFormLabel size="m">{t('Labels.IsPublic')}</GovFormLabel>
        </div>
      </GovFormControl>

      <GovFormControl>
        <GovFormLabel size="m" required={form.watch('isPublic') === true}>
          {t('Labels.PrivacyProvision')}
        </GovFormLabel>
        <GovFormInput
          {...register('privacyProvision')}
          invalid={!!errors.privacyProvision}
        />
        {errors.privacyProvision && (
          <span className="text-red-600 text-sm">
            {errors.privacyProvision.message}
          </span>
        )}
      </GovFormControl>

      <GovFormControl className="flex flex-row">
        <div className="flex gap-2 items-center">
          <input type="checkbox" {...register('isInPPDF')} className="w-fit" />
          <GovFormLabel size="m" className="w-fit mb-0!">
            {t('Labels.IsInPPDF')}
          </GovFormLabel>
        </div>
      </GovFormControl>
    </>
  );
};
