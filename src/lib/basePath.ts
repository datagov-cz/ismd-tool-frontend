export const normalizeBasePath = (basePath?: string): string => {
  if (!basePath || basePath.trim() === '') return '';

  const trimmed = basePath.trim();
  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  return withLeadingSlash.endsWith('/')
    ? withLeadingSlash.slice(0, -1)
    : withLeadingSlash;
};
