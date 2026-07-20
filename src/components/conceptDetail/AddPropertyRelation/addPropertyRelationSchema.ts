import z from 'zod';

const ConceptRef = z.object({
  iri: z.string(),
  label: z.string(),
  ontologyLabel: z.string().optional(),
  id: z.number().optional(),
});

export const AddPropertyModelSchema = z.object({
  concept: ConceptRef.nullable(),
});

export const AddRelationModelSchema = z.object({
  relation: ConceptRef.nullable(),
  otherConcept: ConceptRef.nullable(),
});

export type AddPropertyModel = z.infer<typeof AddPropertyModelSchema>;
export type AddRelationModel = z.infer<typeof AddRelationModelSchema>;
