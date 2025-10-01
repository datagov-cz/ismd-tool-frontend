import { NextResponse } from 'next/server';

import { getBlogPosts } from '@/lib/blogs';

export async function GET() {
  const blogPosts = await getBlogPosts();
  return NextResponse.json(blogPosts);
}
