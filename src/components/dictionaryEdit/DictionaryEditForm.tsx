import { GovButton, GovIcon, GovTag } from '@gov-design-system-ce/react';
import { zodResolver } from '@hookform/resolvers/zod';
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

  const mutation = useEditOntology({
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

    mutation.mutate({
      data: {
        nameModel: { name },
        descriptionModel: { description },
      },
      ontologyId: ontologyID,
    });
  };

  return (
    <div className="w-full h-full flex-1">
      <div className="w-full bg-primary-subtlest">
        <div className="w-full relative max-w-250 mx-auto pt-2 pb-3">
          <GovButton
            type="base"
            color="primary"
            size="s"
            href={`${process.env.NEXT_PUBLIC_BASE_PATH}/dictionary/${metadata.slug}`}
          >
            <GovIcon
              slot="icon-start"
              name="arrow-right"
              size="l"
              className="rotate-180"
            />
            {t('Back')}
          </GovButton>
        </div>
      </div>
      <div className="w-full relative max-w-250 mx-auto py-3">
        <div className="w-full space-y-6 relative">
          <div className="space-y-3">
            <div className="flex gap-2 items-center">
              <GovTag
                color="success"
                size="xs"
                type="subtle"
                className="w-fit h-fit"
              >
                <GovIcon
                  slot="icon-start"
                  name="journal-text"
                  size="l"
                  className="text-white"
                />
                {t('Ontology')}
              </GovTag>
              <h1 className="text-[32px] font-medium">{detail.název?.cs}</h1>
            </div>
            <FormProvider {...form}>
              <form
                className="flex flex-col gap-4 border rounded-2xl border-blue-border py-5 px-6 bg-primary-subtlest"
                onSubmit={handleSubmit(onSubmit)}
              >
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
                <GovButton
                  nativeType="submit"
                  color="primary"
                  type="solid"
                  className="self-end"
                >
                  {t('Save')}
                </GovButton>
              </form>
            </FormProvider>
          </div>
        </div>
      </div>
    </div>
  );
};
