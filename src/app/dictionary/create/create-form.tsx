'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import { OntologyCreateModel, useCreateOntology } from '@/api/generated';
import { FormSection } from '@/components/conceptForm/components/FormSection';
import { FormToolbar } from '@/components/conceptForm/components/FormToolbar';
import { useDictionaryFormHints } from '@/components/conceptForm/components/hint/conceptFormHints';
import { HintSidebar } from '@/components/conceptForm/components/hint/HintSidebar';
import { useFormHints } from '@/components/conceptForm/components/hint/useFormHints';
import { Input } from '@/components/shared/Input';
import { LanguageInput } from '@/components/shared/LanguageInput';
import { useIsOnline } from '@/hooks/useIsOnline';
import { NAMESPACE } from '@/lib/constants';
import { db, type OntologyDraft } from '@/lib/db';
import { createOntologySchema, OntologySchemaType } from '@/lib/formSchemas';

const STORAGE_KEY = 'ontology-create-form';

type LanguageEntry = { name?: string; languageTag?: string };

const toLanguageMap = (
  entries: LanguageEntry[] | undefined,
): Record<string, string> =>
  entries?.reduce(
    (acc, { languageTag, name }) => {
      if (languageTag) acc[languageTag] = name ?? '';
      return acc;
    },
    {} as Record<string, string>,
  ) ?? {};

const buildDefaultValues = (): Partial<OntologySchemaType> => {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
};

export const CreateForm = () => {
  const t = useTranslations('CreateOntology');
  const isOnline = useIsOnline();
  const router = useRouter();

  const form = useForm<OntologySchemaType>({
    mode: 'onChange',
    resolver: zodResolver(createOntologySchema(t)),
    defaultValues: {
      namespace: NAMESPACE,
      nameModel: [{ name: '', languageTag: 'cs' }],
      descriptionModel: [{ name: '', languageTag: 'cs' }],
      ...buildDefaultValues(),
    },
  });

  const { hints, defaultHint } = useDictionaryFormHints();

  const { hint, open, setOpen, handleFocus } = useFormHints(hints, defaultHint);

  const { mutate, isPending } = useCreateOntology();
  const { handleSubmit, getValues } = form;

  useEffect(() => {
    const subscription = form.watch(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(getValues()));
    });
    return () => subscription.unsubscribe();
  }, [form, getValues]);

  useEffect(() => {
    if (isOnline) syncOfflineData();
  }, [isOnline]);

  const buildPayload = (data: OntologySchemaType): OntologyCreateModel => {
    const name = toLanguageMap(data.nameModel);
    const description = toLanguageMap(data.descriptionModel);
    return {
      namespace: data.namespace,
      nameModel: { name },
      descriptionModel: { description },
    };
  };

  const syncOfflineData = async () => {
    try {
      const drafts = await db.ontologyDrafts.toArray();
      for (const draft of drafts) {
        mutate(
          { data: draft.payload },
          {
            onSuccess: async () => {
              await db.ontologyDrafts.delete(draft.id!);
              toast(t('Form.CreateNewDictSuccess'));
            },
            onError: () => toast(t('Form.CreateNewDictSyncError')),
          },
        );
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Sync failed:', error);
    }
  };

  const onSubmit = async (data: OntologySchemaType) => {
    const payload = buildPayload(data);

    if (!isOnline) {
      try {
        const draft: OntologyDraft = {
          namespace: data.namespace,
          payload,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await db.ontologyDrafts.add(draft);
        form.reset();
        localStorage.removeItem(STORAGE_KEY);
        toast(
          t('Form.SavedOffline') || 'Saved offline. Will sync when online.',
        );
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to save offline:', error);
        toast(t('Form.CreateNewDictError'));
      }
      return;
    }

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
          // eslint-disable-next-line no-console
          console.error('Failed to create ontology:', error);
          toast(t('Form.CreateNewDictError'));
        },
      },
    );
  };

  return (
    <FormProvider {...form}>
      <div className="relative w-full lg:max-w-160 xl:max-w-200">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-2.5"
          onFocus={handleFocus}
        >
          <FormSection label="Základní parametry" icon="tag">
            <Input
              register={form.register}
              name="namespace"
              label={t('Form.NamespaceLabel')}
              placeholder={t('Form.NamespacePlaceholder')}
            />
            <LanguageInput<OntologySchemaType>
              name="nameModel"
              label={t('Form.NameLabel')}
              placeholder={t('Form.NamePlaceholder')}
            />
            <LanguageInput<OntologySchemaType>
              name="descriptionModel"
              label={t('Form.DescriptionLabel')}
              placeholder={t('Form.DescriptionPlaceholder')}
            />
          </FormSection>
          <FormToolbar<OntologySchemaType> isPending={isPending} />
        </form>
        <div className="absolute hidden lg:block left-full top-0 h-full w-full xl:w-[calc(100vw-100%-12rem)] pl-6">
          {open && (
            <HintSidebar
              hint={hint}
              onClose={() => setOpen(false)}
              className="sticky top-22 w-full max-w-80"
            />
          )}
        </div>
      </div>
    </FormProvider>
  );
};
