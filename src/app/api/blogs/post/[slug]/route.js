// /src/app/api/blogs/post/[slug]/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import mysqlPool from '@/lib/mysql';

// If you need CORS, uncomment:
// const cors = { 'Access-Control-Allow-Origin': 'http://localhost:5173', 'Access-Control-Allow-Methods': 'GET,OPTIONS' };
// export async function OPTIONS() { return new NextResponse(null, { status: 204, headers: cors }); }

export async function GET(_req, { params }) {
  const slug = (params?.slug || '').trim();
  if (!slug) {
    return NextResponse.json({ ok: false, error: 'Invalid slug' }, { status: 400 });
  }

  let conn;
  try {
    conn = await mysqlPool.getConnection();

    // 1) fetch blog by slug
    const [rows] = await conn.query(
      `SELECT id, author_id, title, slug, excerpt, content_html, featured_image_url,
              JSON_EXTRACT(tags, '$') AS tags,
              status, seo_title, seo_description, canonical_url, published_at,
              created_at, updated_at
       FROM blogs
       WHERE slug = ?
       LIMIT 1`,
      [slug]
    );

    const blog = rows?.[0] || null;
    if (!blog) {
      return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
    }

    // 2) fetch categories for the FOUND blog.id (not slug)
    const [cats] = await conn.query(
      `SELECT c.id, c.name
         FROM blog_categories bc
         JOIN categories c ON c.id = bc.category_id
        WHERE bc.blog_id = ?`,
      [blog.id]
    );

    return NextResponse.json({
      ok: true,
      blog: {
        ...blog,
        tags: blog.tags ? JSON.parse(blog.tags) : [],
        categories: cats,                 // return full {id,name} objects
        category_ids: cats.map((x) => x.id), // and ids if you still want them
      },
    });
  } catch (e) {
    console.error('[GET /api/blogs/posts/[slug]] Error:', e);
    return NextResponse.json({ ok: false, error: 'Failed to fetch blog' }, { status: 500 });
  } finally {
    if (conn) conn.release();
  }
}
