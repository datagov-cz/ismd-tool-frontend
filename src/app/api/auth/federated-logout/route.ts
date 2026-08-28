import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

import { appHomeUrl, keycloakLogoutUrl } from '@/lib/auth';

/**
 * Returns the URL the browser must navigate to in order to log out of Keycloak and,
 * through it, of the upstream identity provider (CAAIS).
 *
 * Call this BEFORE next-auth's signOut() — signOut clears the session cookie, and
 * without it there is no id_token to hand Keycloak as id_token_hint.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const token = await getToken({ req });
  const idToken = token?.idToken;

  // No session (or no id_token): nothing to log out of upstream — just go home.
  if (typeof idToken !== 'string') {
    return NextResponse.json({ url: appHomeUrl() }, { status: 200 });
  }

  return NextResponse.json(
    { url: keycloakLogoutUrl(idToken) },
    { status: 200 },
  );
}
