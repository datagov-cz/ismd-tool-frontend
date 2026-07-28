import Dexie, { type EntityTable } from 'dexie';

interface UploadFromFileDraft {
  id?: number;
  file: Blob | undefined;
  createdAt: Date;
}

const db = new Dexie('ISMDOfflineDB') as Dexie & {
  uploadFileDrafts: EntityTable<UploadFromFileDraft, 'id'>;
};

db.version(1).stores({
  ontologyDrafts: '++id, namespace, createdAt',
  conceptDrafts: '++id, ontologyNamespace, conceptType, createdAt',
  uploadFileDrafts: '++id, file, createdAt',
});

// v2: ontology/concept offline queues replaced by TanStack paused mutations
// (see src/lib/offlineMutationDefaults.ts). null deletes the object stores.
db.version(2).stores({
  ontologyDrafts: null,
  conceptDrafts: null,
});

export { db };
export type { UploadFromFileDraft };
