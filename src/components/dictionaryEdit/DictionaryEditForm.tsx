import { GovIcon, GovTag } from '@gov-design-system-ce/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import {
  DescriptionModelDescription,
  NameModelName,
  OntologyDetailModel,
  OntologyMetadataModel,
  useEditOntology,
} from '@/api/generated';
import { useQueryInvalidator } from '@/hooks/useQueryInvalidator';
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
): LanguageEntry[] => [
  { name: base ?? '', languageTag: 'cs' },
  ...Object.entries(optional)
    .filter(([, value]) => Boolean(value))
    .map(([languageTag, name]) => ({ languageTag, name: name! })),
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
  const invalidator = useQueryInvalidator();
  const router = useRouter();

  const buildValues = () => ({
    nameModel: buildLanguageEntries(detail.název?.cs, {
      sk: detail.název?.sk,
      en: detail.název?.en,
    }),
    descriptionModel: buildLanguageEntries(detail.popis?.cs, {
      sk: detail.popis?.sk,
      en: detail.popis?.en,
    }),
  });

  const form = useForm<OntologyEditModel>({
    resolver: zodResolver(ontologyEditModelSchema),
    defaultValues: buildValues(),
    values: buildValues(),
  });

  const { handleSubmit } = form;
  const { hints, defaultHintEdit } = useDictionaryFormHints();

  const { hint, open, setOpen, handleFocus } = useFormHints(
    hints,
    defaultHintEdit,
  );

  const { mutate: editOntology, isPending } = useEditOntology({
    mutation: {
      onSuccess: async () => {
        await invalidator.invalidateOntology(metadata.slug || '');
        toast.success(t('SuccessMessage'), { position: 'bottom-right' });
      },
      onError: () => {
        toast.error(t('ErrorMessage'), { position: 'bottom-right' });
      },
    },
  });

  const onSubmit = (data: OntologyEditModel) => {
    const name = toLanguageMap(data.nameModel, emptyLangs) as NameModelName;
    const description = toLanguageMap(
      data.descriptionModel,
      emptyLangs,
    ) as DescriptionModelDescription;

    editOntology({
      data: {
        nameModel: { name },
        descriptionModel: { description },
      },
      ontologyId: ontologyID,
    });
  };

  return (
    <div className="w-full h-full flex-1 bg-primary-subtlest px-5">
      <div className="w-full relative max-w-250 mx-auto py-5">
        <div className="w-full space-y-6 relative lg:max-w-160 xl:max-w-200">
          <div className="space-y-3 relative">
            <div className="relative">
              <button
                onClick={() => router.back()}
                className="lg:absolute lg:top-0 lg:-left-5 pt-1 pb-3 lg:-translate-x-full flex gap-1 text-blue-primary font-bold items-center text-sm"
              >
                <GovIcon name="chevron-compact-left" size="s" color="primary" />
                {t('Back')}
              </button>

              <span className="font-medium text-md">
                {t('EditedOntology')}:{' '}
              </span>

              <GovTag
                color="success"
                type="subtle"
                size="xs"
                className="w-fit border bg-white!"
              >
                <GovIcon
                  name="journal-text"
                  slot="icon-start"
                  type="components"
                />
                <span className="font-bold text-blue-primary">
                  {detail?.['název']?.cs}
                </span>
              </GovTag>
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

                <FormToolbar<OntologyEditModel> isPending={isPending} />
              </form>
            </FormProvider>
          </div>
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
      </div>
    </div>
  );
};
