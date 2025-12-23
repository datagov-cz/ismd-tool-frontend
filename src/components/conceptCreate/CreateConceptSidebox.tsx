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
  useCreateConcept,
  useEditConcept,
} from '@/api/generated';
import { useQueryInvalidator } from '@/hooks/useQueryInvalidator';
import { useCreateConceptBoxStore } from '@/store/createConceptBoxStore';
import { Sidebox } from '../shared/Sidebox';

import { ClassCreateFields } from './ClassConceptFields';
import {
  CreateConceptFormData,
  createConceptSchema,
} from './createConceptSchema';
import { PropertyCreateFields } from './PropertyConceptFields';
import { RelationshipConceptFields } from './RelationshipConceptFields';
import { createDefaultValues } from './utils/createDefaultValues';
import { transformFormData } from './utils/transformFormData';

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

  const createMutation = useCreateConcept({ mutation: mutationOptions });
  const updateMutation = useEditConcept({ mutation: mutationOptions });

  const onSubmit = (data: CreateConceptFormData) => {
    const transformedData = transformFormData(data);
    const params = { userId: 'test' };

    if (action === 'create') {
      createMutation.mutate({ data: transformedData, params });
    } else if (conceptId) {
      updateMutation.mutate({
        data: { ...transformedData },
        params,
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
                {...{
                  register,
                  errors,
                  control,
                  form,
                }}
              />
            )}

            {typeConcept === 'VLASTNOST' && (
              <PropertyCreateFields
                {...{
                  register,
                  errors,
                  control,
                  form,
                }}
              />
            )}

            {typeConcept === 'VZTAH' && (
              <RelationshipConceptFields
                {...{
                  register,
                  errors,
                  control,
                  form,
                }}
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
