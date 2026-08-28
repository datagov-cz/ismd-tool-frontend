import { z } from 'zod';

import {
  ClassConceptModelSchema,
  ConceptCreateModelSchema,
  CreateConceptBodySchema,
  PropertyConceptModelSchema,
  RelationshipConceptModelSchema,
} from './conceptCreateSchemas';
import { LegalSourceListSchema } from './legalSourceSchema';
import {
  AgendaRef,
  CodeListDatasetSchema,
  CodeListIriSchema,
  ConceptRef,
} from './sharedConceptSchemas';

// Flat schema for form state (all type-specific fields optional)
const ConceptFormSchema = z.object({
  ...ConceptCreateModelSchema.shape,
  conceptTypeEnum: z.enum(['TRIDA', 'VLASTNOST', 'VZTAH']),
  // TRIDA
  type: z.string().optional(),
  broaderConcept: z.array(ConceptRef).optional(),
  // VLASTNOST
  dataType: z
    .object({
      code: z.string().optional(),
      label: z.string().optional(),
    })
    .optional(),
  superProperty: z.array(ConceptRef).optional(),
  // VZTAH
  range: ConceptRef.optional(),
  superRelation: z.array(ConceptRef).optional(),
  // shared type-specific
  agendaCode: AgendaRef.optional(),
  agendaSystemCode: AgendaRef.optional(),
  contentType: z.string().optional(),
  acquisitionMethod: z.string().optional(),
  sharingMethod: z.array(z.string()).optional(),
  isInPPDF: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  privacyProvisions: LegalSourceListSchema,
  domain: ConceptRef.optional(),
  codeListIri: CodeListIriSchema.optional(),
  codeListDataset: CodeListDatasetSchema.optional(),
});

export type ConceptCreateModel = z.infer<typeof ConceptCreateModelSchema>;
export type ClassConceptModel = z.infer<typeof ClassConceptModelSchema>;
export type PropertyConceptModel = z.infer<typeof PropertyConceptModelSchema>;
export type RelationshipConceptModel = z.infer<
  typeof RelationshipConceptModelSchema
>;
export type CreateConceptBody = z.infer<typeof CreateConceptBodySchema>;
export type ConceptForm = z.infer<typeof ConceptFormSchema>;

export {
  ClassConceptModelSchema,
  ConceptCreateModelSchema,
  ConceptFormSchema,
  CreateConceptBodySchema,
  PropertyConceptModelSchema,
  RelationshipConceptModelSchema,
};

export {
  AddPropertyModelSchema,
  AddRelationModelSchema,
} from '../../conceptDetail/AddPropertyRelation/addPropertyRelationSchema';
