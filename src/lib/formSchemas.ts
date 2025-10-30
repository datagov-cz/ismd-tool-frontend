import { z } from 'zod';

export const createCommentSchema = (t: (key: string) => string) =>
  z.object({
    message: z.string(t('MessageRequired')),
  });

export type CommentSchemaType = z.infer<ReturnType<typeof createCommentSchema>>;

export const createOntologySchema = (t: (key: string) => string) =>
  z.object({
    namespace: z.string().min(1, t('FormSchema.NamespaceRequired')),
    name: z.string(t('FormSchema.NameRequired')),
    description: z.string(t('FormSchema.DescriptionRequired')),
  });

export type OntologySchemaType = z.infer<
  ReturnType<typeof createOntologySchema>
>;
