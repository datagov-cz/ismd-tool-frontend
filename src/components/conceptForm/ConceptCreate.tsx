'use client';

import { GovIcon, GovTag } from '@gov-design-system-ce/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import {
  CreateConceptBody,
  useCreateConcept,
  useGetOntologyDetail,
} from '@/api/generated';

import { ConceptForm } from './ConceptForm';
import { type ConceptForm as ConceptFormValues } from './schema/conceptFormSchema';

export const normalizeFormData = (
  formData: ConceptFormValues,
): CreateConceptBody => {
  const toRecord = (arr?: { languageTag: string; name: string }[]) =>
    arr?.reduce<Record<string, string>>((acc, { languageTag, name }) => {
      acc[languageTag] = name;
      return acc;
    }, {});

  const toIri = (refs?: { iri: string; label: string }[]) =>
    refs?.map((r) => r.iri);

  return {
    ...formData,
    altNameModel: formData.altNameModel?.altName
      ? { altName: toRecord(formData.altNameModel.altName) }
      : undefined,
    dataType: formData.dataType?.code,
    definitionModel: formData.definitionModel?.definition
      ? { definition: toRecord(formData.definitionModel.definition) }
      : undefined,
    descriptionModel: formData.descriptionModel?.description
      ? { description: toRecord(formData.descriptionModel.description) }
      : undefined,
    broaderConcept: toIri(formData.broaderConcept),
    superProperty: toIri(formData.superProperty),
    superRelation: toIri(formData.superRelation),
    exactMatch: toIri(formData.exactMatch),
    domain: formData.domain?.iri,
    range: formData.range?.iri,
    agendaCode: formData.agendaCode?.iri,
    agendaSystemCode: formData.agendaSystemCode?.iri,
  };
};

export const ConceptCreateWrapper = ({ ontology }: { ontology: string }) => {
  const { data } = useGetOntologyDetail(ontology);
  const { mutate: createConcept, isPending } = useCreateConcept();
  const tNav = useTranslations('ConceptDetail.Main.ControlPanel');
  const t = useTranslations('ConceptCreateWrapper');
  const router = useRouter();

  const graphName = data?.data?.ontologyMetadata?.graphName;

  const handleSubmit = (formData: ConceptFormValues) => {
    createConcept(
      { slug: ontology, data: normalizeFormData(formData) },
      {
        onSuccess: (response) => {
          toast.success(t('ToastSuccess'), { position: 'bottom-right' });
          router.push(`/concept/${response.data?.slug}`);
        },
        onError: () => {
          toast.error(t('ToastError'), { position: 'bottom-right' });
        },
      },
    );
  };

  return (
    <div className="w-full max-w-250 mx-auto flex flex-col gap-5 py-5 px-5">
      <div className="relative">
        <button
          onClick={() => router.back()}
          className="lg:absolute top-0 -left-5 lg:pt-1 lg:-translate-x-full pb-4 flex gap-1 text-blue-primary font-bold items-center text-sm"
        >
          <GovIcon name="chevron-compact-left" size="s" color="primary" />
          {tNav('Back')}
        </button>

        <span className="font-medium text-md">{t('NewConceptFor')} </span>

        <GovTag
          color="success"
          type="subtle"
          size="xs"
          className="w-fit border bg-white!"
        >
          <GovIcon name="journal-text" slot="icon-start" type="components" />
          <span className="font-bold text-blue-primary">
            {data?.data?.ontologyDetail?.název?.cs}
          </span>
        </GovTag>
      </div>

      {graphName && (
        <ConceptForm
          ontologyGraphName={graphName}
          onSubmit={handleSubmit}
          isPending={isPending}
        />
      )}
    </div>
  );
};
