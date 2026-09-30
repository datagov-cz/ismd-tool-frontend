'use client';

import { signIn } from 'next-auth/react';

import { useEnvironment } from '@/components/contexts/Environment';
import { normalizeBasePath } from '@/lib/basePath';

/**
 * Keycloak identity-provider aliases, matching the `nia` / `caais` aliases the
 * realm declares in ismd-infrastructure/modules/keycloak_realm.
 */
export type IdpAlias = 'caais' | 'nia';

/**
 * Starts a Keycloak login, optionally jumping straight to one identity provider.
 *
 * Passing an alias sends `kc_idp_hint`, which skips Keycloak's own login page.
 * Omitting it lands the user on that page, where local accounts live — that is the
 * admin route. `acr_values` is not set here: it comes from the provider defaults in
 * lib/auth.ts, so it rides along every one of these calls.
 */
export function useLogin() {
  const { variables } = useEnvironment();
  // Footer renders outside <Providers> in app/layout.tsx, so the context is empty
  // there. Fall back to the inlined build-time value, which is what HeaderActions and
  // HeaderHero already use — the base path is a Dockerfile ARG and constant per image.
  const callbackUrl =
    normalizeBasePath(
      variables?.NEXT_PUBLIC_BASE_PATH ?? process.env.NEXT_PUBLIC_BASE_PATH,
    ) || '/';

  return (idp?: IdpAlias) =>
    signIn(
      'keycloak',
      { callbackUrl },
      { prompt: 'login', ...(idp ? { kc_idp_hint: idp } : {}) },
    );
}

/** Whether the NIA login button should be rendered. Server-set, read at request time. */
export function useNiaEnabled(): boolean {
  const { variables } = useEnvironment();
  return variables?.niaEnabled ?? false;
}
