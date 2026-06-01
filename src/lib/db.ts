import Dexie, { type EntityTable } from 'dexie';

import { OntologyCreateModel } from '@/api/generated';

interface OntologyDraft {
  id?: number;
  namespace: string;
  payload: OntologyCreateModel;
  createdAt: Date;
  updatedAt: Date;
}

interface ConceptDraft {
  id?: number;
  ontologyNamespace: string;
  conceptType: string;
  nameModel: { name: string; languageTag: string };
  altNameModel?: Array<{ name?: string; languageTag?: string }>;
  descriptionModel?: Array<{ name?: string; languageTag?: string }>;
  definitionModel?: Array<{ name?: string; languageTag?: string }>;
  domain?: string;
  range?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UploadFromFileDraft {
  id?: number;
  file: Blob | undefined;
  createdAt: Date;
}

const db = new Dexie('ISMDOfflineDB') as Dexie & {
  ontologyDrafts: EntityTable<OntologyDraft, 'id'>;
  conceptDrafts: EntityTable<ConceptDraft, 'id'>;
  uploadFileDrafts: EntityTable<UploadFromFileDraft, 'id'>;
};

db.version(1).stores({
  ontologyDrafts: '++id, namespace, createdAt',
  conceptDrafts: '++id, ontologyNamespace, conceptType, createdAt',
  uploadFileDrafts: '++id, file, createdAt',
});

export { db };
export type { ConceptDraft, OntologyDraft, UploadFromFileDraft };
