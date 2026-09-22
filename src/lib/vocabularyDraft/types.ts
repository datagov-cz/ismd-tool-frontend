import type {
  AiDraftAttributeDto,
  AiDraftClassDto,
  AiDraftRelationshipDto,
  AiVocabularyExpansionRequestDtoKind,
} from '@/api/generated';

type DraftBase = {
  ref: string;
  originJobId: string;
  revision: number;
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

export type ActiveJob =
  | { jobId: string; op: 'initial'; startedAt: number }
  | {
      jobId: string;
      op: 'expand';
      kind: AiVocabularyExpansionRequestDtoKind;
      selectedClassId?: string;
      startedAt: number;
    }
  | {
      jobId: string;
      op: 'regenerate';
      targetRef: string;
      startRevision: number;
      startedAt: number;
    };

export type PendingJob = ActiveJob extends infer Job
  ? Job extends ActiveJob
    ? Omit<Job, 'jobId' | 'startedAt'>
    : never
  : never;

export type FeedbackVote = 'like' | 'dislike';

export const isClass = (item: DraftItem): item is DraftClass =>
  item.kind === 'class';

export const isAttribute = (item: DraftItem): item is DraftAttribute =>
  item.kind === 'attribute';

export const isRelationship = (item: DraftItem): item is DraftRelationship =>
  item.kind === 'relationship';
