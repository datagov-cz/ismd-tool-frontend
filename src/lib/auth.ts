import { NextAuthOptions } from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';

const KEYCLOAK_REFRESH_URL = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`;

async function refreshAccessToken(token: Record<string, unknown>) {
  try {
    const response = await fetch(KEYCLOAK_REFRESH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.KEYCLOAK_CLIENT_ID!,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken as string,
      }),
    });

    const refreshed = await response.json();

    if (!response.ok) throw refreshed;

    return {
      ...token,
      accessToken: refreshed.access_token,
      idToken: refreshed.id_token,
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
      expiresAt: Math.floor(Date.now() / 1000) + refreshed.expires_in,
      error: undefined,
    };
  } catch (error) {
    console.error('Failed to refresh access token', error);
    return { ...token, error: 'RefreshAccessTokenError' };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER!,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          idToken: account.id_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at,
        };
      }

      if (Date.now() < (token.expiresAt as number) * 1000) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.error = token.error as string | undefined;
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      const logoutUrl = new URL(
        `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/logout`,
      );
      logoutUrl.searchParams.set('id_token_hint', token.idToken as string);
      logoutUrl.searchParams.set(
        'post_logout_redirect_uri',
        process.env.NEXTAUTH_URL!,
      );

      await fetch(logoutUrl.toString());
    },
  },
  session: {
    strategy: 'jwt',
  },
};
