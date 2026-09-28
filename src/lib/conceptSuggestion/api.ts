import {
  getClassSuggestions,
  getPropertySuggestions,
  getRelationshipSuggestions,
  startClassSuggestions,
  startPropertySuggestions,
  startRelationshipSuggestions,
} from '@/api/generated';
import {
  type ConceptSuggestionJobResult,
  type ConceptSuggestionKind,
  fromAttributeSuggestion,
  fromClassSuggestion,
  fromRelationshipSuggestion,
} from '@/lib/conceptSuggestion/types';
import type { LegalActRef } from '@/lib/vocabularyDraft/types';

export const startConceptSuggestionJob = (
  kind: ConceptSuggestionKind,
  { iri, year, number, date }: LegalActRef,
  knownSlugs: string[],
  domainIri?: string,
) => {
  const base = {
    structuralElementIds: [iri],
    knownConceptualModelSlugs: knownSlugs,
  };
  if (kind === 'TRIDA') {
    return startClassSuggestions(year, number, date, base);
  }
  const body = { ...base, selectedClassId: domainIri ?? '' };
  if (kind === 'VLASTNOST') {
    return startPropertySuggestions(year, number, date, body);
  }
  return startRelationshipSuggestions(year, number, date, body);
};

export const fetchConceptSuggestionJob = async (
  kind: ConceptSuggestionKind,
  jobId: string,
): Promise<ConceptSuggestionJobResult | null> => {
  const params = { jobIds: [jobId] };
  if (kind === 'TRIDA') {
    const [job] = await getClassSuggestions(params);
    return job
      ? {
          status: job.status,
          suggestions: job.newSuggestions.map(fromClassSuggestion),
        }
      : null;
  }
  if (kind === 'VLASTNOST') {
    const [job] = await getPropertySuggestions(params);
    return job
      ? {
          status: job.status,
          suggestions: job.newAttributeSuggestions.map(fromAttributeSuggestion),
        }
      : null;
  }
  const [job] = await getRelationshipSuggestions(params);
  return job
    ? {
        status: job.status,
        suggestions: job.newRelationshipSuggestions.map(
          fromRelationshipSuggestion,
        ),
      }
    : null;
};
