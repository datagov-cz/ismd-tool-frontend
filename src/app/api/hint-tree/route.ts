import { NextResponse } from 'next/server';

import { getHintStructure } from '@/lib/hints';

export async function GET() {
  try {
    const hintStructure = getHintStructure();
    return NextResponse.json(hintStructure);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to build hint tree:', e);
    return NextResponse.json([]);
  }
}
