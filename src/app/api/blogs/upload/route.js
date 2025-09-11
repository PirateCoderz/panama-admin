// /src/app/api/blogs/upload/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

// OPTIONAL (recommended): npm i file-type sharp
import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';

// CORS (enable if uploading from a different origin, e.g., Vite on 5173)
const ALLOW_ORIGIN = process.env.NEXT_PUBLIC_ADMIN_UPLOAD_ORIGIN || 'http://localhost:5173';
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': ALLOW_ORIGIN,
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

function sanitizeName(name = '') {
  return name.replace(/[^a-zA-Z0-9._-]+/g, '-');
}

function extFromMime(mime) {
  switch (mime) {
    case 'image/jpeg': return '.jpg';
    case 'image/png': return '.png';
    case 'image/webp': return '.webp';
    case 'image/avif': return '.avif';     // keep if you want to store avif
    default: return null;
  }
}

export async function POST(req) {
  try {
    const { searchParams } = new URL(req.url);
    const folder = (searchParams.get('folder') || 'content').toLowerCase();
    const allowedFolders = new Set(['featured', 'content']);
    const safeFolder = allowedFolders.has(folder) ? folder : 'content';

    const form = await req.formData();
    const file = form.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ ok: false, error: 'No file uploaded' }, { status: 400, headers: CORS_HEADERS });
    }

    // Size limit (2 MB here)
    const MAX_BYTES = 2 * 1024 * 1024;
    const arrayBuffer = await file.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_BYTES) {
      return NextResponse.json({ ok: false, error: 'File too large (max 2MB)' }, { status: 413, headers: CORS_HEADERS });
    }
    const buffer = Buffer.from(arrayBuffer);

    // Detect actual MIME from bytes
    const ft = await fileTypeFromBuffer(buffer);
    const mime = ft?.mime || file.type || '';
    const allowedMimes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
    if (!allowedMimes.has(mime)) {
      return NextResponse.json({ ok: false, error: 'Only JPEG/PNG/WebP/AVIF images allowed' }, { status: 415, headers: CORS_HEADERS });
    }

    // Derive extension from MIME (ignore client filename ext)
    let ext = extFromMime(mime);
    if (!ext) {
      return NextResponse.json({ ok: false, error: 'Unsupported image type' }, { status: 415, headers: CORS_HEADERS });
    }

    // Build filename
    const baseOrig = sanitizeName(path.parse(file.name || 'upload').name || 'upload');
    const id = crypto.randomUUID();
    // Optional: convert non-transparent to webp for space savings
    // We'll attempt to preserve PNG if it has alpha
    let outputBuffer = buffer;
    let finalExt = ext;

    try {
      const img = sharp(buffer);
      const meta = await img.metadata();
      const hasAlpha = !!meta.hasAlpha;

      if (mime === 'image/jpeg') {
        outputBuffer = await img.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
        finalExt = '.jpg';
      } else if (mime === 'image/png') {
        if (hasAlpha) {
          // keep PNG if transparency matters, but optimize
          outputBuffer = await img.png({ compressionLevel: 9 }).toBuffer();
          finalExt = '.png';
        } else {
          // convert opaque PNG to WebP
          outputBuffer = await img.webp({ quality: 82 }).toBuffer();
          finalExt = '.webp';
        }
      } else if (mime === 'image/webp') {
        outputBuffer = await img.webp({ quality: 82 }).toBuffer();
        finalExt = '.webp';
      } else if (mime === 'image/avif') {
        // leave as avif or you can transcode to webp if you want
        outputBuffer = await img.avif({ quality: 50 }).toBuffer();
        finalExt = '.avif';
      }
    } catch (err) {
      // If sharp fails, fall back to the original buffer
      console.warn('sharp failed, storing original buffer:', err);
      outputBuffer = buffer;
      finalExt = ext;
    }

    const filename = `${Date.now()}-${id}-${baseOrig}${finalExt}`;

    const publicDir = path.join(process.cwd(), 'public', 'blogs', safeFolder);
    await mkdir(publicDir, { recursive: true });

    const fullPath = path.join(publicDir, filename);
    await writeFile(fullPath, outputBuffer);

    // Relative URL to serve via Next static
    const relativeUrl = `/blogs/${safeFolder}/${filename}`;

    // Absolute URL for consumers on other origins
    const ORIGIN =
      process.env.NEXT_PUBLIC_ADMIN_ORIGIN || // e.g. https://admin.panamatravel.co.uk
      process.env.NEXT_PUBLIC_SITE_ORIGIN ||  // fallback to public site if you prefer
      '';
    const absoluteUrl = ORIGIN ? `${ORIGIN}${relativeUrl}` : null;

    return NextResponse.json(
      { ok: true, url: relativeUrl, absolute_url: absoluteUrl, mime },
      { headers: CORS_HEADERS }
    );
  } catch (e) {
    console.error('[POST /api/blogs/upload] Error:', e);
    return NextResponse.json({ ok: false, error: 'Upload failed' }, { status: 500, headers: CORS_HEADERS });
  }
}


/**
 * DELETE /api/blogs/upload?url=/blogs/featured/123.webp
 *      or /api/blogs/upload?path=/blogs/featured/123.webp
 *      or an absolute URL from same host e.g. https://admin.example.com/blogs/featured/123.webp
 */
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const raw = (searchParams.get('url') || searchParams.get('path') || '').trim();
    if (!raw) {
      return NextResponse.json({ ok: false, error: 'Missing url/path' }, { status: 400, headers: CORS_HEADERS });
    }

    // Support absolute or relative. Always convert to a pathname like /blogs/featured/file.ext
    let pathname = '';
    try {
      pathname = new URL(raw, 'http://dummy.local').pathname; // base handles relative
    } catch {
      pathname = raw;
    }

    // Only allow within /blogs/featured or /blogs/content
    const allowedPrefixes = ['/blogs/featured/', '/blogs/content/'];
    if (!allowedPrefixes.some((p) => pathname.startsWith(p))) {
      return NextResponse.json({ ok: false, error: 'Path not allowed' }, { status: 400, headers: CORS_HEADERS });
    }

    // Resolve to filesystem path under public/blogs/*
    const publicRoot = path.resolve(path.join(process.cwd(), 'public'));
    const fileFsPath = path.resolve(path.join(publicRoot, pathname)); // public + /blogs/featured/xxx

    // Prevent directory traversal: final path must stay within /public
    if (!fileFsPath.startsWith(publicRoot + path.sep)) {
      return NextResponse.json({ ok: false, error: 'Invalid path' }, { status: 400, headers: CORS_HEADERS });
    }

    // Check existence then delete
    try {
      await stat(fileFsPath); // throws if not found
    } catch {
      return NextResponse.json({ ok: true, deleted: false, message: 'File not found (already removed)' }, { headers: CORS_HEADERS });
    }

    await unlink(fileFsPath);
    return NextResponse.json({ ok: true, deleted: true }, { headers: CORS_HEADERS });
  } catch (e) {
    console.error('[DELETE /api/blogs/upload] Error:', e);
    return NextResponse.json({ ok: false, error: 'Delete failed' }, { status: 500, headers: CORS_HEADERS });
  }
}