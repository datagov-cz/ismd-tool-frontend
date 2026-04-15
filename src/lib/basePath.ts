export const normalizeBasePath = (basePath?: string): string => {
  if (!basePath || basePath.trim() === '') return '';

  const trimmed = basePath.trim();
  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  return withLeadingSlash.endsWith('/')
    ? withLeadingSlash.slice(0, -1)
    : withLeadingSlash;
};

const basePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH);

export const fetchApi = (path: string, init?: RequestInit): Promise<Response> =>
  fetch(`${basePath}${path}`, init);
