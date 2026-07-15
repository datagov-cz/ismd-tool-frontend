import {
  PropertyDeviationBoolean,
  PropertyDeviationListNonLegalSourceDto,
  PropertyDeviationListString,
  PropertyDeviationMapStringObject,
  PropertyDeviationMapStringString,
  PropertyDeviationString,
  PublishedConceptDeviationModel,
} from '@/api/generated';

export type DeviationKey = Exclude<
  keyof PublishedConceptDeviationModel,
  'status' | 'errorMessage'
>;

export type DeviationValue = NonNullable<
  PublishedConceptDeviationModel[DeviationKey]
>;

export type DeviationSide = 'localValue' | 'publishedValue';

export const isDeviationKey = (key: string): key is DeviationKey =>
  key !== 'status' && key !== 'errorMessage';

export const MULTI_LANG_KEYS: readonly DeviationKey[] = [
  'název',
  'definice',
  'popis',
];

export const LEGAL_SOURCE_KEYS: readonly DeviationKey[] = [
  'definující-ustanovení-právního-předpisu',
  'související-ustanovení-právního-předpisu',
  'ustanovení-dokládající-neveřejnost-údaje',
];

export const NONLEGAL_SOURCE_KEYS: readonly DeviationKey[] = [
  'související-nelegislativní-zdroj',
  'definující-nelegislativní-zdroj',
];

export const CONCEPT_KEYS: readonly DeviationKey[] = [
  'nadřazená-třída',
  'nadřazený-vztah',
  'definiční-obor',
  'obor-hodnot',
  'ekvivalentní-pojem',
];

export const RPP_KEYS: readonly DeviationKey[] = ['agenda', 'ais'];

export const isMultiLang = (
  key: DeviationKey,
  data: DeviationValue,
): data is PropertyDeviationMapStringString => MULTI_LANG_KEYS.includes(key);

export const isAltName = (
  key: DeviationKey,
  data: DeviationValue,
): data is PropertyDeviationMapStringObject => key === 'alternativní-název';

export const isConcept = (
  key: DeviationKey,
  data: DeviationValue,
): data is PropertyDeviationListString => CONCEPT_KEYS.includes(key);

export const isRPP = (
  key: DeviationKey,
  data: DeviationValue,
): data is PropertyDeviationString => RPP_KEYS.includes(key);

export const isPPDF = (
  key: DeviationKey,
  data: DeviationValue,
): data is PropertyDeviationBoolean => key === 'je-ppdf';

export const isLegalSource = (
  key: DeviationKey,
  data: DeviationValue,
): data is PropertyDeviationListString => LEGAL_SOURCE_KEYS.includes(key);

export const isNonLegalSource = (
  key: DeviationKey,
  data: DeviationValue,
): data is PropertyDeviationListNonLegalSourceDto =>
  NONLEGAL_SOURCE_KEYS.includes(key);
