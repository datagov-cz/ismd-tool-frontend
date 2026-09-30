import { GovIcon, GovTag } from '@gov-design-system-ce/react';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { FormProvider, useForm } from 'react-hook-form';

import {
  DescriptionModelDescription,
  NameModelName,
  OntologyDetailModel,
  OntologyMetadataModel,
  useEditOntology,
} from '@/api/generated';
import { useFormDraft } from '@/hooks/useFormDraft';
import { useSubmitForm } from '@/hooks/useSubmitForm';
import { draftKeys } from '@/lib/draftKeys';
import { OntologyEditModel, ontologyEditModelSchema } from '@/lib/formSchemas';
import { FormSection } from '../conceptForm/components/FormSection';
import { FormToolbar } from '../conceptForm/components/FormToolbar';
import { useDictionaryFormHints } from '../conceptForm/components/hint/conceptFormHints';
import { HintSidebar } from '../conceptForm/components/hint/HintSidebar';
import { useFormHints } from '../conceptForm/components/hint/useFormHints';
import { LanguageInput } from '../shared/LanguageInput';

export type DictionaryEditProps = {
  ontologySlug: string;
  ontologyID: number;
  metadata: OntologyMetadataModel;
  detail: OntologyDetailModel;
};

type LanguageEntry = { name?: string; languageTag?: string };

const buildLanguageEntries = (
  base: string | undefined,
  optional: Record<string, string | undefined>,
  includeEmpty = false,
): LanguageEntry[] => [
  { name: base ?? '', languageTag: 'cs' },
  ...Object.entries(optional)
    .filter(([, value]) => includeEmpty || Boolean(value))
    .map(([languageTag, name]) => ({
      languageTag,
      name: name ?? '',
    })),
];

const toLanguageMap = <T extends Record<string, string>>(
  entries: LanguageEntry[] | undefined,
  fallback: T,
): T =>
  entries?.reduce(
    (acc, { languageTag, name }) => {
      acc[languageTag as keyof T] = (name ?? '') as T[keyof T];
      return acc;
    },
    { ...fallback },
  ) ?? fallback;

const emptyLangs = { cs: '', sk: '', en: '' };

export const DictionaryEditForm = ({
  ontologyID,
  metadata,
  detail,
}: DictionaryEditProps) => {
  const t = useTranslations('DictionaryDetail.EditOntology');
  const router = useRouter();
  const submitForm = useSubmitForm();
  const storageKey = draftKeys.ontologyEdit(metadata.slug ?? '');

  const buildValues = () => ({
    nameModel: buildLanguageEntries(
      detail.název?.cs,
      {
        sk: detail.název?.sk,
        en: detail.název?.en,
      },
      true,
    ),
    descriptionModel: buildLanguageEntries(detail.popis?.cs, {
      sk: detail.popis?.sk,
      en: detail.popis?.en,
    }),
  });

  const form = useForm<OntologyEditModel>({
    resolver: zodResolver(ontologyEditModelSchema(t)),
    defaultValues: buildValues(),
    values: buildValues(),
  });

  useFormDraft(form, storageKey);

  const { handleSubmit } = form;
  const { hints, defaultHintEdit } = useDictionaryFormHints();

  const { hint, open, setOpen, handleFocus } = useFormHints(
    hints,
    defaultHintEdit,
  );

  const { mutate: editOntology, isPending, isPaused } = useEditOntology();

  const onSubmit = (data: OntologyEditModel) => {
    const name = toLanguageMap(data.nameModel, emptyLangs) as NameModelName;
    const description = toLanguageMap(
      data.descriptionModel,
      emptyLangs,
    ) as DescriptionModelDescription;

    submitForm({
      mutate: editOntology,
      variables: {
        data: {
          nameModel: { name },
          descriptionModel: { description },
        },
        ontologyId: ontologyID,
      },
      onSuccess: (res) => router.push(`/dictionary/${res.data?.slug}`),
      draftKey: storageKey,
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
    router.push(`/dictionary/${metadata.slug}`);
  };

  return (
    <div className="w-full h-full flex-1 bg-surface-form px-5">
      <div className="w-full relative max-w-250 mx-auto py-5">
        <div className="w-full space-y-6 relative lg:max-w-160 xl:max-w-200">
          <div className="space-y-3 relative">
            <div className="relative">
              <button
                onClick={() => router.back()}
                className="lg:absolute lg:top-0 lg:-left-5 pt-1 pb-3 lg:-translate-x-full flex gap-1 text-accent font-bold items-center text-sm"
              >
                <GovIcon name="chevron-compact-left" size="s" color="primary" />
                {t('Back')}
              </button>

              <span className="font-medium text-md">
                {t('EditedOntology')}:{' '}
              </span>

              <Link
                href={`/dictionary/${metadata.slug}`}
                className="cursor-pointer"
              >
                <GovTag
                  color="success"
                  type="subtle"
                  size="xs"
                  className="w-fit border bg-surface! cursor-pointer!"
                  iconStart={<GovIcon name="journal-text" type="components" />}
                >
                  <span className="font-bold text-accent">
                    {detail?.['název']?.cs}
                  </span>
                </GovTag>
              </Link>
            </div>
            <FormProvider {...form}>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-2.5"
                onFocus={handleFocus}
              >
                <FormSection label="Základní parametry" icon="tag">
                  <LanguageInput<OntologyEditModel>
                    name="nameModel"
                    label={t('Labels.Name')}
                    placeholder=""
                  />
                  <LanguageInput<OntologyEditModel>
                    name="descriptionModel"
                    label={t('Labels.Description')}
                    placeholder=""
                  />
                </FormSection>

                <FormToolbar<OntologyEditModel>
                  isPending={isPending && !isPaused}
                  onCancel={handleCancel}
                />
              </form>
            </FormProvider>
          </div>
          <div className="absolute hidden lg:block left-full top-0 h-full w-full xl:w-[calc(100vw-100%-12rem)] pl-6">
            {open && (
              <HintSidebar
                hint={hint}
                open={open}
                onToggle={() => setOpen(false)}
                className="sticky top-22 w-full max-w-80"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
