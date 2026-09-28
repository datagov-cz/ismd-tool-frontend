import type {
  AiAttributeSuggestionDto,
  AiClassSuggestionDto,
  AiClassSuggestionDtoType,
  AiRelationshipSuggestionDto,
} from '@/api/generated';

export type ConceptSuggestionKind = 'TRIDA' | 'VLASTNOST' | 'VZTAH';

export type ConceptSuggestion = {
  suggestionId: string;
  name?: string;
  definition?: string;
  explanation?: string;
  classType?: AiClassSuggestionDtoType;
  targetIri?: string;
};

export type ConceptSuggestionJobStatus = 'in_progress' | 'completed' | 'failed';

export type ConceptSuggestionJobResult = {
  status: ConceptSuggestionJobStatus;
  suggestions: ConceptSuggestion[];
};

const csText = (value?: Record<string, string>) =>
  value?.cs?.trim() || undefined;

export const fromClassSuggestion = (
  suggestion: AiClassSuggestionDto,
): ConceptSuggestion => ({
  suggestionId: suggestion.suggestionId,
  name: csText(suggestion.name),
  definition: csText(suggestion.definition),
  explanation: csText(suggestion.explanation),
  classType: suggestion.type,
});

export const fromAttributeSuggestion = (
  suggestion: AiAttributeSuggestionDto,
): ConceptSuggestion => ({
  suggestionId: suggestion.suggestionId,
  name: csText(suggestion.name),
  definition: csText(suggestion.definition),
  explanation: csText(suggestion.explanation),
});

export const fromRelationshipSuggestion = (
  suggestion: AiRelationshipSuggestionDto,
): ConceptSuggestion => ({
  suggestionId: suggestion.suggestionId,
  name: csText(suggestion.name),
  definition: csText(suggestion.definition),
  explanation: csText(suggestion.explanation),
  targetIri: suggestion.targetClass?.id,
});
