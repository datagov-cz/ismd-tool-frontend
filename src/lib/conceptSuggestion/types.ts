import type {
  AiAttributeSuggestionDto,
  AiClassSuggestionDto,
  AiClassSuggestionDtoType,
  AiClassSuggestionsJobResponseDtoStatus,
  AiRelationshipSuggestionDto,
} from '@/api/generated';
import type { LegalActRef } from '@/lib/vocabularyDraft/types';

export type ConceptSuggestionKind = 'TRIDA' | 'VLASTNOST' | 'VZTAH';

export type ConceptSuggestionRequest = {
  legalAct: LegalActRef;
  knownSlugs: string[];
} & ({ kind: 'TRIDA' } | { kind: 'VLASTNOST' | 'VZTAH'; domainIri: string });

export type ConceptSuggestion = {
  suggestionId: string;
  name: string;
  definition?: string;
  explanation?: string;
  classType?: AiClassSuggestionDtoType;
  targetIri?: string;
};

export type ConceptSuggestionJob = {
  jobId: string;
  status: AiClassSuggestionsJobResponseDtoStatus;
  suggestions: ConceptSuggestion[];
};

type SuggestionTexts = Pick<
  AiAttributeSuggestionDto,
  'suggestionId' | 'name' | 'definition' | 'explanation'
>;

const csText = (value?: Record<string, string>) =>
  value?.cs?.trim() || undefined;

export const fromAttributeSuggestion = ({
  suggestionId,
  name,
  definition,
  explanation,
}: SuggestionTexts): ConceptSuggestion => ({
  suggestionId,
  name: csText(name) ?? '',
  definition: csText(definition),
  explanation: csText(explanation),
});

export const fromClassSuggestion = (
  suggestion: AiClassSuggestionDto,
): ConceptSuggestion => ({
  ...fromAttributeSuggestion(suggestion),
  classType: suggestion.type,
});

export const fromRelationshipSuggestion = (
  suggestion: AiRelationshipSuggestionDto,
): ConceptSuggestion => ({
  ...fromAttributeSuggestion(suggestion),
  targetIri: suggestion.targetClass?.id,
});

export const isNamed = (suggestion: ConceptSuggestion) =>
  suggestion.name !== '';
