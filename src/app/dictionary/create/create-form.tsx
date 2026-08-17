'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { FormProvider, useForm } from 'react-hook-form';

import { OntologyCreateModel, useCreateOntology } from '@/api/generated';
import { FormSection } from '@/components/conceptForm/components/FormSection';
import { FormToolbar } from '@/components/conceptForm/components/FormToolbar';
import { useDictionaryFormHints } from '@/components/conceptForm/components/hint/conceptFormHints';
import { HintSidebar } from '@/components/conceptForm/components/hint/HintSidebar';
import { useFormHints } from '@/components/conceptForm/components/hint/useFormHints';
import { Input } from '@/components/shared/Input';
import { LanguageInput } from '@/components/shared/LanguageInput';
import { useFormDraft } from '@/hooks/useFormDraft';
import { useSubmitForm } from '@/hooks/useSubmitForm';
import { NAMESPACE } from '@/lib/constants';
import { draftKeys } from '@/lib/draftKeys';
import { createOntologySchema, OntologySchemaType } from '@/lib/formSchemas';

type LanguageEntry = { name?: string; languageTag?: string };

const DEFAULT_VALUES = {
  namespace: NAMESPACE,
  nameModel: [{ name: '', languageTag: 'cs' }],
  descriptionModel: [{ name: '', languageTag: 'cs' }],
};

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

export const CreateForm = () => {
  const t = useTranslations('CreateOntology');
  const router = useRouter();

  const form = useForm<OntologySchemaType>({
    mode: 'onChange',
    resolver: zodResolver(createOntologySchema(t)),
    defaultValues: DEFAULT_VALUES,
  });

  useFormDraft(form, draftKeys.ontologyCreate);

  const { hints, defaultHint } = useDictionaryFormHints();

  const { hint, open, setOpen, handleFocus } = useFormHints(hints, defaultHint);

  const { mutate, isPending, isPaused } = useCreateOntology();
  const { handleSubmit } = form;
  const submitForm = useSubmitForm();

  const buildPayload = (data: OntologySchemaType): OntologyCreateModel => {
    const name = toLanguageMap(data.nameModel);
    const description = toLanguageMap(data.descriptionModel);
    return {
      namespace: data.namespace,
      nameModel: { name },
      descriptionModel: { description },
    };
  };

  const onSubmit = (data: OntologySchemaType) => {
    submitForm({
      mutate,
      variables: { data: buildPayload(data) },
      onSuccess: (response) => {
        if (response.data?.slug) {
          router.push(`/dictionary/${response.data.slug}`);
        }
      },
      draftKey: draftKeys.ontologyCreate,
      reset: () => form.reset(DEFAULT_VALUES),
      offlineMessage: t('Form.SavedOffline'),
    });
  };

  const handleCancel = () => {
    if (
      form.formState.isDirty &&
      !window.confirm(t('DiscardChangesConfirmation'))
    ) {
      return;
    }

    form.reset();
    router.back();
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
          <FormToolbar<OntologySchemaType>
            isPending={isPending && !isPaused}
            onCancel={handleCancel}
          />
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
