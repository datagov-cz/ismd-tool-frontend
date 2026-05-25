import { z } from 'zod';

// Reusable base schemas
const NameModelSchema = z.object({
  name: z.record(z.string(), z.string().min(1, 'Název je povinný')),
});

const ConceptRef = z.object({ iri: z.string(), label: z.string() });
const AgendaRef = z.object({
  iri: z.string().optional(),
  nazev: z.string().optional(),
  code: z.string().optional(),
});

const MultiLangueModelSchema = z
  .array(
    z.object({
      languageTag: z.string(),
      name: z.string(),
    }),
  )
  .optional();

const DigitalObject = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  url: z.url().optional(),
});

// Shared base fields
const ConceptCreateModelSchema = z.object({
  ontologyGraphName: z.string().min(1),
  conceptType: z.string().min(1),
  namespace: z.string().optional(),
  nameModel: NameModelSchema,
  identifier: z.string().optional(),
  altNameModel: z
    .object({
      altName: MultiLangueModelSchema,
    })
    .optional(),
  definitionModel: z
    .object({
      definition: MultiLangueModelSchema,
    })
    .optional(),
  descriptionModel: z
    .object({
      description: MultiLangueModelSchema,
    })
    .optional(),
  definingNonLegalSource: z.array(DigitalObject).optional(),
  definingLegalSource: z.array(z.string()).optional(),
  relatedNonLegalSource: z.array(DigitalObject).optional(),
  relatedLegalSource: z.array(z.string()).optional(),
  exactMatch: z.array(ConceptRef).optional(),
  inTezaurus: z.boolean().optional(),
});

// Class concept (TRIDA)
const ClassConceptModelSchema = ConceptCreateModelSchema.extend({
  conceptTypeEnum: z.literal('TRIDA'),
  type: z.string().optional(),
  agendaCode: AgendaRef.optional(),
  agendaSystemCode: AgendaRef.optional(),
  contentType: z.string().optional(),
  acquisitionMethod: z.string().optional(),
  sharingMethod: z.array(z.string()).optional(),
  isInPPDF: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  privacyProvisions: z.array(z.string()).optional(),
  broaderConcept: z.array(ConceptRef).optional(),
  codeListDataset: z.string().optional(),
});

// Property concept (VLASTNOST)
const PropertyConceptModelSchema = ConceptCreateModelSchema.extend({
  conceptTypeEnum: z.literal('VLASTNOST'),
  dataType: z.string().optional(),
  domain: ConceptRef.optional(),
  superProperty: z.array(ConceptRef).optional(),
  isInPPDF: z.boolean().optional(),
  agendaCode: AgendaRef.optional(),
  agendaSystemCode: AgendaRef.optional(),
  isPublic: z.boolean().optional(),
  privacyProvisions: z.array(z.string()).optional(),
  sharingMethod: z.array(z.string()).optional(),
  acquisitionMethod: z.string().optional(),
  contentType: z.string().optional(),
  codeListDataset: z.string().optional(),
});

// Relationship concept (VZTAH)
const RelationshipConceptModelSchema = ConceptCreateModelSchema.extend({
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
  privacyProvisions: z.array(z.string()).optional(),
  codeListDataset: z.string().optional(),
});

// Discriminated union for submit payload
const CreateConceptBodySchema = z.discriminatedUnion('conceptTypeEnum', [
  ClassConceptModelSchema,
  PropertyConceptModelSchema,
  RelationshipConceptModelSchema,
]);

// Flat schema for form state (all type-specific fields optional)
const ConceptFormSchema = z.object({
  ...ConceptCreateModelSchema.shape,
  conceptTypeEnum: z.enum(['TRIDA', 'VLASTNOST', 'VZTAH']),
  // TRIDA
  type: z.string().optional(),
  broaderConcept: z.array(ConceptRef).optional(),
  // VLASTNOST
  dataType: z.string().optional(),
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
  privacyProvisions: z.array(z.string()).optional(),
  domain: ConceptRef.optional(),
  codeListDataset: z.string().optional(),
});

// Inferred types
export type NameModel = z.infer<typeof NameModelSchema>;
export type ConceptCreateModel = z.infer<typeof ConceptCreateModelSchema>;
export type ClassConceptModel = z.infer<typeof ClassConceptModelSchema>;
export type PropertyConceptModel = z.infer<typeof PropertyConceptModelSchema>;
export type RelationshipConceptModel = z.infer<
  typeof RelationshipConceptModelSchema
>;
export type CreateConceptBody = z.infer<typeof CreateConceptBodySchema>;
export type ConceptForm = z.infer<typeof ConceptFormSchema>;

export {
  NameModelSchema,
  ConceptCreateModelSchema,
  ClassConceptModelSchema,
  PropertyConceptModelSchema,
  RelationshipConceptModelSchema,
  CreateConceptBodySchema,
  ConceptFormSchema,
};
