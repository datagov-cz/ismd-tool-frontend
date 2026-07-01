import { ConceptDetailModel } from '@/api/generated';

export type ConceptType = 'TRIDA' | 'VLASTNOST' | 'VZTAH' | undefined;

export interface FieldConfig {
  key: keyof ConceptDetailModel;
  labelKey: string;
  types?: ConceptType[];
  anchor: string;
}

export interface FieldGroup {
  groupLabelKey: string;
  fields: FieldConfig[];
}

export const FIELD_GROUPS: FieldGroup[] = [
  {
    groupLabelKey: 'Groups.TypesAndClassification',
    fields: [
      {
        key: 'nadřazená-třída',
        labelKey: 'Sections.SupersededClass',
        types: ['TRIDA'],
        anchor: '#broaderConcept',
      },
      {
        key: 'nadřazená-vlastnost',
        labelKey: 'Sections.SupersededProperty',
        types: ['VLASTNOST'],
        anchor: '#superProperty',
      },
      {
        key: 'nadřazený-vztah',
        labelKey: 'Sections.SupersededRelation',
        types: ['VZTAH'],
        anchor: '#superRelation',
      },
      {
        key: 'definiční-obor',
        labelKey: 'Sections.DefinicniObor',
        types: ['VLASTNOST', 'VZTAH', undefined],
        anchor: '#domain',
      },
      {
        key: 'obor-hodnot',
        labelKey: 'Sections.Range',
        types: ['VLASTNOST', 'VZTAH', undefined],
        anchor: '#range',
      },
    ],
  },
  {
    groupLabelKey: 'Groups.Naming',
    fields: [
      {
        key: 'alternativní-název',
        labelKey: 'Sections.AlternativeName',
        anchor: '#altName',
      },
      {
        key: 'definice',
        labelKey: 'Sections.Definition',
        anchor: '#definition',
      },
      {
        key: 'popis',
        labelKey: 'Sections.Description',
        anchor: '#description',
      },
    ],
  },
  {
    groupLabelKey: 'Groups.ConceptMeaning',
    fields: [
      {
        key: 'ekvivalentní-pojem',
        labelKey: 'Sections.EquivalentConcept',
        anchor: '#exactMatch',
      },
    ],
  },
  {
    groupLabelKey: 'Groups.ConceptSources',
    fields: [
      {
        key: 'definující-ustanovení-právního-předpisu-resolved',
        labelKey: 'Sections.Resource',
        anchor: '#sources',
      },
      {
        key: 'související-ustanovení-právního-předpisu-resolved',
        labelKey: 'Sections.RelatedResources',
        anchor: '#sources',
      },
      {
        key: 'definující-nelegislativní-zdroj',
        labelKey: 'Sections.NonLegalResources',
        anchor: '#definingNonLegalSource',
      },
      {
        key: 'související-nelegislativní-zdroj',
        labelKey: 'Sections.RelatedNonLegalResources',
        anchor: '#relatedNonLegalSource',
      },
    ],
  },
  {
    groupLabelKey: 'Groups.AgendaAndInfoSystems',
    fields: [
      {
        key: 'agenda-resolved',
        labelKey: 'Sections.Agenda',
        anchor: '#agendaCode',
      },
      {
        key: 'agendový-informační-systém-resolved',
        labelKey: 'Sections.AgendaInfoSystem',
        anchor: '#agendaSystemCode',
      },
      {
        key: 'typ-obsahu-údaje',
        labelKey: 'Sections.DataContentType',
        anchor: '#contentType',
      },
      {
        key: 'způsob-získání-údaje',
        labelKey: 'Sections.WayObtainingData',
        anchor: '#acquisitionMethod',
      },
      {
        key: 'způsob-sdílení-údaje',
        labelKey: 'Sections.WaySharingData',
        anchor: '#sharingMethod',
      },
    ],
  },
  {
    groupLabelKey: 'Groups.PublicityAndPublication',
    fields: [
      {
        key: 'ustanovení-dokládající-neveřejnost-údaje',
        labelKey: 'Sections.ProvingNonPublicData',
        anchor: '#privacyProvisions',
      },
      { key: 'je-ppdf', labelKey: 'Sections.IsPpdf', anchor: '#isInPPDF' },
    ],
  },
];

export const FIELD_CONFIGS: FieldConfig[] = FIELD_GROUPS.flatMap(
  (g) => g.fields,
);

const isEmpty = (value: unknown): boolean => {
  if (value === undefined || value === null) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

export const getMissingConceptFieldGroups = (
  conceptDetail: ConceptDetailModel,
  conceptType: ConceptType,
): FieldGroup[] =>
  FIELD_GROUPS.reduce<FieldGroup[]>((acc, group) => {
    const missingFields = group.fields.filter((config) => {
      if (config.types && !config.types.includes(conceptType)) return false;
      return isEmpty(conceptDetail[config.key]);
    });
    if (missingFields.length > 0) {
      acc.push({ ...group, fields: missingFields });
    }
    return acc;
  }, []);

export const getMissingConceptFieldKeys = (
  conceptDetail: ConceptDetailModel,
  conceptType: ConceptType,
): Set<keyof ConceptDetailModel> =>
  new Set(
    getMissingConceptFieldGroups(conceptDetail, conceptType).flatMap((g) =>
      g.fields.map((f) => f.key),
    ),
  );
