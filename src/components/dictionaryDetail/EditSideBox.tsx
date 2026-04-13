'use client';

import { GovButton } from '@gov-design-system-ce/react';
import { GovFormControl } from '@gov-design-system-ce/react/dist/gov-form-control';
import { GovFormInput } from '@gov-design-system-ce/react/dist/gov-form-input';
import { GovFormLabel } from '@gov-design-system-ce/react/dist/gov-form-label';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import { useEditOntology } from '@/api/generated';
import { useQueryInvalidator } from '@/hooks/useQueryInvalidator';
import { OntologyEditModel, ontologyEditModelSchema } from '@/lib/formSchemas';
import { useEditOntologyBoxStore } from '@/store/editOntologyBoxStore';
import { transformLanguageData } from '../conceptCreate/CreateConceptSidebox';
import { ArrayInputLanguage } from '../conceptCreate/inputs/ArrayInputLanguage';
import { Sidebox } from '../shared/Sidebox';

export type EditSideBoxProps = {
  ontologySlug: string;
  ontologyID: number;
  defaultValues: Omit<OntologyEditModel, 'ontologyIRI'>;
};

export const EditSideBox = ({
  ontologyID,
  defaultValues,
  ontologySlug,
}: EditSideBoxProps) => {
  const t = useTranslations('DictionaryDetail.EditOntology');

  const isOpen = useEditOntologyBoxStore((state) => state.isOpen);
  const setIsOpen = useEditOntologyBoxStore((state) => state.setIsOpen);

  const invalidator = useQueryInvalidator();

  const form = useForm({
    resolver: zodResolver(ontologyEditModelSchema),
    defaultValues: {
      nameModel: '',
      descriptionModel: [{ name: '', languageTag: 'cs' }],
    },
    values: {
      nameModel: defaultValues.nameModel,
      descriptionModel:
        defaultValues.descriptionModel &&
        defaultValues.descriptionModel?.length > 0
          ? defaultValues.descriptionModel
          : [{ name: '', languageTag: 'cs' }],
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const mutation = useEditOntology({
    mutation: {
      onSuccess: async () => {
        await invalidator.invalidateOntology(ontologySlug);
        toast.success(t('SuccessMessage'), { position: 'bottom-right' });
        setIsOpen(false);
      },
      onError: () => {
        toast.error(t('ErrorMessage'), { position: 'bottom-right' });
      },
    },
  });

  const onSubmit = (data: OntologyEditModel) => {
    mutation.mutate({
      data: {
        ...data,
        nameModel: {
          name: { cs: data.nameModel || '' },
        },
        descriptionModel: data.descriptionModel?.length
          ? { description: transformLanguageData(data.descriptionModel) }
          : undefined,
      },
      ontologyId: ontologyID,
    });
  };

  return (
    <Sidebox title={t('Title')} isOpen={isOpen} setIsOpen={setIsOpen} size="m">
      <div className="mt-4 flex-1 overflow-hidden flex flex-col h-full justify-between">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <GovFormControl className="w-full">
            <GovFormLabel size="m">{t('Labels.Name')}</GovFormLabel>
            <GovFormInput {...register('nameModel')} />

            {errors.nameModel && (
              <span className="text-red-600 text-sm">
                {errors.nameModel.message}
              </span>
            )}
          </GovFormControl>

          <ArrayInputLanguage<OntologyEditModel>
            name="descriptionModel"
            register={register}
            errors={errors}
            form={form}
            label={t('Labels.Description')}
          />

          <GovButton
            nativeType="submit"
            color="primary"
            type="solid"
            className="self-end"
          >
            {t('Save')}
          </GovButton>
        </form>
      </div>
    </Sidebox>
  );
};
