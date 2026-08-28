import { z } from 'zod';

import { LegalSourceListSchema } from './legalSourceSchema';
import {
  AgendaRef,
  CodeListDatasetSchema,
  CodeListIriSchema,
  ConceptRef,
  DigitalObject,
  MultiLanguageModelSchema,
  RequiredNameModelSchema,
} from './sharedConceptSchemas';

export const ConceptCreateModelSchema = z.object({
  ontologyGraphName: z.string().min(1),
  conceptType: z.string().min(1),
  namespace: z.string().optional(),
  nameModel: z.object({ name: RequiredNameModelSchema }),
  identifier: z.string().optional(),
  altNameModel: z.object({ altName: MultiLanguageModelSchema }).optional(),
  definitionModel: z
    .object({ definition: MultiLanguageModelSchema })
    .optional(),
  descriptionModel: z
    .object({ description: MultiLanguageModelSchema })
    .optional(),
  definingNonLegalSource: z.array(DigitalObject).optional(),
  definingLegalSource: LegalSourceListSchema,
  relatedNonLegalSource: z.array(DigitalObject).optional(),
  relatedLegalSource: LegalSourceListSchema,
  exactMatch: z.array(ConceptRef).optional(),
  inTezaurus: z.boolean().optional(),
});

export const ClassConceptModelSchema = ConceptCreateModelSchema.extend({
  conceptTypeEnum: z.literal('TRIDA'),
  type: z.string().optional(),
  agendaCode: AgendaRef.optional(),
  agendaSystemCode: AgendaRef.optional(),
  contentType: z.string().optional(),
  acquisitionMethod: z.string().optional(),
  sharingMethod: z.array(z.string()).optional(),
  isInPPDF: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  privacyProvisions: LegalSourceListSchema,
  broaderConcept: z.array(ConceptRef).optional(),
  codeListDataset: CodeListDatasetSchema,
  codeListIri: CodeListIriSchema,
});

export const PropertyConceptModelSchema = ConceptCreateModelSchema.extend({
  conceptTypeEnum: z.literal('VLASTNOST'),
  dataType: z
    .object({ code: z.string().optional(), label: z.string().optional() })
    .optional(),
  domain: ConceptRef.optional(),
  superProperty: z.array(ConceptRef).optional(),
  isInPPDF: z.boolean().optional(),
  agendaCode: AgendaRef.optional(),
  agendaSystemCode: AgendaRef.optional(),
  isPublic: z.boolean().optional(),
  privacyProvisions: LegalSourceListSchema,
  sharingMethod: z.array(z.string()).optional(),
  acquisitionMethod: z.string().optional(),
  contentType: z.string().optional(),
  codeListDataset: z.string().optional(),
});

export const RelationshipConceptModelSchema = ConceptCreateModelSchema.extend({
  conceptTypeEnum: z.literal('VZTAH'),
  domain: z.string().optional(),
  range: ConceptRef.optional(),
  superRelation: z.array(ConceptRef).optional(),
  agendaCode: AgendaRef.optional(),
  agendaSystemCode: AgendaRef.optional(),
  contentType: z.string().optional(),
  acquisitionMethod: z.string().optional(),
  sharingMethod: z.array(z.string()).optional(),
  isInPPDF: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  privacyProvisions: LegalSourceListSchema,
  codeListDataset: z.string().optional(),
});

export const CreateConceptBodySchema = z.discriminatedUnion('conceptTypeEnum', [
  ClassConceptModelSchema,
  PropertyConceptModelSchema,
  RelationshipConceptModelSchema,
]);
