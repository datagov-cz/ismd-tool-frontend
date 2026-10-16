export type LanguageEntry = { languageTag: string; name: string };

export const withCsEntry = (
  entries: LanguageEntry[] = [],
  name: string,
): LanguageEntry[] =>
  entries.some((entry) => entry.languageTag === 'cs')
    ? entries.map((entry) =>
        entry.languageTag === 'cs' ? { ...entry, name } : entry,
      )
    : [...entries, { languageTag: 'cs', name }];
