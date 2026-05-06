export type SiteStatus = 'live' | 'coming_soon' | 'maintenance';

const VALID_STATUSES: readonly SiteStatus[] = [
  'live',
  'coming_soon',
  'maintenance',
] as const;

export const BYPASS_COOKIE = 'dia-nahled';
export const BYPASS_QUERY_PARAM = 'nahled';
// Reserved literal that always clears the bypass cookie. The preview secret
// must therefore never be set to this exact value.
export const BYPASS_QUERY_VALUE_DISABLE = 'ne';

/**
 * Returns the preview bypass secret from the environment, or null if it is
 * unset/blank. When null, the bypass mechanism is fully disabled — no value of
 * `?nahled=...` will grant access and any existing cookie is ignored.
 */
export function getPreviewSecret(): string | null {
  const raw = process.env.SITE_PREVIEW_SECRET;
  if (!raw) return null;
  const trimmed = raw.trim();
  if (trimmed === '' || trimmed === BYPASS_QUERY_VALUE_DISABLE) return null;
  return trimmed;
}

export const COMING_SOON_PATH = '/coming-soon';
export const MAINTENANCE_PATH = '/maintenance';

export function parseSiteStatus(value: string | undefined): SiteStatus {
  if (value && (VALID_STATUSES as readonly string[]).includes(value)) {
    return value as SiteStatus;
  }
  return 'live';
}

export function isGatedPath(pathname: string): boolean {
  return pathname === COMING_SOON_PATH || pathname === MAINTENANCE_PATH;
}
