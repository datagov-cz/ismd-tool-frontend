'use client';

import { GovIcon, GovTag } from '@gov-design-system-ce/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import {
  ConceptDetailModel,
  ConceptDetailModelReferencovanéPojmyResolved,
  useEditConcept,
  useGetConceptDetail,
} from '@/api/generated';
import { clearFormDraft } from '@/hooks/useFormDraft';
import { useQueryInvalidator } from '@/hooks/useQueryInvalidator';

import { normalizeFormData } from './ConceptCreate';
import { ConceptForm } from './ConceptForm';
import { type ConceptForm as ConceptFormValues } from './schema/conceptFormSchema';

function toMultiLang(
  record?: Record<string, string>,
): { languageTag: string; name: string }[] {
  if (!record) return [];
  return Object.entries(record).map(([languageTag, name]) => ({
    languageTag,
    name,
  }));
}

// Add these helpers near the top of ConceptEditWrapper.tsx

const SHARING_METHOD_IRI_MAP: Record<string, string> = {
  'veřejně-přístupné': 'veřejně přístupné',
  'poskytované-na-žádost': 'poskytované na žádost',
  'zpřístupňované-pro-výkon-agendy': 'zpřístupňované pro výkon agendy',
};

const ACQUISITION_METHOD_IRI_MAP: Record<string, string> = {
  'jiných-agend': 'jiných agend',
  provozní: 'provozní',
};

const CONTENT_TYPE_IRI_MAP: Record<string, string> = {
  identifikační: 'identifikační',
  evidenční: 'evidenční',
  statistické: 'statistické',
};

function iriToSlug(iri: string): string {
  return iri.split('/').pop() ?? '';
}

function mapSharingMethods(iris?: string[]): string[] {
  return (iris ?? [])
    .map((iri) => SHARING_METHOD_IRI_MAP[iriToSlug(iri)] ?? '')
    .filter(Boolean);
}

function mapAcquisitionMethod(iri?: string): string {
  if (!iri) return '';
  return ACQUISITION_METHOD_IRI_MAP[iriToSlug(iri)] ?? '';
}

function mapContentType(iri?: string): string {
  if (!iri) return '';
  return CONTENT_TYPE_IRI_MAP[iriToSlug(iri)] ?? '';
}

function toConceptRef(
  iri?: string,
  resolved?: ConceptDetailModelReferencovanéPojmyResolved,
): { iri: string; label: string; ontologyLabel: string } | undefined {
  if (!iri) return undefined;
  const resolvedItem = resolved?.[iri];
  if (resolvedItem) {
    return {
      iri: iri,
      label: resolvedItem.conceptName?.cs ?? '',
      ontologyLabel: resolvedItem.ontologyName?.cs ?? '',
    };
  } else if (iri && iri.includes('pojem/')) {
    return {
      iri,
      label: (iri.split('pojem/')[1] ?? '').replace(/-/g, ' '),
      ontologyLabel: '',
    };
  } else {
    return undefined;
  }
}

function toConceptRefs(
  iris?: string[],
  resolved?: ConceptDetailModelReferencovanéPojmyResolved,
): { iri: string; label: string; ontologyLabel: string }[] {
  return (
    iris
      ?.map((iri) => toConceptRef(iri, resolved))
      .filter((ref) => ref !== undefined) ?? []
  );
}

function detectConceptType(typ?: string[]): 'TRIDA' | 'VLASTNOST' | 'VZTAH' {
  if (!typ) return 'TRIDA';
  const joined = typ.join(' ').toLowerCase();
  if (joined.includes('vlastnost') || joined.includes('property'))
    return 'VLASTNOST';
  if (joined.includes('vztah') || joined.includes('relation')) return 'VZTAH';
  return 'TRIDA';
}

export function mapDetailToFormValues(
  detail: ConceptDetailModel,
  graphName: string,
): Partial<ConceptFormValues> {
  const conceptTypeEnum = detectConceptType(detail.typ);

  const altNameRecord = Object.fromEntries(
    Object.entries(detail['alternativní-název'] ?? {}).map(([lang, val]) => {
      if (typeof val === 'string') return [lang, val];
      const first = Object.values(val as Record<string, unknown>)[0];
      return [lang, first != null ? String(first) : ''];
    }),
  );

  return {
    ontologyGraphName: graphName,
    conceptType: conceptTypeEnum,
    conceptTypeEnum,
    identifier: detail['identifikátor'],
    nameModel: {
      name: (detail['název'] as Record<string, string> | undefined) ?? {
        cs: '',
      },
    },
    altNameModel: {
      altName:
        toMultiLang(altNameRecord).length > 0
          ? toMultiLang(altNameRecord)
          : [{ languageTag: 'cs', name: '' }],
    },
    definitionModel: {
      definition:
        toMultiLang(detail['definice']).length > 0
          ? toMultiLang(detail['definice'])
          : [{ languageTag: 'cs', name: '' }],
    },
    descriptionModel: {
      description:
        toMultiLang(detail['popis']).length > 0
          ? toMultiLang(detail['popis'])
          : [{ languageTag: 'cs', name: '' }],
    },
    dataType: detail['obor-hodnot-resolved'],
    definingLegalSource:
      detail['definující-ustanovení-právního-předpisu'] ?? [],
    relatedLegalSource:
      detail['související-ustanovení-právního-předpisu'] ?? [],
    definingNonLegalSource:
      detail['definující-nelegislativní-zdroj']?.map((s) => ({
        name: s.název?.cs,
        description: s.popis?.cs,
        url: s.url,
      })) ?? [],
    relatedNonLegalSource:
      detail['související-nelegislativní-zdroj']?.map((s) => ({
        name: s.název?.cs,
        description: s.popis?.cs,
        url: s.url,
      })) ?? [],
    exactMatch: toConceptRefs(
      detail['ekvivalentní-pojem'],
      detail['referencované-pojmy-resolved'],
    ),
    broaderConcept: toConceptRefs(
      detail['nadřazená-třída'],
      detail['referencované-pojmy-resolved'],
    ),
    superProperty: toConceptRefs(
      detail['nadřazená-vlastnost'],
      detail['referencované-pojmy-resolved'],
    ),
    superRelation: toConceptRefs(
      detail['nadřazený-vztah'],
      detail['referencované-pojmy-resolved'],
    ),
    domain: toConceptRef(
      detail['definiční-obor'],
      detail['referencované-pojmy-resolved'],
    ),
    range: toConceptRef(
      detail['obor-hodnot'],
      detail['referencované-pojmy-resolved'],
    ),
    agendaCode: detail['agenda-resolved'],
    agendaSystemCode: detail['agendový-informační-systém-resolved'],
    contentType: mapContentType(detail['typ-obsahu-údaje']),
    acquisitionMethod: mapAcquisitionMethod(detail['způsob-získání-údaje']),
    sharingMethod: mapSharingMethods(detail['způsob-sdílení-údaje']),
    isInPPDF: detail['je-ppdf'] ?? false,
    isPublic: detail.typ?.includes('Veřejný údaj'),
    privacyProvisions: detail['ustanovení-dokládající-neveřejnost-údaje'] ?? [],
  };
}

export const ConceptEditWrapper = ({ slug }: { slug: string }) => {
  const { data, isLoading } = useGetConceptDetail(slug);
  const { mutate: editConcept, isPending } = useEditConcept();
  const tNav = useTranslations('ConceptDetail.Main.ControlPanel');
  const t = useTranslations('ConceptEditWrapper');
  const router = useRouter();
  const queryInvalidate = useQueryInvalidator();

  const conceptMetadata = data?.data?.conceptMetadata;
  const conceptDetail = data?.data?.conceptDetail;
  const graphName = conceptMetadata?.graphName ?? '';
  const storageKey = `concept-draft:edit:${slug}`;

  const defaultValues =
    conceptDetail && graphName
      ? mapDetailToFormValues(conceptDetail, graphName)
      : undefined;

  const handleSubmit = (formData: ConceptFormValues) => {
    if (conceptMetadata?.id === undefined) return;

    editConcept(
      { conceptId: conceptMetadata.id, data: normalizeFormData(formData) },
      {
        onSuccess: (response) => {
          clearFormDraft(storageKey);
          (queryInvalidate.invalidateConcept(response.data?.slug ?? ''),
            queryInvalidate.invalidateOntology(
              data?.data?.conceptMetadata?.ontologySlug ?? '',
            ),
            toast.success(t('ToastSuccess'), { position: 'bottom-right' }));
          router.push(`/concept/${response.data?.slug}`);
        },
        onError: () => {
          toast.error(t('ToastError'), { position: 'bottom-right' });
        },
      },
    );
  };

  return (
    <div className="w-full max-w-250 mx-auto flex flex-col gap-5 p-5">
      <div className="relative">
        <button
          onClick={() => router.back()}
          className="lg:absolute top-0 lg:-left-5 pt-1 pb-4 lg:-translate-x-full flex gap-1 text-blue-primary font-bold items-center text-sm"
        >
          <GovIcon name="chevron-compact-left" size="s" color="primary" />
          {tNav('Back')}
        </button>

        <span className="font-medium text-md">{t('EditConcept')} </span>

        <GovTag
          color="success"
          type="subtle"
          size="xs"
          className="w-fit border bg-white!"
        >
          <GovIcon name="journal-text" slot="icon-start" type="components" />
          <span className="font-bold text-blue-primary">
            {conceptDetail?.['název']?.cs ?? slug}
          </span>
        </GovTag>
      </div>

      {isLoading && <p className="text-sm text-gray-500">{t('Loading')}</p>}

      {!isLoading && defaultValues && (
        <ConceptForm
          ontologyGraphName={graphName}
          onSubmit={handleSubmit}
          isPending={isPending}
          defaultValues={defaultValues}
          editing={true}
          storageKey={storageKey}
        />
      )}
    </div>
  );
};
