import { NextResponse } from 'next/server';

import { getHintStructure } from '@/lib/hints';

export async function GET() {
  const hintStructure = getHintStructure();
  return NextResponse.json(hintStructure);
}
