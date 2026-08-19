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

const createNameModelSchema = (t: (_key: string) => string) =>
  z
    .array(languageSchema)
    .min(1, t('FormSchema.NameRequired'))
    .superRefine((entries, ctx) => {
      const czechIndex = entries.findIndex(
        ({ languageTag }) => languageTag === 'cs',
      );
      const czechName = entries[czechIndex]?.name;

      if (czechIndex === -1 || !czechName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('FormSchema.CSNameRequired'),
          path: [Math.max(czechIndex, 0), 'name'],
        });
      }
    });

export const createOntologySchema = (t: (_key: string) => string) =>
  z.object({
    namespace: z.string().min(1, t('FormSchema.NamespaceRequired')),
    nameModel: createNameModelSchema(t),
    descriptionModel: z.array(languageSchema).optional(),
  });

export type OntologySchemaType = z.infer<
  ReturnType<typeof createOntologySchema>
>;

export const ontologyEditModelSchema = (t: (_key: string) => string) =>
  z.object({
    nameModel: createNameModelSchema(t),
    descriptionModel: z.array(languageSchema).optional(),
  });

export type OntologyEditModel = z.infer<
  ReturnType<typeof ontologyEditModelSchema>
>;
