// /src/app/api/blogs/upload/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';
import ImageKit from 'imagekit';

import { mysqlPool } from "@/lib/mysql";



// init imagekit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// CORS
const ALLOW_ORIGIN =
  process.env.NEXT_PUBLIC_ADMIN_UPLOAD_ORIGIN ||
  'http://localhost:5173' ||
  'http://localhost:4173';
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': ALLOW_ORIGIN,
  'Access-Control-Allow-Methods': 'POST,DELETE,OPTIONS',
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
    case 'image/avif': return '.avif';
    default: return null;
  }
}

// ---------- UPLOAD ----------
export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ ok: false, error: 'No file uploaded' }, { status: 400, headers: CORS_HEADERS });
    }

    // size limit
    const MAX_BYTES = 1 * 1024 * 1024;
    const arrayBuffer = await file.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_BYTES) {
      return NextResponse.json({ ok: false, error: 'File too large (max 1MB)' }, { status: 413, headers: CORS_HEADERS });
    }

    const buffer = Buffer.from(arrayBuffer);

    // detect mime
    const ft = await fileTypeFromBuffer(buffer);
    const mime = ft?.mime || file.type || '';
    const allowedMimes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
    if (!allowedMimes.has(mime)) {
      return NextResponse.json({ ok: false, error: 'Only JPEG/PNG/WebP/AVIF images allowed' }, { status: 415, headers: CORS_HEADERS });
    }

    let ext = extFromMime(mime);
    if (!ext) {
      return NextResponse.json({ ok: false, error: 'Unsupported image type' }, { status: 415, headers: CORS_HEADERS });
    }

    // optimize
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
          outputBuffer = await img.png({ compressionLevel: 9 }).toBuffer();
          finalExt = '.png';
        } else {
          outputBuffer = await img.webp({ quality: 82 }).toBuffer();
          finalExt = '.webp';
        }
      } else if (mime === 'image/webp') {
        outputBuffer = await img.webp({ quality: 82 }).toBuffer();
        finalExt = '.webp';
      } else if (mime === 'image/avif') {
        outputBuffer = await img.avif({ quality: 50 }).toBuffer();
        finalExt = '.avif';
      }
    } catch (err) {
      console.warn('sharp failed, fallback to original:', err);
      outputBuffer = buffer;
      finalExt = ext;
    }

    // build unique filename
    const baseOrig = sanitizeName(file.name || 'upload');
    const filename = `${Date.now()}-${baseOrig}${finalExt}`;

    // upload to ImageKit
    const uploaded = await imagekit.upload({
      file: outputBuffer,
      fileName: filename,
      folder: `/blogs`,
    });

    console.log('[ImageKit Upload Response]', uploaded);

    return NextResponse.json(
      {
        ok: true,
        uploaded,     // full object (contains fileId, url, etc.)
        url: uploaded.url,
      },
      { headers: CORS_HEADERS }
    );
  } catch (e) {
    console.error('[POST /api/blogs/upload] Error:', e);
    return NextResponse.json(
      { ok: false, error: e.message || 'Upload failed', details: e, success: false },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

// ---------- DELETE ----------
export async function DELETE(req) {
  let conn;
  try {
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("fileid") || null;

    if (!fileId) {
      return NextResponse.json(
        { ok: true, success: true, message: "No fileId provided, nothing deleted" },
        { headers: CORS_HEADERS }
      );
    }

    // 1. Delete file from ImageKit
    await imagekit.deleteFile(fileId);

    // 2. Update database: set fileId and canonical_url = NULL
    conn = await mysqlPool.getConnection();
    await conn.beginTransaction();

    await conn.query(
      `UPDATE blogs 
       SET featured_image_url = NULL, canonical_url = NULL 
       WHERE featured_image_url = ?`,
      [fileId]
    );

    await conn.commit();

    return NextResponse.json(
      { ok: true, success: true, deleted: true, fileId },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    if (conn) await conn.rollback();
    console.error("[DELETE /api/blogs/upload] Error:", error);
    return NextResponse.json(
      { ok: false, success: false, error: error.message },
      { status: 500, headers: CORS_HEADERS }
    );
  } finally {
    if (conn) conn.release();
  }
};