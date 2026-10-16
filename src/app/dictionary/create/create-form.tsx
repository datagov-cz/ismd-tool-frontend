'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';

import {
  type OntologyCreateModel,
  useCreateWithConcepts,
} from '@/api/generated';
import { FormSection } from '@/components/conceptForm/components/FormSection';
import { FormToolbar } from '@/components/conceptForm/components/FormToolbar';
import { useDictionaryFormHints } from '@/components/conceptForm/components/hint/conceptFormHints';
import { HintSidebar } from '@/components/conceptForm/components/hint/HintSidebar';
import { useFormHints } from '@/components/conceptForm/components/hint/useFormHints';
import { AiSuggestionSection } from '@/components/dictionaryCreate/AiSuggestionSection';
import { Input } from '@/components/shared/Input';
import { LanguageInput } from '@/components/shared/LanguageInput';
import { useFormDraft } from '@/hooks/useFormDraft';
import { IRI_CHECK_QUERY_KEY, useIriCheck } from '@/hooks/useIriCheck';
import { useIsOnline } from '@/hooks/useIsOnline';
import { useSubmitForm } from '@/hooks/useSubmitForm';
import { acceptSelected } from '@/hooks/useVocabularyAi';
import { NAMESPACE } from '@/lib/constants';
import { draftKeys } from '@/lib/draftKeys';
import { createOntologySchema, OntologySchemaType } from '@/lib/formSchemas';
import { toCreatePayload } from '@/lib/vocabularyDraft/mapping';
import { findNamingIssues } from '@/lib/vocabularyDraft/validation';
import { useVocabularyDraftStore } from '@/store/vocabularyDraftStore';
import { getErrorMessage } from '@/utils/getErrorMessage';

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
  const tIri = useTranslations('CreateOntology.IriCheck');
  const tAi = useTranslations('CreateOntology.AiSuggestion');
  const tError = useTranslations('Errors');
  const router = useRouter();
  const queryClient = useQueryClient();
  const isOnline = useIsOnline();

  const form = useForm<OntologySchemaType>({
    mode: 'onChange',
    resolver: zodResolver(createOntologySchema(t)),
    defaultValues: DEFAULT_VALUES,
  });

  useFormDraft(form, draftKeys.ontologyCreate);

  const namespace = useWatch({ control: form.control, name: 'namespace' });
  const nameModel = useWatch({ control: form.control, name: 'nameModel' });
  const csName =
    nameModel?.find((entry) => entry.languageTag === 'cs')?.name ?? '';
  const iriCheck = useIriCheck(namespace ?? '', csName);

  const { hints, defaultHint } = useDictionaryFormHints();

  const { hint, open, setOpen, handleFocus } = useFormHints(hints, defaultHint);

  const { handleSubmit } = form;
  const submitForm = useSubmitForm();

  const { mutate, isPending, isPaused } = useCreateWithConcepts({
    mutation: {
      onError: (error) => {
        toast.error(getErrorMessage(error, tError));
        if (axios.isAxiosError(error) && error.response?.status === 409) {
          void queryClient.invalidateQueries({ queryKey: IRI_CHECK_QUERY_KEY });
        }
      },
    },
  });

  const resetAll = () => {
    form.reset(DEFAULT_VALUES);
    useVocabularyDraftStore.getState().reset();
  };

  const buildOntology = (data: OntologySchemaType): OntologyCreateModel => ({
    namespace: data.namespace,
    nameModel: { name: toLanguageMap(data.nameModel) },
    descriptionModel: { description: toLanguageMap(data.descriptionModel) },
  });

  const onSubmit = (data: OntologySchemaType) => {
    if (isOnline && iriCheck.status !== 'ok') {
      toast.error(tIri('BlockedSave'));
      return;
    }

    const { items, selectedRefs, setNamingIssues } =
      useVocabularyDraftStore.getState();
    const issues = findNamingIssues(items, selectedRefs);
    setNamingIssues(issues);
    if (Object.keys(issues).length > 0) {
      toast.error(tAi('NamingIssues'));
      return;
    }

    submitForm({
      mutate,
      variables: {
        data: toCreatePayload(buildOntology(data), items, selectedRefs),
      },
      onSuccess: (response) => {
        acceptSelected(items, selectedRefs);
        useVocabularyDraftStore.getState().reset();
        const slug = response.data?.ontology.slug;
        if (slug) {
          router.push(`/dictionary/${slug}`);
        }
      },
      draftKey: draftKeys.ontologyCreate,
      reset: resetAll,
      offlineMessage: t('Form.SavedOffline'),
    });
  };

  const handleCancel = () => {
    form.reset();
    useVocabularyDraftStore.getState().reset();
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
          <AiSuggestionSection iriStatus={iriCheck.status} iri={iriCheck.iri} />
          <FormToolbar<OntologySchemaType>
            isPending={isPending && !isPaused}
            onCancel={handleCancel}
          />
        </form>
        <div className="absolute hidden lg:block left-full top-0 h-full w-full xl:w-[calc(100vw-100%-12rem)] pl-6">
          <HintSidebar
            hint={hint}
            onToggle={() => setOpen((prev) => !prev)}
            className={clsx(
              'sticky top-22 w-full',
              open ? 'max-w-80' : 'max-w-10',
            )}
            open={open}
          />
        </div>
      </div>
    </FormProvider>
  );
};
