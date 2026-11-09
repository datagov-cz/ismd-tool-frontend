import type {
  AiDraftAttributeDto,
  AiDraftClassDto,
  AiDraftRelationshipDto,
  AiVocabularyExpansionRequestDtoKind,
} from '@/api/generated';

type DraftBase = {
  ref: string;
  originJobId: string;
};

export type DraftClass = DraftBase & { kind: 'class'; data: AiDraftClassDto };

export type DraftAttribute = DraftBase & {
  kind: 'attribute';
  data: AiDraftAttributeDto;
};

export type DraftRelationship = DraftBase & {
  kind: 'relationship';
  data: AiDraftRelationshipDto;
};

export type DraftItem = DraftClass | DraftAttribute | DraftRelationship;

export type LegalActRef = {
  iri: string;
  year: number;
  number: number;
  date: string;
};

export const INITIAL_GENERATION_COUNTS = {
  classCount: 5,
  propertiesPerClass: 3,
  relationshipsPerClass: 3,
} as const;

export type JobOp =
  | { op: 'initial' }
  | {
      op: 'expand';
      kind: AiVocabularyExpansionRequestDtoKind;
      selectedClassId?: string;
    }
  | { op: 'regenerate'; targetRef: string };

export type ActiveJob = JobOp & { jobId: string | null; startedAt: number };

export type FeedbackVote = 'like' | 'dislike';

export const isClass = (item: DraftItem): item is DraftClass =>
  item.kind === 'class';

export const isAttribute = (item: DraftItem): item is DraftAttribute =>
  item.kind === 'attribute';

export const isRelationship = (item: DraftItem): item is DraftRelationship =>
  item.kind === 'relationship';
