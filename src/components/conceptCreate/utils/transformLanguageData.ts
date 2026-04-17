import { AltNameModelAltName } from '@/api/generated';

export const transformLanguageData = (
  items: Array<{ name?: string; languageTag?: string }> | undefined,
) => {
  if (!items?.length) return undefined;

  const result = items.reduce(
    (acc, item) => {
      if (item.languageTag && item.name) {
        acc[item.languageTag] = item.name;
      }
      return acc;
    },
    { cs: '' } as AltNameModelAltName,
  );

  const keys = Object.keys(result);
  if (keys.length === 1 && keys[0] === 'cs' && !result.cs) {
    return undefined;
  }

  return result;
};
