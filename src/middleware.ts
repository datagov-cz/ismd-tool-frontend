import { NextRequest, NextResponse } from 'next/server';

import {
  BYPASS_COOKIE,
  BYPASS_QUERY_PARAM,
  BYPASS_QUERY_VALUE_DISABLE,
  COMING_SOON_PATH,
  GATED_REQUEST_HEADER,
  getPreviewSecret,
  MAINTENANCE_PATH,
  parseSiteStatus,
} from '@/lib/site-status';

const BYPASS_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function gatedRequestHeaders(request: NextRequest): Headers {
  const headers = new Headers(request.headers);
  headers.set(GATED_REQUEST_HEADER, '1');
  return headers;
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const bypassParam = searchParams.get(BYPASS_QUERY_PARAM);
  const previewSecret = getPreviewSecret();

  // ?nahled=ne → clear bypass cookie, redirect (force-test the gated state).
  // Handled before the secret match so operators can always recover.
  if (bypassParam === BYPASS_QUERY_VALUE_DISABLE) {
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.searchParams.delete(BYPASS_QUERY_PARAM);
    const response = NextResponse.redirect(cleanUrl);
    response.cookies.delete(BYPASS_COOKIE);
    return response;
  }

  // ?nahled=<secret> → set bypass cookie, redirect to clean URL.
  // Only matches when SITE_PREVIEW_SECRET is configured and equal.
  if (
    previewSecret !== null &&
    bypassParam !== null &&
    bypassParam === previewSecret
  ) {
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.searchParams.delete(BYPASS_QUERY_PARAM);
    const response = NextResponse.redirect(cleanUrl);
    response.cookies.set({
      name: BYPASS_COOKIE,
      value: previewSecret,
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: BYPASS_MAX_AGE_SECONDS,
    });
    return response;
  }

  const status = parseSiteStatus(process.env.SITE_STATUS);

  if (status === 'live') {
    return NextResponse.next();
  }

  // Direct visit to a gated page — allow through but flag it so the layout
  // renders the stripped header/footer regardless of the original pathname.
  if (pathname === COMING_SOON_PATH || pathname === MAINTENANCE_PATH) {
    return NextResponse.next({
      request: { headers: gatedRequestHeaders(request) },
    });
  }

  // Bypass cookie holders see the live app. Cookie value must match the
  // currently-configured secret — rotating SITE_PREVIEW_SECRET invalidates
  // every previously issued bypass cookie.
  if (
    previewSecret !== null &&
    request.cookies.get(BYPASS_COOKIE)?.value === previewSecret
  ) {
    return NextResponse.next();
  }

  const gatedPath =
    status === 'maintenance' ? MAINTENANCE_PATH : COMING_SOON_PATH;
  const url = request.nextUrl.clone();
  url.pathname = gatedPath;
  url.search = '';
  return NextResponse.rewrite(url, {
    request: { headers: gatedRequestHeaders(request) },
  });
}

export const config = {
  matcher: [
    // Match the bare basePath itself (e.g. /popisujeme). Without this entry
    // Next.js compiles a regex that requires a sub-path, so the gate would
    // be invisible at the canonical URL — especially when an upstream proxy
    // strips trailing slashes.
    '/',
    // Skip Next.js internals, static assets, health endpoints, and API routes
    // (the readiness probe must keep working when the site is gated).
    '/((?!_next/static|_next/image|favicon.ico|assets/|api/health|api/auth).*)',
  ],
};
