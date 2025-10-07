import { z } from 'zod';

export const createCommentSchema = (t: (key: string) => string) =>
  z.object({
    message: z.string().min(1, t('MessageRequired')),
  });

export type CommentSchemaType = z.infer<ReturnType<typeof createCommentSchema>>;
