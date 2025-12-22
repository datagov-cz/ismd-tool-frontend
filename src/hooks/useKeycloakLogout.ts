import { signOut, useSession } from 'next-auth/react';

export function useKeycloakLogout() {
  const { data: session } = useSession();

  const logout = async () => {
    const idToken = session?.idToken;
    const issuer = process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER;
    const postLogoutRedirectUri = `${window.location.origin}/`;

    // Clear NextAuth session first
    await signOut({ redirect: false });

    // Redirect to Keycloak logout endpoint
    if (issuer && idToken) {
      const logoutUrl = `${issuer}/protocol/openid-connect/logout?id_token_hint=${idToken}&post_logout_redirect_uri=${encodeURIComponent(postLogoutRedirectUri)}`;
      window.location.href = logoutUrl;
    } else {
      // Fallback: just redirect to home if no idToken available
      window.location.href = postLogoutRedirectUri;
    }
  };

  return logout;
}
