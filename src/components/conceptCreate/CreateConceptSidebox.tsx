'use client';

import { useRef, useState } from 'react';
import {
  GovButton,
  GovFormLabel,
  GovFormSelect,
} from '@gov-design-system-ce/react';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import {
  ConceptDetailModel,
  ConceptEditModelConceptTypeEnum,
  useCreateConcept,
} from '@/api/generated';
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

interface CreateConceptProps {
  namespace: string;
  concepts?: ConceptDetailModel[];
}

export const CreateConceptSideBox = ({
  namespace,
  concepts,
}: CreateConceptProps) => {
  const t = useTranslations('DictionaryDetail.CreateConcept');

  const isOpen = useCreateConceptBoxStore((state) => state.isOpen);
  const setIsOpen = useCreateConceptBoxStore((state) => state.setIsOpen);

  const [conceptType, setConceptType] =
    useState<ConceptEditModelConceptTypeEnum>('TRIDA');

  const form = useForm<CreateConceptFormData>({
    resolver: zodResolver(createConceptSchema),
    defaultValues: {
      conceptTypeEnum: conceptType,
      ontologyGraphName: namespace,
      namespace: namespace,
      altNameModel: [{ altName: '', languageTag: 'cs' }],
      nameModel: { name: '', languageTag: 'cs' },
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = form;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const tError = useTranslations('Errors');

  const postConceptMutation = useCreateConcept({
    mutation: {
      onSuccess: (data) => {
        toast(data.message || 'Concept created successfully', {
          type: 'success',
        });
        reset();
        setIsOpen(false);
      },
      onError: (error) => {
        toast(getErrorMessage(error, tError), { type: 'error' });
      },
    },
  });

  const onSubmit = (data: CreateConceptFormData) => {
    postConceptMutation.mutate({
      data: data,
      params: {
        userId: 'test',
      },
    });
  };

  return (
    <Sidebox title={t('Title')} isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="mt-4 flex-1 overflow-hidden flex flex-col h-full px-5 overflow-y-auto">
        <div ref={containerRef} className="space-y-4 ">
          <form
            className={clsx('relative w-full rounded-md space-y-4')}
            onSubmit={handleSubmit(onSubmit)}
          >
            <div>
              <GovFormLabel size="m">Typ pojmu</GovFormLabel>
              <GovFormSelect
                {...register('conceptTypeEnum')}
                onGovChange={(e) =>
                  setConceptType(
                    e.target.value as ConceptEditModelConceptTypeEnum,
                  )
                }
              >
                <option
                  value={ConceptEditModelConceptTypeEnum.TRIDA}
                  label="Třída"
                />
                <option
                  value={ConceptEditModelConceptTypeEnum.VLASTNOST}
                  label="Vlastnost"
                />
                <option
                  value={ConceptEditModelConceptTypeEnum.VZTAH}
                  label="Vztah"
                />
              </GovFormSelect>
              {errors.conceptTypeEnum && (
                <span className="text-red-600 text-sm">
                  {errors.conceptTypeEnum.message}
                </span>
              )}
            </div>

            {conceptType === 'TRIDA' && (
              <ClassCreateFields
                register={register}
                errors={errors}
                control={control}
                form={form}
              />
            )}
            {conceptType === 'VLASTNOST' && (
              <PropertyCreateFields
                register={register}
                errors={errors}
                control={control}
                form={form}
                concepts={concepts}
              />
            )}
            {conceptType === 'VZTAH' && (
              <RelationshipConceptFields
                register={register}
                errors={errors}
                control={control}
                form={form}
                concepts={concepts}
              />
            )}

            <GovButton
              aria-label={t('SendButtonAria')}
              nativeType="submit"
              type="solid"
              color="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </GovButton>
          </form>
        </div>
      </div>
    </Sidebox>
  );
};
