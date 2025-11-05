import { z } from 'zod';

export const createCommentSchema = (t: (key: string) => string) =>
  z.object({
    comment: z.string().min(1, t('MessageRequired')).optional(),
    ontologyIRI: z.string().min(1, t('MessageRequired')).optional(),
    conceptIRI: z.string().min(1, t('MessageRequired')).optional(),
  });

export type CommentSchemaType = z.infer<ReturnType<typeof createCommentSchema>>;
