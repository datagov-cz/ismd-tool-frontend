'use client';

import { GovIcon, GovTag } from '@gov-design-system-ce/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import {
  ConceptDetailModel,
  ConceptDetailModelReferencovanéPojmyResolved,
  useEditConcept,
  useGetConceptDetail,
} from '@/api/generated';
import { useQueryInvalidator } from '@/hooks/useQueryInvalidator';
import { useSubmitForm } from '@/hooks/useSubmitForm';
import { draftKeys } from '@/lib/draftKeys';

import { normalizeFormData } from './ConceptCreate';
import { ConceptForm } from './ConceptForm';
import { type ConceptForm as ConceptFormValues } from './schema/conceptFormSchema';

function toMultiLang(
  record?: Record<string, string>,
): { languageTag: string; name: string }[] {
  if (!record) return [];
  return Object.entries(record)
    .map(([languageTag, name]) => ({
      languageTag,
      name,
    }))
    .sort((a, b) => {
      if (a.languageTag === 'cs') return -1;
      if (b.languageTag === 'cs') return 1;
      return 0;
    });
}

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

  const nameRecord = Object.fromEntries(
    Object.entries(detail['název'] ?? {}).map(([lang, val]) => {
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
    type: detail.typ?.includes('Typ subjektu práva')
      ? 'Subjekt'
      : detail.typ?.includes('Typ objektu práva')
        ? 'Objekt'
        : undefined,
    nameModel: {
      name:
        toMultiLang(nameRecord).length > 0
          ? toMultiLang(nameRecord)
          : [{ languageTag: 'cs', name: '' }],
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
    isPublic: detail.typ?.includes('Veřejný údaj')
      ? true
      : detail.typ?.includes('Neveřejný údaj')
        ? false
        : undefined,
    privacyProvisions: detail['ustanovení-dokládající-neveřejnost-údaje'] ?? [],
    codeListIri:
      detail['instance-definovány-číselníkem'] &&
      detail['instance-definovány-číselníkem'].iri,
    codeListDataset:
      detail['instance-definovány-číselníkem'] &&
      detail['instance-definovány-číselníkem']['datová-sada-v-nkod'],
  };
}

export const ConceptEditWrapper = ({ slug }: { slug: string }) => {
  const { data, isLoading } = useGetConceptDetail(slug);
  const { mutate: editConcept, isPending, isPaused } = useEditConcept();
  const tNav = useTranslations('ConceptDetail.Main.ControlPanel');
  const t = useTranslations('ConceptEditWrapper');
  const router = useRouter();
  const submitForm = useSubmitForm();
  const queryInvalidate = useQueryInvalidator();

  const conceptMetadata = data?.data?.conceptMetadata;
  const conceptDetail = data?.data?.conceptDetail;
  const graphName = conceptMetadata?.graphName ?? '';
  const storageKey = draftKeys.conceptEdit(slug);

  const defaultValues =
    conceptDetail && graphName
      ? mapDetailToFormValues(conceptDetail, graphName)
      : undefined;

  const handleSubmit = (formData: ConceptFormValues) => {
    if (conceptMetadata?.id === undefined) return;
    const originalLanguageTags = {
      name: Object.keys(conceptDetail?.['název'] ?? {}),
      altName: Object.keys(conceptDetail?.['alternativní-název'] ?? {}),
      definition: Object.keys(conceptDetail?.['definice'] ?? {}),
      description: Object.keys(conceptDetail?.['popis'] ?? {}),
    };

    submitForm({
      mutate: editConcept,
      variables: {
        conceptId: conceptMetadata.id,
        data: normalizeFormData(formData, originalLanguageTags),
      },
      onSuccess: (response) => {
        const ontologySlug = response.data?.ontologySlug || graphName;
        queryInvalidate.invalidateConcept(
          decodeURIComponent(response.data?.slug || ''),
        );
        queryInvalidate.invalidateOntology(ontologySlug);
        queryInvalidate.invalidateDiagram(ontologySlug);
        router.push(`/concept/${response.data?.slug}`);
      },
      draftKey: storageKey,
    });
  };

  return (
    <div className="w-full max-w-250 mx-auto flex flex-col gap-5 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => router.back()}
          className="flex gap-1 text-blue-primary font-bold items-center text-sm"
        >
          <GovIcon name="chevron-compact-left" size="s" color="primary" />
          {tNav('Back')}
        </button>

        <span className="font-medium text-md">{t('EditConcept')}</span>

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
          isPending={isPending && !isPaused}
          defaultValues={defaultValues}
          editing={true}
          storageKey={storageKey}
          conceptIri={data?.data?.conceptDetail?.iri}
          slug={slug}
        />
      )}
    </div>
  );
};
