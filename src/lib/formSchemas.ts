import { z } from 'zod';

export const createCommentSchema = (t: (key: string) => string) =>
  z.object({
    comment: z.string().min(1, t('MessageRequired')).optional(),
    ontologyIRI: z.string().min(1, t('MessageRequired')).optional(),
    conceptIRI: z.string().min(1, t('MessageRequired')).optional(),
  });

export type CommentSchemaType = z.infer<ReturnType<typeof createCommentSchema>>;

export const uploadOntologySchema = () =>
  z.object({ file: z.instanceof(Blob).optional() });

export const createOntologySchema = (t: (key: string) => string) =>
  z.object({
    namespace: z.string().min(1, t('FormSchema.NamespaceRequired')),
    name: z.string().min(1, t('FormSchema.NameRequired')),
    description: z.string().min(1, t('FormSchema.DescriptionRequired')),
    languageTag: z.string().min(1, t('FormSchema.LanguageTagRequired')),
  });

export type OntologySchemaType = z.infer<
  ReturnType<typeof createOntologySchema>
>;

const languageSchema = z.object({
  languageTag: z.string().optional(),
  name: z.string().optional(),
});

export const ontologyEditModelSchema = z.object({
  nameModel: z.string().optional(),
  descriptionModel: z.array(languageSchema).optional(),
});

export type OntologyEditModel = z.infer<typeof ontologyEditModelSchema>;
