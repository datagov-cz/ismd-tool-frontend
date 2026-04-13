'use client';

import { useEffect, useRef, useState } from 'react';
import {
  GovButton,
  GovFormControl,
  GovFormLabel,
  GovFormSelect,
} from '@gov-design-system-ce/react';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import {
  ConceptEditModelConceptTypeEnum,
  CreateConceptBody,
  useCreateConcept,
  useEditConcept,
} from '@/api/generated';
import { useQueryInvalidator } from '@/hooks/useQueryInvalidator';
import { useCreateConceptBoxStore } from '@/store/createConceptBoxStore';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { Sidebox } from '../shared/Sidebox';

import { ClassCreateFields } from './ClassConceptFields';
import {
  CreateConceptFormData,
  createConceptSchema,
} from './createConceptSchema';
import { PropertyCreateFields } from './PropertyConceptFields';
import { RelationshipConceptFields } from './RelationshipConceptFields';
import { createDefaultValues } from './utils/createDefaultValues';
import { transformLanguageData } from './utils/transformLanguageData';

const STORAGE_KEY = 'concept-create-form';

interface CreateConceptProps {
  namespace: string;
  slug: string;
  defaultData?: Partial<CreateConceptFormData>;
  action?: 'create' | 'update';
  conceptId?: number;
  sideboxId: string;
}

const CONCEPT_TYPE_OPTIONS = [
  { value: ConceptEditModelConceptTypeEnum.TRIDA, label: 'Třída' },
  { value: ConceptEditModelConceptTypeEnum.VLASTNOST, label: 'Vlastnost' },
  { value: ConceptEditModelConceptTypeEnum.VZTAH, label: 'Vztah' },
] as const;

export const CreateConceptSideBox = ({
  namespace,
  slug,
  defaultData,
  action = 'create',
  conceptId,
  sideboxId,
}: CreateConceptProps) => {
  const t = useTranslations('CreateConcept');

  const isOpen = useCreateConceptBoxStore((state) => state.isOpen(sideboxId));
  const setOpenBoxId = useCreateConceptBoxStore((state) => state.setOpenBoxId);

  const setIsOpen = (open: boolean) => setOpenBoxId(open ? sideboxId : null);

  const invalidator = useQueryInvalidator();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [typeConcept, setTypeConcept] = useState<string>(
    defaultData?.conceptTypeEnum || 'TRIDA',
  );

  const getStoredData = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    }
    return {};
  };

  const form = useForm<CreateConceptFormData>({
    resolver: zodResolver(createConceptSchema),
    defaultValues: {
      ...createDefaultValues(namespace, 'TRIDA'),
      ...getStoredData(),
    },
    values: defaultData
      ? ({
          ...createDefaultValues(
            namespace,
            defaultData.conceptTypeEnum || 'TRIDA',
          ),
          ...defaultData,
          ...getStoredData(),
        } as CreateConceptFormData)
      : undefined,
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) {
      toast.error('Prosím opravte chyby ve formuláři.', {
        position: 'bottom-right',
      });
    }
  }, [errors]);

  const mutationOptions = {
    onSuccess: async () => {
      localStorage.removeItem(STORAGE_KEY);
      await invalidator.invalidateOntology(slug);
      await invalidator.invalidateConcept(slug);
      toast(t('Success'), {
        type: 'success',
      });
      setIsOpen(false);
    },
    onError: () => {
      toast(t('Error'), { type: 'error' });
    },
  };

  useEffect(() => {
    const subscription = form.watch(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(getValues()));
    });
    return () => subscription.unsubscribe();
  }, [form, getValues]);

  const updateMutation = useEditConcept({ mutation: mutationOptions });

  const postConceptMutation = useCreateConcept({
    mutation: {
      onSuccess: async (data) => {
        await invalidator.invalidateOntology(slug);
        localStorage.removeItem(STORAGE_KEY);
        toast(data.message || 'Concept created successfully', {
          type: 'success',
        });
        form.reset(createDefaultValues(namespace, 'TRIDA'));
        setIsOpen(false);
      },
      onError: (error) => {
        toast(getErrorMessage(error, ''), { type: 'error' });
      },
    },
  });

  const transformFormData = (
    data: CreateConceptFormData,
  ): CreateConceptBody => {
    return {
      ...data,
      nameModel: {
        name: { cs: data.nameModel.name },
      },
      sharingMethod: data.sharingMethod?.map((item) => item.value || ''),
      definitionModel: data.definitionModel?.length
        ? { definition: transformLanguageData(data.definitionModel) }
        : undefined,
      descriptionModel: data.descriptionModel?.length
        ? { description: transformLanguageData(data.descriptionModel) }
        : undefined,
      altNameModel: data.altNameModel?.length
        ? { altName: transformLanguageData(data.altNameModel) }
        : undefined,
      conceptType: data.conceptTypeEnum,
      definingLegalSource: data.definingLegalSource?.map(
        (item) => item.value || '',
      ),
      definingNonLegalSource: data.definingNonLegalSource?.map(
        (item) => item.value || '',
      ),
      relatedLegalSource: data.relatedLegalSource?.map(
        (item) => item.value || '',
      ),
      relatedNonLegalSource: data.relatedNonLegalSource?.map(
        (item) => item.value || '',
      ),
      exactMatch: data.exactMatch?.map((item) => item.value || ''),
    };
  };

  const onSubmit = (data: CreateConceptFormData) => {
    if (action === 'create') {
      postConceptMutation.mutate({
        data: transformFormData(data),
        slug: slug,
      });
    } else if (conceptId) {
      updateMutation.mutate({
        data: { ...transformFormData(data) },
        conceptId: conceptId,
      });
    }
  };

  return (
    <Sidebox title={t('Title')} isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="mt-4 flex-1 overflow-hidden flex flex-col h-full px-5 overflow-y-auto">
        <div ref={containerRef} className="space-y-4">
          <form
            className={clsx('relative w-full rounded-md space-y-4')}
            onSubmit={handleSubmit(onSubmit)}
          >
            <GovFormControl>
              <GovFormLabel size="m">Typ pojmu</GovFormLabel>
              <GovFormSelect
                {...register('conceptTypeEnum')}
                onGovChange={(e) => {
                  setTypeConcept(e.target.value);
                  setValue('conceptType', e.target.value);
                }}
                disabled={action === 'update'}
              >
                {CONCEPT_TYPE_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value} label={label} />
                ))}
              </GovFormSelect>
              {errors.conceptTypeEnum && (
                <span className="text-red-600 text-sm">
                  {errors.conceptTypeEnum.message}
                </span>
              )}
            </GovFormControl>

            {typeConcept === 'TRIDA' && (
              <ClassCreateFields
                register={register}
                errors={errors}
                control={control}
                form={form}
              />
            )}

            {typeConcept === 'VLASTNOST' && (
              <PropertyCreateFields
                register={register}
                errors={errors}
                control={control}
                form={form}
              />
            )}

            {typeConcept === 'VZTAH' && (
              <RelationshipConceptFields
                register={register}
                errors={errors}
                control={control}
                form={form}
              />
            )}

            <GovButton
              aria-label={t('SendButtonAria')}
              nativeType="submit"
              type="solid"
              color="primary"
              disabled={isSubmitting}
            >
              {t('Save')}
            </GovButton>
          </form>
        </div>
      </div>
    </Sidebox>
  );
};
