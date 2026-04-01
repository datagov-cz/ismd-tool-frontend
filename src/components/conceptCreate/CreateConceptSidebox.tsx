'use client';

import { useEffect, useRef } from 'react';
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
  AltNameModelAltName,
  ConceptDetailModel,
  ConceptEditModelConceptTypeEnum,
  CreateConceptBody,
  useCreateConcept,
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

const STORAGE_KEY = 'concept-create-form';

interface CreateConceptProps {
  namespace: string;
  concepts?: ConceptDetailModel[];
  slug: string;
}

const CONCEPT_TYPE_OPTIONS = [
  { value: ConceptEditModelConceptTypeEnum.TRIDA, label: 'Třída' },
  { value: ConceptEditModelConceptTypeEnum.VLASTNOST, label: 'Vlastnost' },
  { value: ConceptEditModelConceptTypeEnum.VZTAH, label: 'Vztah' },
] as const;

const transformLanguageData = (
  items: Array<{ name?: string; languageTag?: string }> | undefined,
) => {
  if (!items?.length) return undefined;

  return items.reduce((acc, item) => {
    if (item.languageTag && item.name) {
      acc[item.languageTag] = item.name;
    }
    return acc;
  }, {} as AltNameModelAltName);
};

const getBaseUrl = (namespace: string) => {
  const lastSlashIndex = namespace.lastIndexOf('/');
  return namespace.substring(0, lastSlashIndex);
};

const createDefaultValues = (
  namespace: string,
  conceptType: ConceptEditModelConceptTypeEnum,
): CreateConceptFormData => ({
  conceptTypeEnum: conceptType,
  conceptType: conceptType,
  ontologyGraphName: namespace,
  namespace: getBaseUrl(namespace),
  altNameModel: [{ name: '', languageTag: 'cs' }],
  descriptionModel: [{ name: '', languageTag: 'cs' }],
  definitionModel: [{ name: '', languageTag: 'cs' }],
  nameModel: { name: '', languageTag: 'cs' },
  definingLegalSource: [{ value: '' }],
  definingNonLegalSource: [{ value: '' }],
  relatedLegalSource: [{ value: '' }],
  relatedNonLegalSource: [{ value: '' }],
  exactMatch: [{ value: '' }],
  domain: '',
  range: '',
  // sharingMethod: [{ value: '' }],
  acquisitionMethod: '',
  contentType: '',
  type: '',
});

export const CreateConceptSideBox = ({
  namespace,
  concepts,
  slug,
}: CreateConceptProps) => {
  const t = useTranslations('DictionaryDetail.CreateConcept');
  const tError = useTranslations('Errors');

  const { isOpen, setIsOpen } = useCreateConceptBoxStore();
  const invalidator = useQueryInvalidator();
  const containerRef = useRef<HTMLDivElement | null>(null);

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
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = form;

  const conceptType = watch('conceptTypeEnum');

  useEffect(() => {
    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) {
      toast.error('Prosím opravte chyby ve formuláři.', {
        position: 'bottom-right',
      });
    }
  }, [errors]);

  useEffect(() => {
    const subscription = form.watch(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(getValues()));
    });
    return () => subscription.unsubscribe();
  }, [form, getValues]);

  const postConceptMutation = useCreateConcept({
    mutation: {
      onSuccess: (data) => {
        localStorage.removeItem(STORAGE_KEY);
        toast(data.message || 'Concept created successfully', {
          type: 'success',
        });
        invalidator.invalidateOntology(slug);
        reset(createDefaultValues(namespace, 'TRIDA'));
        setIsOpen(false);
      },
      onError: (error) => {
        toast(getErrorMessage(error, tError), { type: 'error' });
      },
    },
  });

  const handleConceptTypeChange = (value: string) => {
    setValue('conceptType', value);
  };

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
    postConceptMutation.mutate({
      data: transformFormData(data),
      slug: slug,
    });
  };

  const renderConceptFields = () => {
    const commonProps = {
      register,
      errors,
      control,
      form,
    };

    switch (conceptType) {
      case 'TRIDA':
        return <ClassCreateFields {...commonProps} />;
      case 'VLASTNOST':
        return <PropertyCreateFields {...commonProps} concepts={concepts} />;
      case 'VZTAH':
        return (
          <RelationshipConceptFields {...commonProps} concepts={concepts} />
        );
      default:
        return null;
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
                onGovChange={(e) => handleConceptTypeChange(e.target.value)}
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

            {renderConceptFields()}

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
