import Dexie, { type EntityTable } from 'dexie';

interface OntologyDraft {
  id?: number;
  namespace: string;
  name: string;
  description: string;
  languageTag: string;
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

const db = new Dexie('ISMDOfflineDB') as Dexie & {
  ontologyDrafts: EntityTable<OntologyDraft, 'id'>;
  conceptDrafts: EntityTable<ConceptDraft, 'id'>;
};

db.version(1).stores({
  ontologyDrafts: '++id, namespace, createdAt',
  conceptDrafts: '++id, ontologyNamespace, conceptType, createdAt',
});

export type { OntologyDraft, ConceptDraft };
export { db };
