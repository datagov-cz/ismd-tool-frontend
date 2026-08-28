import { z } from 'zod';

export const ConceptRef = z.object({
  iri: z.string(),
  label: z.string(),
  ontologyLabel: z.string().optional(),
  id: z.number().optional(),
});

export const AgendaRef = z.object({
  iri: z.string().optional(),
  nazev: z.string().optional(),
  code: z.string().optional(),
});

export const MultiLanguageModelSchema = z
  .array(
    z.object({
      languageTag: z.string(),
      name: z.string(),
    }),
  )
  .optional();

export const DigitalObject = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  url: z.url().optional(),
});

export const RequiredNameModelSchema = z
  .array(
    z.object({
      languageTag: z.string(),
      name: z.string(),
    }),
  )
  .min(1, 'NameRequired')
  .superRefine((entries, ctx) => {
    if (!entries.some((entry) => entry.name.trim() !== '')) {
      ctx.addIssue({
        code: 'custom',
        message: 'NameRequired',
        path: [0, 'name'],
      });
    }
  });

const NKOD_DATASET_PATTERN =
  /^https:\/\/data\.gov\.cz\/zdroj\/datové-sady\/.*$/;
const ABSOLUTE_IRI_PATTERN = /^https?:\/\/\S+$/;

export const CodeListDatasetSchema = z
  .string()
  .optional()
  .refine(
    (value) =>
      value == null || value.trim() === '' || NKOD_DATASET_PATTERN.test(value),
    { message: 'Neplatná URL datové sady v NKOD' },
  );

export const CodeListIriSchema = z
  .string()
  .optional()
  .refine(
    (value) =>
      value == null ||
      value.trim() === '' ||
      ABSOLUTE_IRI_PATTERN.test(value.trim()),
    { message: 'Neplatné IRI číselníku' },
  );
