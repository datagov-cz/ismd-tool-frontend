import { PublishedConceptDeviationModel } from '@/api/generated';

export type RppResolvedEntry = {
  iri?: string;
  code?: string;
  nazev?: string;
};

export type OborHodnotResolvedEntry = {
  code?: string;
  label?: string;
};

export type DeviationResolvedMaps = {
  'agenda-resolved'?: Record<string, RppResolvedEntry>;
  'ais-resolved'?: Record<string, RppResolvedEntry>;
  'obor-hodnot-resolved'?: Record<string, OborHodnotResolvedEntry>;
};

export type DeviationKey = Exclude<
  keyof PublishedConceptDeviationModel,
  | 'status'
  | 'errorMessage'
  | 'origin'
  | 'source'
  | 'obor-hodnot-resolved'
  | 'referencované-pojmy-resolved'
  | 'agenda-resolved'
  | 'ais-resolved'
>;

export type DeviationValue = NonNullable<
  PublishedConceptDeviationModel[DeviationKey]
>;

export type DeviationSide = 'localValue' | 'publishedValue';

export type Deviation = {
  [K in DeviationKey]: {
    key: K;
    data: NonNullable<PublishedConceptDeviationModel[K]>;
  };
}[DeviationKey];

export const isDeviationKey = (key: string): key is DeviationKey =>
  key !== 'status' &&
  key !== 'errorMessage' &&
  key !== 'source' &&
  key !== 'origin' &&
  key !== 'obor-hodnot-resolved' &&
  key !== 'referencované-pojmy-resolved' &&
  key !== 'agenda-resolved' &&
  key !== 'ais-resolved';

export const MULTI_LANG_KEYS = ['název', 'definice', 'popis'] as const;

export const ALT_NAME_KEYS = ['alternativní-název'] as const;

export const LEGAL_SOURCE_KEYS = [
  'definující-ustanovení-právního-předpisu',
  'související-ustanovení-právního-předpisu',
  'ustanovení-dokládající-neveřejnost-údaje',
] as const;

export const NONLEGAL_SOURCE_KEYS = [
  'související-nelegislativní-zdroj',
  'definující-nelegislativní-zdroj',
] as const;

export const CONCEPT_KEYS = [
  'nadřazená-třída',
  'nadřazený-vztah',
  'definiční-obor',
  'ekvivalentní-pojem',
] as const;

export const RPP_KEYS = ['agenda', 'ais'] as const;

export const PPDF_KEYS = ['je-ppdf'] as const;

export const TYP_KEYS = ['typ'] as const;

export const OBOR_HODNOT_KEYS = ['obor-hodnot'] as const;

export const IRI_LABEL_KEYS = [
  'typ-obsahu-údajů',
  'způsob-získání-údajů',
] as const;

export const SHARING_KEYS = ['způsob-sdílení-údajů'] as const;

export const isOneOf = <K extends DeviationKey>(
  deviation: Deviation,
  keys: readonly K[],
): deviation is Extract<Deviation, { key: K }> =>
  (keys as readonly string[]).includes(deviation.key);
