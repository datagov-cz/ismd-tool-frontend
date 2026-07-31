import { Account, NextAuthOptions, Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import KeycloakProvider from 'next-auth/providers/keycloak';

const KEYCLOAK_ISSUER = process.env.KEYCLOAK_ISSUER!;
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID!;
const KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET!;
const NEXTAUTH_URL = process.env.NEXTAUTH_URL!;
// Optional: alias of a Keycloak identity provider to jump straight to,
// bypassing the Keycloak login page. Set to `caais` in deployed envs.
const KEYCLOAK_IDP_HINT = process.env.KEYCLOAK_IDP_HINT;

interface KeycloakToken extends JWT {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number;
  error?: 'RefreshAccessTokenError';
}

interface RefreshedKeycloakTokens {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  expires_in: number;
}

function keycloakUrl(path: string): string {
  return `${KEYCLOAK_ISSUER}/protocol/openid-connect/${path}`;
}

function isTokenExpired(token: KeycloakToken): boolean {
  return Date.now() >= token.expiresAt * 1000;
}

function tokenFromAccount(token: JWT, account: Account): KeycloakToken {
  return {
    ...token,
    accessToken: account.access_token!,
    idToken: account.id_token!,
    refreshToken: account.refresh_token!,
    expiresAt: account.expires_at!,
  };
}

async function refreshAccessToken(
  token: KeycloakToken,
): Promise<KeycloakToken> {
  try {
    const response = await fetch(keycloakUrl('token'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: KEYCLOAK_CLIENT_ID,
        client_secret: KEYCLOAK_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken,
      }),
    });

    const refreshed: RefreshedKeycloakTokens = await response.json();
    if (!response.ok) {
      return refreshFailed(token, refreshed);
    }

    return {
      ...token,
      accessToken: refreshed.access_token,
      idToken: refreshed.id_token,
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
      expiresAt: Math.floor(Date.now() / 1000) + refreshed.expires_in,
      error: undefined,
    };
  } catch (error) {
    return refreshFailed(token, error);
  }
}

function refreshFailed(token: KeycloakToken, error: unknown): KeycloakToken {
  // eslint-disable-next-line no-console
  console.error('Failed to refresh access token', error);
  return { ...token, error: 'RefreshAccessTokenError' };
}

/**
 * Builds Keycloak's RP-initiated logout URL. The BROWSER must navigate here — a
 * server-side fetch ends the Keycloak session but cannot clear the upstream
 * identity provider's cookie, so the next login is silently re-authenticated as the
 * same user. Only a real redirect lets Keycloak front-channel the browser on to
 * CAAIS's end_session. See /api/auth/federated-logout.
 */
export function keycloakLogoutUrl(idToken: string): string {
  const logoutUrl = new URL(keycloakUrl('logout'));
  logoutUrl.searchParams.set('id_token_hint', idToken);
  logoutUrl.searchParams.set('post_logout_redirect_uri', NEXTAUTH_URL);
  return logoutUrl.toString();
}

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: KEYCLOAK_CLIENT_ID,
      clientSecret: KEYCLOAK_CLIENT_SECRET,
      issuer: KEYCLOAK_ISSUER,
      // When KEYCLOAK_IDP_HINT is set (e.g. `caais` in deployed envs), skip
      // Keycloak's own login screen and redirect straight to that identity
      // provider. Left unset locally so the Keycloak login page (and the
      // `testuser` local account) stays reachable for dev without CAAIS.
      ...(KEYCLOAK_IDP_HINT
        ? { authorization: { params: { kc_idp_hint: KEYCLOAK_IDP_HINT } } }
        : {}),
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, account }): Promise<JWT> {
      if (account) return tokenFromAccount(token, account);

      const keycloakToken = token as KeycloakToken;
      if (!isTokenExpired(keycloakToken)) return keycloakToken;

      return refreshAccessToken(keycloakToken);
    },
    async session({ session, token }): Promise<Session> {
      const keycloakToken = token as KeycloakToken;
      session.accessToken = keycloakToken.accessToken;
      session.error = keycloakToken.error;
      return session;
    },
  },
};
