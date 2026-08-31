'use client';

import { GovIcon, GovTag } from '@gov-design-system-ce/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { UseFormReturn } from 'react-hook-form';

import {
  AltNameModelAltName,
  CreateConceptBody,
  useCreateConcept,
  useGetOntologyDetail,
} from '@/api/generated';
import { useSubmitForm } from '@/hooks/useSubmitForm';
import { draftKeys } from '@/lib/draftKeys';

import { ConceptForm } from './ConceptForm';
import { type ConceptForm as ConceptFormValues } from './schema/conceptFormSchema';

export const normalizeFormData = (
  formData: ConceptFormValues,
  originalLanguageTags?: {
    name?: string[];
    altName?: string[];
    definition?: string[];
    description?: string[];
  },
): CreateConceptBody => {
  const toRecord = (
    arr?: { languageTag: string; name: string }[],
    originalTags?: string[],
  ) => {
    const record: Record<string, string> = {};
    arr?.forEach(({ languageTag, name }) => {
      record[languageTag] = name;
    });
    originalTags?.forEach((tag) => {
      if (!(tag in record)) {
        record[tag] = '';
      }
    });
    return record;
  };

  const toAltNameRecord = (
    entries?: { languageTag: string; name: string }[],
    originalTags?: string[],
  ): AltNameModelAltName => {
    const record: AltNameModelAltName = {};

    entries?.forEach(({ languageTag, name }) => {
      const trimmed = name?.trim();
      if (!trimmed) return;
      (record[languageTag] ??= []).push(trimmed);
    });

    originalTags?.forEach((tag) => {
      record[tag] ??= [];
    });

    return record;
  };

  const toIri = (refs?: { iri: string; label: string }[]) =>
    refs?.map((r) => r.iri);
  return {
    ...formData,
    nameModel: formData.nameModel?.name
      ? { name: toRecord(formData.nameModel.name, originalLanguageTags?.name) }
      : { name: {} },
    altNameModel: {
      altName: toAltNameRecord(
        formData.altNameModel?.altName,
        originalLanguageTags?.altName,
      ),
    },
    dataType: formData.dataType?.code,
    definitionModel: {
      definition: toRecord(
        formData.definitionModel?.definition,
        originalLanguageTags?.definition,
      ),
    },
    descriptionModel: {
      description: toRecord(
        formData.descriptionModel?.description,
        originalLanguageTags?.description,
      ),
    },
    broaderConcept: toIri(formData.broaderConcept),
    superProperty: toIri(formData.superProperty),
    superRelation: toIri(formData.superRelation),
    exactMatch: toIri(formData.exactMatch),
    domain: formData.domain?.iri,
    range: formData.range?.iri,
    agendaCode: formData.agendaCode?.iri,
    agendaSystemCode: formData.agendaSystemCode?.iri,
    privacyProvisions: formData.isPublic ? [] : formData.privacyProvisions,
  };
};

export const ConceptCreateWrapper = ({ ontology }: { ontology: string }) => {
  const { data } = useGetOntologyDetail(ontology);
  const { mutate: createConcept, isPending, isPaused } = useCreateConcept();
  const tNav = useTranslations('ConceptDetail.Main.ControlPanel');
  const t = useTranslations('ConceptCreateWrapper');
  const router = useRouter();
  const submitForm = useSubmitForm();

  const graphName = data?.data?.ontologyMetadata?.graphName;
  const storageKey = draftKeys.conceptCreate(ontology);

  const handleSubmit = (
    formData: ConceptFormValues,
    form: UseFormReturn<ConceptFormValues>,
  ) => {
    submitForm({
      mutate: createConcept,
      variables: { slug: ontology, data: normalizeFormData(formData) },
      onSuccess: (response) => router.push(`/concept/${response.data?.slug}`),
      draftKey: storageKey,
      reset: () => form.reset(),
      offlineMessage: t('SavedOffline'),
    });
  };

  return (
    <div className="w-full max-w-250 mx-auto flex flex-col gap-5 py-5 px-5">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => router.back()}
          className="flex gap-1 text-accent font-bold items-center text-sm"
        >
          <GovIcon name="chevron-compact-left" size="s" color="primary" />
          {tNav('Back')}
        </button>

        <span className="font-medium text-md">{t('NewConceptFor')}</span>

        <GovTag
          color="success"
          type="subtle"
          size="xs"
          className="w-fit border bg-surface!"
        >
          <GovIcon name="journal-text" slot="icon-start" type="components" />
          <span className="font-bold text-accent">
            {data?.data?.ontologyDetail?.název?.cs}
          </span>
        </GovTag>
      </div>

      {graphName && (
        <ConceptForm
          ontologyGraphName={graphName}
          onSubmit={handleSubmit}
          isPending={isPending && !isPaused}
          storageKey={storageKey}
        />
      )}
    </div>
  );
};
