import { z } from 'zod';

const CANONICAL_ELI_PREFIX = 'https://opendata.eselpoint.gov.cz/esel-esb/eli/';
const CANONICAL_HOST_PREFIX = '://opendata.eselpoint.gov.cz/esel-esb/';
const LEGACY_HOST_PREFIX = '://opendata.eselpoint.cz/esel-esb/';
const BARE_LEGACY_HOST_PREFIX = '://eselpoint.cz/';
const ELI_MARKER = '/eli/';
const FORBIDDEN_IRI_CHARS = new Set([
  '<',
  '>',
  '"',
  '{',
  '}',
  '|',
  '^',
  '`',
  '\\',
]);

const canonicalizeLegalSourceHost = (iri: string): string => {
  const legacyHostIndex = iri.indexOf(LEGACY_HOST_PREFIX);
  if (legacyHostIndex >= 0) {
    return (
      iri.slice(0, legacyHostIndex) +
      CANONICAL_HOST_PREFIX +
      iri.slice(legacyHostIndex + LEGACY_HOST_PREFIX.length)
    );
  }

  const bareLegacyHostIndex = iri.indexOf(BARE_LEGACY_HOST_PREFIX);
  if (
    bareLegacyHostIndex >= 0 &&
    iri.indexOf(ELI_MARKER, bareLegacyHostIndex) > 0
  ) {
    return (
      iri.slice(0, bareLegacyHostIndex) +
      CANONICAL_HOST_PREFIX +
      iri.slice(bareLegacyHostIndex + BARE_LEGACY_HOST_PREFIX.length)
    );
  }

  return iri;
};

const isValidLegalSourceIri = (value: string): boolean => {
  const iri = canonicalizeLegalSourceHost(value.trim());
  if (iri.includes(';')) return false;

  try {
    const protocol = new URL(iri).protocol;
    if (protocol !== 'http:' && protocol !== 'https:') return false;
  } catch {
    return false;
  }

  for (const character of iri) {
    if (character.charCodeAt(0) <= 0x20 || FORBIDDEN_IRI_CHARS.has(character)) {
      return false;
    }
  }

  return iri.startsWith(CANONICAL_ELI_PREFIX);
};

const LegalSourceIriSchema = z
  .string()
  .refine((value) => value.trim() === '' || isValidLegalSourceIri(value), {
    message: 'zadejte iri v korektním formátu',
  });

export const LegalSourceListSchema = z.array(LegalSourceIriSchema).optional();
