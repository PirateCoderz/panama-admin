// /src/app/api/blogs/upload/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

function sanitizeName(name = '') {
  return name.replace(/[^a-zA-Z0-9._-]+/g, '-');
}

export async function POST(req) {
  try {
    const { searchParams } = new URL(req.url);
    const folder = (searchParams.get('folder') || 'content').toLowerCase();
    const allowed = new Set(['featured', 'content']);
    const safeFolder = allowed.has(folder) ? folder : 'content';

    const form = await req.formData();
    const file = form.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ ok: false, error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const ext = path.extname(file.name || '') || '.jpg';
    const base = path.basename(file.name || 'upload', ext);
    const hash = crypto.randomBytes(6).toString('hex');
    const filename = `${Date.now()}-${hash}-${sanitizeName(base)}${ext}`;

    const publicDir = path.join(process.cwd(), 'public', 'blogs', safeFolder);
    await mkdir(publicDir, { recursive: true });

    const fullPath = path.join(publicDir, filename);
    await writeFile(fullPath, buffer);

    const url = `/blogs/${safeFolder}/${filename}`;
    return NextResponse.json({ ok: true, url });
  } catch (e) {
    console.error('[POST /api/blogs/upload] Error:', e);
    return NextResponse.json({ ok: false, error: 'Upload failed' }, { status: 500 });
  }
}
