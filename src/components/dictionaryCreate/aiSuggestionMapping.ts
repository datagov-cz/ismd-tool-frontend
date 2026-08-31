import {
  type AiClassSuggestionDto,
  AiClassSuggestionDtoType,
  type ClassConceptModel,
  ConceptCreateModelConceptTypeEnum,
  type PropertyConceptModel,
  type RelationshipConceptModel,
} from '@/api/generated';
import { type SuggestionItem } from '@/components/dictionaryCreate/DictionarySuggestionCard';
import { type AiSuggestedClass } from '@/components/dictionaryCreate/useAiDictionarySuggestions';

const DEFAULT_LANGUAGE = 'cs';

const CLASS_TYPE_BY_SUGGESTION_TYPE: Record<string, string> = {
  [AiClassSuggestionDtoType.SUBJECT]: 'Subjekt',
  [AiClassSuggestionDtoType.OBJECT]: 'Objekt',
  [AiClassSuggestionDtoType.CLASS]: '',
};

export type PendingClassConcept = {
  suggestionId: string;
  body: ClassConceptModel;
};

export type PendingPropertyConcept = {
  suggestionId: string;
  domainSuggestionId: string;
  body: PropertyConceptModel;
};

export type PendingRelationshipConcept = {
  suggestionId: string;
  domainSuggestionId: string;
  rangeSuggestionId: string;
  body: RelationshipConceptModel;
};

export type PendingConcepts = {
  classes: PendingClassConcept[];
  properties: PendingPropertyConcept[];
  relationships: PendingRelationshipConcept[];
};

export type ConceptBaseInput = {
  ontologyGraphName: string;
  namespace?: string;
  definingLegalSource: string | null;
};

const localized = (value?: Record<string, string>) =>
  value?.[DEFAULT_LANGUAGE] ?? Object.values(value ?? {})[0] ?? '';

const toSuggestionItem = (
  suggestion: {
    suggestionId: string;
    name: Record<string, string>;
    definition: Record<string, string>;
  },
  disabled?: boolean,
): SuggestionItem => ({
  key: suggestion.suggestionId,
  label: localized(suggestion.name),
  description: localized(suggestion.definition),
  disabled,
});

export const isRelationshipResolvable = (
  relationship: { sourceClass: { id: string }; targetClass: { id: string } },
  classSuggestionIds: Set<string>,
) =>
  classSuggestionIds.has(relationship.sourceClass.id) &&
  classSuggestionIds.has(relationship.targetClass.id);

export const toCardProps = (
  item: AiSuggestedClass,
  classSuggestionIds: Set<string>,
) => ({
  key: item.suggestion.suggestionId,
  label: localized(item.suggestion.name),
  description: localized(item.suggestion.definition),
  properties: item.attributes.map((attribute) => toSuggestionItem(attribute)),
  relations: item.relationships.map((relationship) =>
    toSuggestionItem(
      relationship,
      !isRelationshipResolvable(relationship, classSuggestionIds),
    ),
  ),
});

export const collectSelectableKeys = (
  classes: AiSuggestedClass[],
  classSuggestionIds: Set<string>,
) =>
  classes.flatMap((item) => [
    item.suggestion.suggestionId,
    ...item.attributes.map((attribute) => attribute.suggestionId),
    ...item.relationships
      .filter((relationship) =>
        isRelationshipResolvable(relationship, classSuggestionIds),
      )
      .map((relationship) => relationship.suggestionId),
  ]);

export const findParentClassId = (
  classes: AiSuggestedClass[],
  childSuggestionId: string,
) =>
  classes.find(
    (item) =>
      item.attributes.some(
        (attribute) => attribute.suggestionId === childSuggestionId,
      ) ||
      item.relationships.some(
        (relationship) => relationship.suggestionId === childSuggestionId,
      ),
  )?.suggestion.suggestionId ?? null;

const toClassBody = (
  suggestion: AiClassSuggestionDto,
  base: ConceptBaseInput,
): ClassConceptModel => ({
  ontologyGraphName: base.ontologyGraphName,
  namespace: base.namespace,
  conceptType: ConceptCreateModelConceptTypeEnum.TRIDA,
  conceptTypeEnum: ConceptCreateModelConceptTypeEnum.TRIDA,
  nameModel: { name: suggestion.name },
  definitionModel: { definition: suggestion.definition },
  type: CLASS_TYPE_BY_SUGGESTION_TYPE[suggestion.type] ?? '',
  definingLegalSource: base.definingLegalSource
    ? [base.definingLegalSource]
    : undefined,
});

export const toPendingConcepts = (
  classes: AiSuggestedClass[],
  selectedIds: string[],
  base: ConceptBaseInput,
): PendingConcepts => {
  const selected = new Set(selectedIds);
  const selectedClasses = classes.filter((item) =>
    selected.has(item.suggestion.suggestionId),
  );
  const selectedClassIds = new Set(
    selectedClasses.map((item) => item.suggestion.suggestionId),
  );

  return {
    classes: selectedClasses.map((item) => ({
      suggestionId: item.suggestion.suggestionId,
      body: toClassBody(item.suggestion, base),
    })),
    properties: selectedClasses.flatMap((item) =>
      item.attributes
        .filter((attribute) => selected.has(attribute.suggestionId))
        .map((attribute) => ({
          suggestionId: attribute.suggestionId,
          domainSuggestionId: item.suggestion.suggestionId,
          body: {
            ontologyGraphName: base.ontologyGraphName,
            namespace: base.namespace,
            conceptType: ConceptCreateModelConceptTypeEnum.VLASTNOST,
            conceptTypeEnum: ConceptCreateModelConceptTypeEnum.VLASTNOST,
            nameModel: { name: attribute.name },
            definitionModel: { definition: attribute.definition },
            definingLegalSource: base.definingLegalSource
              ? [base.definingLegalSource]
              : undefined,
          } satisfies PropertyConceptModel,
        })),
    ),
    relationships: selectedClasses.flatMap((item) =>
      item.relationships
        .filter(
          (relationship) =>
            selected.has(relationship.suggestionId) &&
            isRelationshipResolvable(relationship, selectedClassIds),
        )
        .map((relationship) => ({
          suggestionId: relationship.suggestionId,
          domainSuggestionId: relationship.sourceClass.id,
          rangeSuggestionId: relationship.targetClass.id,
          body: {
            ontologyGraphName: base.ontologyGraphName,
            namespace: base.namespace,
            conceptType: ConceptCreateModelConceptTypeEnum.VZTAH,
            conceptTypeEnum: ConceptCreateModelConceptTypeEnum.VZTAH,
            nameModel: { name: relationship.name },
            definitionModel: { definition: relationship.definition },
            definingLegalSource: base.definingLegalSource
              ? [base.definingLegalSource]
              : undefined,
          } satisfies RelationshipConceptModel,
        })),
    ),
  };
};

export const groupSuggestionIdsByJob = (
  suggestionIds: string[],
  jobIdBySuggestionId: Record<string, string>,
) => {
  const grouped = new Map<string, string[]>();

  suggestionIds.forEach((suggestionId) => {
    const jobId = jobIdBySuggestionId[suggestionId];

    if (!jobId) {
      return;
    }

    grouped.set(jobId, [...(grouped.get(jobId) ?? []), suggestionId]);
  });

  return [...grouped.entries()].map(([jobId, ids]) => ({
    jobId,
    suggestionIds: ids,
  }));
};

export type AiSuggestionSelection = {
  classes: AiSuggestedClass[];
  selectedIds: string[];
  definingLegalSource: string | null;
};
