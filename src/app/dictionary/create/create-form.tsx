'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { redirect } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import { OntologyCreateModel, useCreateOntology } from '@/api/generated';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { TextArea } from '@/components/shared/Textarea';
import { LANG_TAGS, NAMESPACE } from '@/lib/constants';
import { createOntologySchema, OntologySchemaType } from '@/lib/formSchemas';

const STORAGE_KEY = 'ontology-create-form';

export const CreateForm = () => {
  const t = useTranslations('CreateOntology');

  const getStoredData = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    }
    return {};
  };

  const form = useForm<OntologySchemaType>({
    mode: 'onChange',
    resolver: zodResolver(createOntologySchema(t)),
    defaultValues: {
      namespace: NAMESPACE,
      languageTag: LANG_TAGS[0],
      name: '',
      description: '',
      ...getStoredData(),
    },
  });

  const { mutate, isPending } = useCreateOntology();

  const {
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = form;

  const watchedValues = watch();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchedValues));
  }, [watchedValues]);

  const onSubmit = (data: OntologySchemaType) => {
    const payload: OntologyCreateModel = {
      namespace: data.namespace,
      nameModel: {
        name: { cs: data.name },
      },
      descriptionModel: {
        description: { cs: data.description },
      },
    };

    mutate(
      {
        params: {
          userId: 'test',
        },
        data: payload,
      },
      {
        onSuccess: (response) => {
          localStorage.removeItem(STORAGE_KEY);
          toast(t('Form.CreateNewDictSuccess'));
          if (response.data?.slug) {
            redirect(`/dictionary/${response.data?.slug}`);
          }
        },
        onError: (error) => {
          console.error('Failed to create ontology:', error);
          toast(t('Form.CreateNewDictError'));
        },
      },
    );
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-10">
        <div className="w-full space-y-4">
          <Input
            name="namespace"
            label={t('Form.NamespaceLabel')}
            placeholder={t('Form.NamespacePlaceholder')}
          />
          <Input
            name="name"
            label={t('Form.NameLabel')}
            placeholder={t('Form.NamePlaceholder')}
          />
          <TextArea
            name="description"
            label={t('Form.DescriptionLabel')}
            placeholder={t('Form.DescriptionPlaceholder')}
          />
        </div>
        <Button
          styleType="solid"
          color="primary"
          disabled={isSubmitting || isPending}
          type="submit"
        >
          {t('Form.SubmitButton')}
        </Button>
      </form>
    </FormProvider>
  );
};
