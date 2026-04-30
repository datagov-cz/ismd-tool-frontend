import { z } from 'zod';

export const createCommentSchema = (t: (_key: string) => string) =>
  z.object({
    comment: z.string().min(1, t('MessageRequired')).optional(),
    ontologyIRI: z.string().min(1, t('MessageRequired')).optional(),
    conceptIRI: z.string().min(1, t('MessageRequired')).optional(),
  });

export type CommentSchemaType = z.infer<ReturnType<typeof createCommentSchema>>;

export const uploadOntologySchema = () =>
  z.object({ file: z.instanceof(Blob).optional() });

export type UploadFromFileBody = z.infer<
  ReturnType<typeof uploadOntologySchema>
>;

const languageSchema = z.object({
  languageTag: z.string().optional(),
  name: z.string().optional(),
});

export const createOntologySchema = (t: (_key: string) => string) =>
  z.object({
    namespace: z.string().min(1, t('FormSchema.NamespaceRequired')),
    nameModel: z.array(languageSchema).min(1, t('FormSchema.NameRequired')),
    descriptionModel: z.array(languageSchema).optional(),
  });

export type OntologySchemaType = z.infer<
  ReturnType<typeof createOntologySchema>
>;

export const ontologyEditModelSchema = z.object({
  nameModel: z.array(languageSchema).optional(),
  descriptionModel: z.array(languageSchema).optional(),
});

export type OntologyEditModel = z.infer<typeof ontologyEditModelSchema>;
