'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import { OntologyCreateModel, useCreateOntology } from '@/api/generated';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { TextArea } from '@/components/shared/Textarea';
import { useIsOnline } from '@/hooks/useIsOnline';
import { LANG_TAGS, NAMESPACE } from '@/lib/constants';
import { db, type OntologyDraft } from '@/lib/db';
import { createOntologySchema, OntologySchemaType } from '@/lib/formSchemas';

const STORAGE_KEY = 'ontology-create-form';

export const CreateForm = () => {
  const t = useTranslations('CreateOntology');
  const isOnline = useIsOnline();

  const router = useRouter();

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
    getValues,
    formState: { isSubmitting },
  } = form;

  useEffect(() => {
    const subscription = form.watch(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(getValues()));
    });
    return () => subscription.unsubscribe();
  }, [form, getValues]);

  useEffect(() => {
    if (isOnline) {
      syncOfflineData();
    }
  }, [isOnline]);

  const syncOfflineData = async () => {
    try {
      const drafts = await db.ontologyDrafts.toArray();
      for (const draft of drafts) {
        const payload: OntologyCreateModel = {
          namespace: draft.namespace,
          nameModel: { name: { cs: draft.name } },
          descriptionModel: { description: { cs: draft.description } },
        };

        mutate(
          { data: payload },
          {
            onSuccess: async () => {
              await db.ontologyDrafts.delete(draft.id!);
              toast(t('Form.CreateNewDictSuccess'));
            },
            onError: () => {
              toast(t('Form.CreateNewDictSyncError'));
            },
          },
        );
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const onSubmit = async (data: OntologySchemaType) => {
    if (!isOnline) {
      try {
        const draft: OntologyDraft = {
          namespace: data.namespace,
          name: data.name,
          description: data.description,
          languageTag: data.languageTag,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await db.ontologyDrafts.add(draft);

        form.reset();
        localStorage.removeItem(STORAGE_KEY);
        toast(
          t('Form.SavedOffline') || 'Saved offline. Will sync when online.',
        );
        return;
      } catch (error) {
        console.error('Failed to save offline:', error);
        toast(t('Form.CreateNewDictError'));
        return;
      }
    }

    const payload: OntologyCreateModel = {
      namespace: data.namespace,
      nameModel: { name: { cs: data.name } },
      descriptionModel: { description: { cs: data.description } },
    };

    mutate(
      { data: payload },
      {
        onSuccess: (response) => {
          localStorage.removeItem(STORAGE_KEY);
          toast(t('Form.CreateNewDictSuccess'));
          if (response.data?.slug) {
            router.push(`/dictionary/${response.data?.slug}`);
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
