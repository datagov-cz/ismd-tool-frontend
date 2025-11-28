import { z } from 'zod';

const nameModelSchema = z.object({
  languageTag: z.string().optional(),
  name: z.string().trim().min(1, 'Název musí mít aspoň jeden znak'),
});

const languageSchema = z.object({
  languageTag: z.string().optional(),
  name: z.string().optional(),
});

const INVALID_IRI_KEYWORDS = ['text', 'invalid', 'n/a', 'tbd', 'todo'];
const INVALID_IRI_CHARS = [
  ' ',
  '\t',
  '\n',
  '\r',
  '<',
  '>',
  '"',
  '{',
  '}',
  '|',
  '\\',
  '^',
  '`',
];

const iriValidator = (value: string): boolean => {
  const lower = value.toLowerCase();

  if (
    INVALID_IRI_KEYWORDS.some((keyword) => lower.includes(` ${keyword}`)) ||
    lower.startsWith('ne-') ||
    INVALID_IRI_KEYWORDS.includes(lower) ||
    INVALID_IRI_CHARS.some((char) => value.includes(char))
  ) {
    return false;
  }

  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:.*/.test(value)) {
    return false;
  }

  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/.*/.test(value)) {
    const afterScheme = value.substring(value.indexOf('://') + 3);

    if (
      afterScheme.length === 0 ||
      INVALID_IRI_CHARS.some((char) => afterScheme.includes(char))
    ) {
      return false;
    }
  }

  return true;
};

const iriSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (value) => {
      if (!value || value.length === 0) return true;
      return iriValidator(value);
    },
    {
      message:
        "Hodnota musí být platné IRI (např. https://example.com/resource nebo urn:example:123). Nesmí obsahovat mezery, neplatné znaky nebo zástupné texty jako 'n/a', 'todo', 'tbd'.",
    },
  );

const sourceValueSchema = z.object({ value: z.string().optional() });

const eliSourceSchema = z.object({
  value: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => {
        if (!value) return true;
        return /.*[/\\]eli[/\\]cz[/\\].*/.test(value);
      },
      {
        message:
          'Hodnota musí obsahovat validní ELI vzorec (např., /eli/cz/...)',
      },
    ),
});

const baseConceptSchema = z.object({
  ontologyGraphName: z.string().min(1, 'Slovník je povinný'),
  conceptType: z.string().min(1, 'Typ pojmu je povinný'),
  namespace: z.url().optional(),
  nameModel: nameModelSchema,
  identifier: z.string().optional(),
  altNameModel: z.array(languageSchema).optional(),
  descriptionModel: z.array(languageSchema).optional(),
  definitionModel: z.array(languageSchema).optional(),
  definingNonLegalSource: z.array(sourceValueSchema).optional(),
  definingLegalSource: z.array(eliSourceSchema).optional(),
  relatedNonLegalSource: z.array(sourceValueSchema).optional(),
  relatedLegalSource: z.array(eliSourceSchema).optional(),
  exactMatch: z
    .array(
      z.object({
        value: iriSchema.optional(),
      }),
    )
    .optional(),
  inTezaurus: z.string().optional(),
  isPublic: z.string().optional(),
  isInPPDF: z.boolean().optional(),
  agendaCode: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => {
        if (!value) return true;
        return (
          /^\d+$/.test(value) ||
          /^A\d+$/.test(value) ||
          /^https:\/\/.*?\/agenda\/A\d+$/.test(value)
        );
      },
      {
        message:
          'Hodnota musí být číslo (123), kód s prefixem A (A123), nebo URL ve formátu https://.../agenda/A123',
      },
    ),
  agendaSystemCode: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => {
        if (!value) return true;
        return /^\d+$/.test(value) || /^https:\/\/.*?\/isvs\/\d+$/.test(value);
      },
      {
        message:
          'Hodnota musí být číslo (123) nebo URL ve formátu https://.../isvs/123',
      },
    ),
  sharingMethod: z.array(sourceValueSchema).optional(),
  acquisitionMethod: z.string().optional(),
  privacyProvision: z.string().optional(),
  contentType: z.string().optional(),
});

const classConceptSchema = baseConceptSchema.extend({
  type: z.string().optional(),
  broaderConcept: iriSchema.optional(),
  conceptTypeEnum: z.literal('TRIDA'),
});

const propertyConceptSchema = baseConceptSchema.extend({
  dataType: z.string().optional(),
  domain: z.string(),
  superProperty: iriSchema.optional(),
  conceptTypeEnum: z.literal('VLASTNOST'),
});

const relationshipConceptSchema = baseConceptSchema.extend({
  domain: z.string('Domain is required'),
  range: z.string(),
  superRelation: iriSchema.optional(),
  conceptTypeEnum: z.literal('VZTAH'),
});

const baseCreateConceptSchema = z.discriminatedUnion('conceptTypeEnum', [
  classConceptSchema,
  propertyConceptSchema,
  relationshipConceptSchema,
]);

export const createConceptSchema = baseCreateConceptSchema;

export type CreateConceptFormData = z.infer<typeof createConceptSchema>;
