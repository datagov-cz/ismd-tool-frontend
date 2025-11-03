import { z } from 'zod';

export const uploadOntologySchema = () =>
  z.object({ file: z.instanceof(Blob).optional() });
