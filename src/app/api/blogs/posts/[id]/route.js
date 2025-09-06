// /src/app/api/blogs/posts/[id]/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import mysqlPool from '@/lib/mysql';

export async function GET(_req, { params }) {
  const id = Number(params?.id);
  if (!id) return NextResponse.json({ ok: false, error: 'Invalid id' }, { status: 400 });
  let conn;
  try {
    conn = await mysqlPool.getConnection();
    const [rows] = await conn.query(
      `SELECT id, author_id, title, slug, excerpt, content_html, featured_image_url,
              JSON_EXTRACT(tags, '$') AS tags,
              status, seo_title, seo_description, canonical_url, published_at,
              created_at, updated_at
       FROM blogs WHERE id=? LIMIT 1`,
      [id]
    );
    const blog = rows?.[0] || null;
    if (!blog) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

    const [cats] = await conn.query(
      'SELECT category_id FROM blog_categories WHERE blog_id=?',
      [id]
    );

    return NextResponse.json({
      ok: true,
      blog: {
        ...blog,
        tags: blog.tags ? JSON.parse(blog.tags) : [],
        category_ids: cats.map((x) => x.category_id),
      },
    });
  } catch (e) {
    console.error('[GET /api/blogs/posts/:id] Error:', e);
    return NextResponse.json({ ok: false, error: 'Failed to fetch blog' }, { status: 500 });
  } finally {
    if (conn) conn.release();
  }
}

export async function PUT(req, { params }) {
  const id = Number(params?.id);
  if (!id) return NextResponse.json({ ok: false, error: 'Invalid id' }, { status: 400 });

  let conn;
  try {
    const body = await req.json();

    const title = (body?.title || '').trim();
    const slug = (body?.slug || '').trim();
    const excerpt = body?.excerpt ?? null;
    const content_html = body?.content_html ?? null;
    const featured_image_url = body?.featured_image_url ?? null;
    const status = (body?.status || 'draft').trim();
    const tags = Array.isArray(body?.tags) ? body.tags : [];
    const seo_title = body?.seo_title ?? null;
    const seo_description = body?.seo_description ?? null;
    const canonical_url = body?.canonical_url ?? null;
    const published_at = body?.published_at || null;
    const author_id = body?.author_id || null;
    const category_ids = Array.isArray(body?.category_ids) ? body.category_ids : [];

    if (!title || !slug) {
      return NextResponse.json({ ok: false, error: 'Title and slug are required.' }, { status: 400 });
    }

    conn = await mysqlPool.getConnection();
    await conn.beginTransaction();

    const [res] = await conn.query(
      `UPDATE blogs SET
        author_id=?, title=?, slug=?, excerpt=?, content_html=?, featured_image_url=?,
        tags=?, status=?, seo_title=?, seo_description=?, canonical_url=?, published_at=?
       WHERE id=?`,
      [
        author_id,
        title,
        slug,
        excerpt,
        content_html,
        featured_image_url,
        JSON.stringify(tags || []),
        status,
        seo_title,
        seo_description,
        canonical_url,
        published_at,
        id,
      ]
    );

    if (res.affectedRows === 0) {
      await conn.rollback();
      return NextResponse.json({ ok: false, error: 'Blog not found' }, { status: 404 });
    }

    // reset categories
    await conn.query('DELETE FROM blog_categories WHERE blog_id=?', [id]);

    if (category_ids.length > 0) {
      const values = category_ids
        .filter((cid) => Number(cid))
        .map((cid) => [id, Number(cid)]);
      if (values.length) {
        await conn.query(
          'INSERT INTO blog_categories (blog_id, category_id) VALUES ?',
          [values]
        );
      }
    }

    await conn.commit();
    return NextResponse.json({ ok: true, message: 'Blog updated' });
  } catch (e) {
    console.error('[PUT /api/blogs/posts/:id] Error:', e);
    try { if (conn) await conn.rollback(); } catch {}
    if (e?.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ ok: false, error: 'Slug already exists.' }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: 'Failed to update blog' }, { status: 500 });
  } finally {
    if (conn) conn.release();
  }
}
