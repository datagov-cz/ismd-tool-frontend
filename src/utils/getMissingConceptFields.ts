import { ConceptDetailModel } from '@/api/generated';

export type ConceptType = 'TRIDA' | 'VLASTNOST' | 'VZTAH' | undefined;

export interface FieldConfig {
  key: keyof ConceptDetailModel;
  labelKey: string;
  types?: ConceptType[];
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
      },
      {
        key: 'nadřazená-vlastnost',
        labelKey: 'Sections.SupersededProperty',
        types: ['VLASTNOST'],
      },
      {
        key: 'nadřazený-vztah',
        labelKey: 'Sections.SupersededRelation',
        types: ['VZTAH'],
      },
      {
        key: 'definiční-obor',
        labelKey: 'Sections.DefinicniObor',
        types: ['VLASTNOST', 'VZTAH', undefined],
      },
      {
        key: 'obor-hodnot',
        labelKey: 'Sections.Range',
        types: ['VLASTNOST', 'VZTAH', undefined],
      },
      {
        key: 'conceptProperties',
        labelKey: 'Sections.Properties',
        types: ['TRIDA'],
      },
      {
        key: 'conceptRelationships',
        labelKey: 'Sections.Relations',
        types: ['TRIDA'],
      },
    ],
  },
  {
    groupLabelKey: 'Groups.Naming',
    fields: [
      { key: 'alternativní-název', labelKey: 'Sections.AlternativeName' },
      { key: 'definice', labelKey: 'Sections.Definition' },
      { key: 'popis', labelKey: 'Sections.Description' },
    ],
  },
  {
    groupLabelKey: 'Groups.ConceptMeaning',
    fields: [
      { key: 'ekvivalentní-pojem', labelKey: 'Sections.EquivalentConcept' },
    ],
  },
  {
    groupLabelKey: 'Groups.ConceptSources',
    fields: [
      {
        key: 'definující-ustanovení-právního-předpisu-resolved',
        labelKey: 'Sections.Resource',
      },
      {
        key: 'související-ustanovení-právního-předpisu-resolved',
        labelKey: 'Sections.RelatedResources',
      },
      {
        key: 'definující-nelegislativní-zdroj',
        labelKey: 'Sections.NonLegalResources',
      },
      {
        key: 'související-nelegislativní-zdroj',
        labelKey: 'Sections.RelatedNonLegalResources',
      },
    ],
  },
  {
    groupLabelKey: 'Groups.AgendaAndInfoSystems',
    fields: [
      { key: 'agenda-resolved', labelKey: 'Sections.Agenda' },
      {
        key: 'agendový-informační-systém-resolved',
        labelKey: 'Sections.AgendaInfoSystem',
      },
      { key: 'typ-obsahu-údaje', labelKey: 'Sections.DataContentType' },
      { key: 'způsob-získání-údaje', labelKey: 'Sections.WayObtainingData' },
      { key: 'způsob-sdílení-údaje', labelKey: 'Sections.WaySharingData' },
    ],
  },
  {
    groupLabelKey: 'Groups.PublicityAndPublication',
    fields: [
      {
        key: 'ustanovení-dokládající-neveřejnost-údaje',
        labelKey: 'Sections.ProvingNonPublicData',
      },
      { key: 'je-ppdf', labelKey: 'Sections.IsPpdf' },
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
