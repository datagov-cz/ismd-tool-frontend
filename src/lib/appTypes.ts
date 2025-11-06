export type FileNode = {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
};

export type OntologyType = {
  namespace: string;
  nameModel: {
    languageTag: string;
    name: string;
  };
  descriptionModel: {
    languageTag: string;
    description: string;
  };
};

export type ConceptType = {
  conceptType: string;
  namespace: string;
  conceptName: string;
  identifier: string;
  altName: string;
  description: string;
  definition: string;
  definingNonLegalSource: string;
  definingLegalSource: string;
  relatedNonLegalSource: string;
  relatedLegalSource: string;
  exactMatch: string;
  inTezaurus: string;
  conceptTypeEnum: string;
  type: string;
  agendaCode: string;
  agendaSystemCode: string;
  contentType: string;
  acquisitionMethod: string;
  sharingMethod: string;
  privacyProvision: string;
  isPublic: string;
  broaderConcept: string;
};
