import { signOut } from 'next-auth/react';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/**
 * Logs the user out of the app, Keycloak, and the upstream identity provider (CAAIS).
 *
 * next-auth's signOut() only clears the local session — Keycloak's session survives,
 * and so does CAAIS's own cookie, so the next login is silently re-authenticated as
 * the same user with no chance to switch account. Clearing those requires the BROWSER
 * to navigate to Keycloak's end_session, which then front-channels on to CAAIS; a
 * server-side fetch cannot touch cookies in the user's browser.
 *
 * Order matters: fetch the URL while the session cookie still exists (it carries the
 * id_token that Keycloak needs as id_token_hint), then clear the local session, then
 * navigate.
 */
export async function federatedSignOut(): Promise<void> {
  try {
    const url = await fetchLogoutUrl();

    await signOut({ redirect: false });
    window.location.href = url;
  } catch {
    // Degrade to a local-only signOut rather than trapping the user in a logged-in
    // state. Keycloak/CAAIS sessions survive, so the next login won't re-prompt.
    await signOut({ callbackUrl: BASE_PATH || '/' });
  }
}

async function fetchLogoutUrl(): Promise<string> {
  const response = await fetch(`${BASE_PATH}/api/auth/federated-logout`);

  if (!response.ok) {
    throw new Error(`Federated logout failed: ${response.status}`);
  }

  const { url } = (await response.json()) as { url: string };
  return url;
}
