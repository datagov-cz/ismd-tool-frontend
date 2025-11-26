import { z } from 'zod';

const nameModelSchema = z.object({
  languageTag: z.string().optional(),
  name: z.string().optional(),
});

const altNameModelSchema = z.object({
  languageTag: z.string().optional(),
  altName: z.string().optional(),
});

const descriptionModelSchema = z.object({
  languageTag: z.string().optional(),
  description: z.string().optional(),
});

const definitionModelSchema = z.object({
  languageTag: z.string().optional(),
  definition: z.string().optional(),
});

const baseConceptSchema = z.object({
  ontologyGraphName: z.string().min(1, 'Ontology graph name is required'),
  conceptType: z.string().min(1, 'Concept type is required'),
  namespace: z.string().optional(),
  nameModel: nameModelSchema,
  identifier: z.string().optional(),
  altNameModel: z.array(altNameModelSchema).optional(),
  descriptionModel: descriptionModelSchema.optional(),
  definitionModel: definitionModelSchema.optional(),
  definingNonLegalSource: z.array(z.string()).optional(),
  definingLegalSource: z.array(z.string()).optional(),
  relatedNonLegalSource: z.array(z.string()).optional(),
  relatedLegalSource: z.array(z.string()).optional(),
  exactMatch: z.array(z.string()).optional(),
  inTezaurus: z.string().optional(),
  isPublic: z.string().optional(),
  isInPPDF: z.boolean().optional(),
  agendaCode: z.string().optional(),
  agendaSystemCode: z.string().optional(),
  sharingMethod: z.string().optional(),
  acquisitionMethod: z.string().optional(),
  privacyProvision: z.string().optional(),
  contentType: z.string().optional(),
});

const classConceptSchema = baseConceptSchema.extend({
  type: z.string().optional(),
  broaderConcept: z.string().optional(),
  conceptTypeEnum: z.literal('TRIDA'),
});

const propertyConceptSchema = baseConceptSchema.extend({
  dataType: z.string().optional(),
  domain: z.string(),
  superProperty: z.string().optional(),
  conceptTypeEnum: z.literal('VLASTNOST'),
});

const relationshipConceptSchema = baseConceptSchema.extend({
  domain: z.string('Domain is required'),
  range: z.string(),
  superRelation: z.string().optional(),
  conceptTypeEnum: z.literal('VZTAH'),
});

export const createConceptSchema = z.discriminatedUnion('conceptTypeEnum', [
  classConceptSchema,
  propertyConceptSchema,
  relationshipConceptSchema,
]);

export type CreateConceptFormData = z.infer<typeof createConceptSchema>;
