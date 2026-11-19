import {
  getClassSuggestions,
  getPropertySuggestions,
  getRelationshipSuggestions,
  startClassSuggestions,
  startPropertySuggestions,
  startRelationshipSuggestions,
} from '@/api/generated';
import {
  type ConceptSuggestionJob,
  type ConceptSuggestionKind,
  type ConceptSuggestionRequest,
  fromAttributeSuggestion,
  fromClassSuggestion,
  fromRelationshipSuggestion,
  isNamed,
} from '@/lib/conceptSuggestion/types';

type JobParams = { jobIds: string[] };

export const startConceptSuggestionJob = (
  request: ConceptSuggestionRequest,
) => {
  const { iri, year, number, date } = request.legalAct;
  const base = {
    structuralElementIds: [iri],
    knownConceptualModelSlugs: request.knownSlugs,
  };
  if (request.kind === 'TRIDA') {
    return startClassSuggestions(year, number, date, base);
  }
  const start =
    request.kind === 'VLASTNOST'
      ? startPropertySuggestions
      : startRelationshipSuggestions;
  return start(year, number, date, {
    ...base,
    selectedClassId: request.domainIri,
  });
};

const readJobs: Record<
  ConceptSuggestionKind,
  (_params: JobParams) => Promise<ConceptSuggestionJob[]>
> = {
  TRIDA: async (params) =>
    (await getClassSuggestions(params)).map((job) => ({
      jobId: job.jobId,
      status: job.status,
      suggestions: job.newSuggestions.map(fromClassSuggestion),
    })),
  VLASTNOST: async (params) =>
    (await getPropertySuggestions(params)).map((job) => ({
      jobId: job.jobId,
      status: job.status,
      suggestions: job.newAttributeSuggestions.map(fromAttributeSuggestion),
    })),
  VZTAH: async (params) =>
    (await getRelationshipSuggestions(params)).map((job) => ({
      jobId: job.jobId,
      status: job.status,
      suggestions: job.newRelationshipSuggestions.map(
        fromRelationshipSuggestion,
      ),
    })),
};

export const fetchConceptSuggestionJob = async (
  kind: ConceptSuggestionKind,
  jobId: string,
): Promise<ConceptSuggestionJob | null> => {
  const jobs = await readJobs[kind]({ jobIds: [jobId] });
  const job = jobs.find((item) => item.jobId === jobId);
  return job ? { ...job, suggestions: job.suggestions.filter(isNamed) } : null;
};
