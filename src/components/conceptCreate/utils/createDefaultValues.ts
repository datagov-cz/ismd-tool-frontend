import { ConceptEditModelConceptTypeEnum } from '@/api/generated';
import { CreateConceptFormData } from '../createConceptSchema';

import { getBaseUrl } from './getBaseUrl';

export const createDefaultValues = (
  namespace: string,
  conceptType: ConceptEditModelConceptTypeEnum,
): CreateConceptFormData => ({
  conceptTypeEnum: conceptType,
  conceptType: conceptType,
  ontologyGraphName: namespace,
  namespace: getBaseUrl(namespace),
  altNameModel: [{ name: '', languageTag: 'cs' }],
  descriptionModel: [{ name: '', languageTag: 'cs' }],
  definitionModel: [{ name: '', languageTag: 'cs' }],
  nameModel: { name: '', languageTag: 'cs' },
  definingLegalSource: [{ value: '' }],
  definingNonLegalSource: [{ value: '' }],
  relatedLegalSource: [{ value: '' }],
  relatedNonLegalSource: [{ value: '' }],
  exactMatch: [{ value: '' }],
  domain: '',
  range: '',
  acquisitionMethod: '',
  contentType: '',
  sharingMethod: [{ value: '' }],
  type: '',
  broaderConcept: [{ value: '' }],
  superRelation: [{ value: '' }],
  superProperty: [{ value: '' }],
  dataType: '',
  privacyProvision: '',
});
