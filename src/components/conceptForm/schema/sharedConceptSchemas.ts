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

export const createRequiredNameModelSchema = (
  t: (_key: 'NameRequired') => string,
) =>
  z
    .array(
      z.object({
        languageTag: z.string(),
        name: z.string(),
      }),
    )
    .min(1, t('NameRequired'))
    .superRefine((entries, ctx) => {
      if (!entries.some((entry) => entry.name.trim() !== '')) {
        ctx.addIssue({
          code: 'custom',
          message: t('NameRequired'),
          path: [0, 'name'],
        });
      }
    });

// The translated version is created by the form using its active locale.
export const RequiredNameModelSchema = createRequiredNameModelSchema(
  (key) => key,
);

export const CodeListRef = z.object({
  datasetIri: z.string(),
  codeListIri: z.string(),
  title: z.string(),
  publisher: z.string().optional(),
  description: z.string().optional(),
  codeListNumber: z.string().optional(),
  validFrom: z.string().optional(),
});
