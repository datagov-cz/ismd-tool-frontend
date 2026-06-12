import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

export type Hint = { title: string; body: string; recommendation?: string };

export const conceptHintKeys = [
  'nameModel.name',
  'altNameModel.altName',
  'conceptType',
  'type',
  'definitionModel.definition',
  'descriptionModel.description',
  'broaderConcept',
  'exactMatch',
  'definingLegalSource',
  'relatedLegalSource',
  'definingNonLegalSource',
  'relatedNonLegalSource',
  'agendaCode',
  'agendaSystemCode',
  'isPublic',
  'privacyProvisions',
  'isInPPDF',
  'contentType',
  'acquisitionMethod',
  'sharingMethod',
  'ontologyGraphName',
  'namespace',
  'identifier',
  'dataType',
  'domain',
  'range',
  'superProperty',
  'superRelation',
  'codeListDataset',
  'inTezaurus',
] as const;

export const dictionaryHintKeys = [
  'namespace',
  'nameModel',
  'descriptionModel',
] as const;

const toKeyMap = (keys: readonly string[]): Record<string, true> =>
  Object.fromEntries(keys.map((k) => [k, true]));

const conceptHintKeyMap = toKeyMap(conceptHintKeys);
const dictionaryHintKeyMap = toKeyMap(dictionaryHintKeys);

// unchanged: works on any object that has the field paths as keys
export function resolveHintKey(
  name: string,
  hints: Record<string, unknown>,
): string | null {
  const parts = name.split('.').filter((p) => !/^\d+$/.test(p));
  for (let i = parts.length; i > 0; i--) {
    const key = parts.slice(0, i).join('.');
    if (key in hints) return key;
  }
  return null;
}

export const resolveHintKeyConcept = (name: string): string | null =>
  resolveHintKey(name, conceptHintKeyMap);

export const resolveHintKeyOntology = (name: string): string | null =>
  resolveHintKey(name, dictionaryHintKeyMap);

export function useConceptFormHints() {
  const t = useTranslations('ConceptHints');
  return useMemo(() => {
    const hints = Object.fromEntries(
      conceptHintKeys.map((key) => [key, t.raw(`fields.${key}`) as Hint]),
    ) as Record<string, Hint>;
    return {
      hints,
      defaultHint: t.raw('default') as Hint,
      defaultHintEdit: t.raw('defaultEdit') as Hint,
    };
  }, [t]);
}

export function useDictionaryFormHints() {
  const t = useTranslations('DictionaryHints');
  return useMemo(() => {
    const hints = Object.fromEntries(
      dictionaryHintKeys.map((key) => [key, t.raw(`fields.${key}`) as Hint]),
    ) as Record<string, Hint>;
    return {
      hints,
      defaultHint: t.raw('default') as Hint,
      defaultHintEdit: t.raw('defaultEdit') as Hint,
    };
  }, [t]);
}
