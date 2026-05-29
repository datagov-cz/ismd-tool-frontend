import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

const CONTENT_PATH = path.join(process.cwd(), 'src/app/hints');

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filePath = searchParams.get('filePath');

  if (!filePath) {
    return NextResponse.json({ error: 'Missing filePath' }, { status: 400 });
  }

  const absPath = path.resolve(CONTENT_PATH, `.${path.sep}${filePath}`);
  const rootWithSep = CONTENT_PATH.endsWith(path.sep)
    ? CONTENT_PATH
    : `${CONTENT_PATH}${path.sep}`;
  if (!absPath.startsWith(rootWithSep)) {
    return NextResponse.json({ error: 'Invalid filePath' }, { status: 400 });
  }

  if (!fs.existsSync(absPath) || !fs.statSync(absPath).isFile()) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  const content = fs.readFileSync(absPath, 'utf-8');
  return NextResponse.json({ content });
}
