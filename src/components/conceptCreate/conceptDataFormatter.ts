import {
  ConceptDetailModelAlternativníNázev,
  ConceptDetailModelDefinice,
  ConceptDetailModelPopis,
  GetConceptDto,
} from '@/api/generated';

import { CreateConceptFormData } from './createConceptSchema';
import { getBaseUrl } from './utils/getBaseUrl';
type PartialConcept = Partial<CreateConceptFormData>;

export const conceptDataFormatter = (data: GetConceptDto): PartialConcept => {
  const { conceptDetail: detail, conceptMetadata: meta } = data;

  if (detail && meta) {
    return {
      conceptTypeEnum: meta.conceptType,
      conceptType: meta.conceptType,
      ontologyGraphName: meta.graphName || '',
      namespace: getBaseUrl(meta.graphName || ''),
      altNameModel: detail['alternativní-název']
        ? formatLanguageData(detail['alternativní-název'])
        : [{ languageTag: 'cs', name: '' }],
      descriptionModel: detail.popis
        ? formatLanguageData(detail.popis)
        : [{ languageTag: 'cs', name: '' }],
      definitionModel: detail.definice
        ? formatLanguageData(detail.definice)
        : [{ languageTag: 'cs', name: '' }],
      nameModel: { name: detail.název?.cs || '', languageTag: 'cs' },
      definingLegalSource: detail[
        'definující-ustanovení-právního-předpisu'
      ]?.map((item) => ({
        value: item,
      })),
      relatedLegalSource: detail[
        'související-ustanovení-právního-předpisu'
      ]?.map((item) => ({
        value: item,
      })),
      definingNonLegalSource: detail['definující-nelegislativní-zdroj']?.map(
        (item) => ({
          value:
            typeof item === 'string'
              ? item
              : 'url' in item && typeof item.url === 'string'
                ? item.url
                : 'název' in item && typeof item.název === 'string'
                  ? item.název
                  : '',
        }),
      ),
      relatedNonLegalSource: detail['související-nelegislativní-zdroj']?.map(
        (item) => ({
          value:
            typeof item === 'string'
              ? item
              : 'url' in item && typeof item.url === 'string'
                ? item.url
                : 'název' in item && typeof item.název === 'string'
                  ? item.název
                  : '',
        }),
      ),
      sharingMethod: detail['způsob-sdílení-údaje']?.map((item) => ({
        value: formatSharingMethodsFormate(item),
      })),
      acquisitionMethod: formatSharingMethodsFormate(
        detail['způsob-získání-údaje'],
      ),
      contentType: formatSharingMethodsFormate(detail['typ-obsahu-údaje']),
      isInPPDF: detail['je-ppdf'],
      isPublic: detail['typ']?.includes('Veřejný údaj'),
      agendaSystemCode: detail['agendový-informační-systém'],
      agendaCode: detail.agenda,
      privacyProvision: detail['ustanovení-neveřejnost'],
      broaderConcept: formatRelatedConcepts(detail['nadřazená-třída']),
      domain: detail['definiční-obor'],
      range: detail['obor-hodnot'],
      type: detail.typ?.includes('Typ objektu práva')
        ? 'Typ objektu práva'
        : detail.typ?.includes('Typ subjektu práva')
          ? 'Typ subjektu práva'
          : '',
      superProperty: formatRelatedConcepts(detail['nadřazená-vlastnost']),
      superRelation: formatRelatedConcepts(detail['nadřazený-vztah']),
      exactMatch: detail['ekvivalentní-pojem']?.map((item) =>
        'id' in item && item.id !== null
          ? {
              value: item.id,
            }
          : {},
      ),
    };
  }

  return {};
};

export const formatRelatedConcepts = (data: string[] | undefined) => {
  return data && data?.length > 0
    ? data
        .filter(
          (item) => item !== 'http://www.w3.org/2000/01/rdf-schema#Resource',
        )
        .map((item) => ({
          value: item,
        }))
    : [{ value: '' }];
};

export const formatSharingMethodsFormate = (item?: string) => {
  if (!item) return;
  const lastPart = item.split('/položky/')[1].replace(/-/g, ' ');
  return lastPart;
};

export const formatLanguageData = (
  data:
    | ConceptDetailModelAlternativníNázev
    | ConceptDetailModelPopis
    | ConceptDetailModelDefinice,
): CreateConceptFormData[
  | 'altNameModel'
  | 'definitionModel'
  | 'descriptionModel'] => {
  return Object.entries(data).map(([languageTag, obj]) => {
    return {
      languageTag,
      name: obj,
    };
  });
};
