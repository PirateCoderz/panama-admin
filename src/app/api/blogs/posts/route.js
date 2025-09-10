// /src/app/api/blogs/posts/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';



import { NextResponse } from 'next/server';
import mysqlPool from '@/lib/mysql';


export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim().toLowerCase();
  const status = (searchParams.get('status') || '').trim();

  let conn;
  try {
    conn = await mysqlPool.getConnection();

    // Base blog rows
    const where = [];
    const params = [];
    if (status && ['draft', 'scheduled', 'published', 'archived'].includes(status)) {
      where.push('b.status = ?'); params.push(status);
    }
    if (q) {
      where.push('(LOWER(b.title) LIKE ? OR LOWER(b.slug) LIKE ? OR LOWER(b.excerpt) LIKE ?)');
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    const sql = `
      SELECT 
        b.id, b.title, b.slug, b.status, b.published_at, b.created_at, b.updated_at,
        b.excerpt, b.featured_image_url, b.canonical_url,
        GROUP_CONCAT(JSON_OBJECT('id', c.id, 'name', c.name) ORDER BY c.name SEPARATOR '||') AS cats
      FROM blogs b
      LEFT JOIN blog_categories bc ON bc.blog_id = b.id
      LEFT JOIN categories c ON c.id = bc.category_id
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      GROUP BY b.id
      ORDER BY COALESCE(b.published_at, b.created_at) DESC, b.id DESC
      LIMIT 500
    `;

    const [rows] = await conn.query(sql, params);

    const blogs = rows.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      status: r.status,
      published_at: r.published_at,
      created_at: r.created_at,
      updated_at: r.updated_at,
      excerpt: r.excerpt,
      featured_image_url: r.featured_image_url,
      canonical_url: r.canonical_url,
      categories: r.cats
        ? r.cats.split('||').map((j) => {
          try { return JSON.parse(j); } catch { return null; }
        }).filter(Boolean)
        : [],
    }));

    return NextResponse.json({ ok: true, blogs });
  } catch (e) {
    console.error('[GET /api/blogs] Error:', e);
    return NextResponse.json({ ok: false, error: 'Failed to fetch blogs' }, { status: 500 });
  } finally {
    if (conn) conn.release();
  }
}



export async function POST(req) {
  let conn;
  try {
    const body = await req.json();

    const title = (body?.title || '').trim();
    const slug = (body?.slug || '').trim();
    const excerpt = body?.excerpt ?? null;
    const content_html = body?.content_html ?? null;
    const featured_image_url = body?.featured_image_url ?? null;
    const status = (body?.status || 'draft').trim(); // draft|scheduled|published|archived
    const tags = Array.isArray(body?.tags) ? body.tags : [];
    const seo_title = body?.seo_title ?? null;
    const seo_description = body?.seo_description ?? null;
    const canonical_url = body?.canonical_url ?? null;
    const published_at = body?.published_at || null; // 'YYYY-MM-DD HH:mm:ss' or null
    const author_id = body?.author_id || null; // optional
    const category_ids = Array.isArray(body?.category_ids) ? body.category_ids : [];

    if (!title || !slug) {
      return NextResponse.json({ ok: false, error: 'Title and slug are required.' }, { status: 400 });
    }

    conn = await mysqlPool.getConnection();
    await conn.beginTransaction();

    const [res] = await conn.query(
      `INSERT INTO blogs
        (author_id, title, slug, excerpt, content_html, featured_image_url, tags, status,
         seo_title, seo_description, canonical_url, published_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
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
      ]
    );

    const blogId = res.insertId;

    if (category_ids.length > 0) {
      const values = category_ids
        .filter((id) => Number(id))
        .map((id) => [blogId, Number(id)]);
      if (values.length) {
        await conn.query(
          'INSERT INTO blog_categories (blog_id, category_id) VALUES ?',
          [values]
        );
      }
    }

    await conn.commit();
    return NextResponse.json({ ok: true, id: blogId, message: 'Blog created' });
  } catch (e) {
    console.error('[POST /api/blogs/posts] Error:', e);
    try { if (conn) await conn.rollback(); } catch { }
    // Handle duplicate slug
    if (e?.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ ok: false, error: 'Slug already exists.' }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: 'Failed to create blog' }, { status: 500 });
  } finally {
    if (conn) conn.release();
  }
}
