import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';

const HOP_BY_HOP = new Set([
  'transfer-encoding',
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'upgrade',
  // Strip framing headers — Next.js owns the frame policy at the outer layer.
  // Without this, Spring Boot's default X-Frame-Options: DENY blocks the
  // swagger-ui iframe on /api-docs.
  'x-frame-options',
]);

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const joined = path.join('/');

  if (joined.includes('..') || /[/\\]/.test(path[0] ?? '')) {
    return new NextResponse('Bad request', { status: 400 });
  }

  const BE_URL = process.env.BE_URL;
  if (!BE_URL) {
    return new NextResponse('BE_URL not configured', { status: 500 });
  }

  const targetUrl = `${BE_URL}/${joined}${req.nextUrl.search}`;

  // Swagger and OpenAPI paths are public — skip the session lookup so swagger
  // works even when Keycloak is not running locally. NextAuth lazily fetches
  // the OIDC discovery doc on first getServerSession, which hangs without it.
  const isPublicDocsPath =
    joined.startsWith('swagger-ui') ||
    joined.startsWith('api-docs') ||
    joined.startsWith('v3/api-docs');

  const session = isPublicDocsPath ? null : await getServerSession(authOptions);

  const headers = new Headers();
  const contentType = req.headers.get('Content-Type');
  if (contentType) {
    headers.set('Content-Type', contentType);
  }
  const accept = req.headers.get('Accept');
  if (accept) {
    headers.set('Accept', accept);
  }
  if (session?.accessToken) {
    headers.set('Authorization', `Bearer ${session.accessToken}`);
  }

  const response = await fetch(targetUrl, {
    method: req.method,
    headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
    // @ts-expect-error - duplex is required for streaming request bodies
    duplex: 'half',
  });

  const responseHeaders = new Headers();
  response.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
