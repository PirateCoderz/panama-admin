import pool from '@/lib/mysql';

export const runtime = 'nodejs';

export async function GET(_req, { params }) {
  const id = Number(params.id);
  const [rows] = await pool.query('SELECT * FROM blogs WHERE id=? LIMIT 1', [id]);
  if (!rows?.length) return Response.json({ ok: false, message: 'Not found' }, { status: 404 });
  return Response.json(rows[0]);
}

export async function PUT(req, { params }) {
  try {
    const id = Number(params.id);
    const body = await req.json();
    const {
      title,
      slug,
      excerpt = null,
      content_html = null,
      featured_image_url = null,
      tags = null,
      status = 'draft',
    } = body || {};

    if (!title || !slug) return Response.json({ ok: false, message: 'Missing title/slug' }, { status: 400 });

    const safeTags = Array.isArray(tags) ? JSON.stringify(tags) : null;

    await pool.execute(
      `UPDATE blogs SET
         title=?, slug=?, excerpt=?, content_html=?, featured_image_url=?,
         status=?,
         tags=COALESCE(?, tags),
         published_at = CASE
           WHEN ?='published' AND published_at IS NULL THEN NOW(3)
           WHEN ?<>'published' THEN published_at
           ELSE published_at
         END
       WHERE id=?`,
      [title, slug, excerpt, content_html, featured_image_url, status, safeTags, status, status, id]
    );

    return Response.json({ ok: true });
  } catch (e) {
    console.error('UPDATE BLOG FAIL', e);
    return Response.json({ ok: false, message: e.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  const id = Number(params.id);
  await pool.execute('UPDATE blogs SET deleted_at=NOW(3) WHERE id=?', [id]);
  return Response.json({ ok: true });
}
