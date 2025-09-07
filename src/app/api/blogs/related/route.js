export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import mysqlPool from '@/lib/mysql';

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const limit = Math.max(1, Math.min(20, parseInt(searchParams.get('limit') || '3', 10)));
  const status = (searchParams.get('status') || 'published').trim();
  const allowedStatuses = ['draft', 'scheduled', 'published', 'archived'];
  const effectiveStatus = allowedStatuses.includes(status) ? status : 'published';

  const blogIdParam = searchParams.get('blog_id');
  const blogId = blogIdParam && /^\d+$/.test(blogIdParam) ? Number(blogIdParam) : null;
  if (!blogId) {
    return NextResponse.json({ ok: false, error: 'blog_id is required and must be numeric' }, { status: 400 });
  }

  let conn;
  try {
    conn = await mysqlPool.getConnection();

    // 1) Load base post signals: categories + tags
    const [[base]] = await conn.query(
      `SELECT id, JSON_EXTRACT(tags, '$') AS tags
         FROM blogs
        WHERE id = ?
        LIMIT 1`,
      [blogId]
    );
    if (!base) {
      return NextResponse.json({ ok: true, blogs: [] });
    }

    const [baseCats] = await conn.query(
      `SELECT category_id FROM blog_categories WHERE blog_id = ?`,
      [blogId]
    );
    const baseCategoryIds = baseCats.map(x => Number(x.category_id)).filter(n => Number.isInteger(n) && n > 0);

    const baseTags = base.tags ? (() => { try { return JSON.parse(base.tags); } catch { return []; } })() : [];

    // If no signals, nothing to relate on
    if ((!baseCategoryIds || baseCategoryIds.length === 0) && (!baseTags || baseTags.length === 0)) {
      return NextResponse.json({ ok: true, blogs: [] });
    }

    // 2) Build CTEs
    let catCTE = '';
    let catParams = [];
    if (baseCategoryIds.length > 0) {
      const placeholders = baseCategoryIds.map(() => '?').join(',');
      catCTE = `
        cat_matches AS (
          SELECT b.id AS id,
                 2 * COUNT(DISTINCT bc.category_id) AS cat_score
            FROM blogs b
            JOIN blog_categories bc ON bc.blog_id = b.id
           WHERE bc.category_id IN (${placeholders})
             AND b.id <> ?
             ${effectiveStatus ? 'AND b.status = ?' : ''}
           GROUP BY b.id
          HAVING cat_score > 0
        )
      `;
      catParams = [...baseCategoryIds, blogId];
      if (effectiveStatus) catParams.push(effectiveStatus);
    }

    let tagCTE = '';
    let tagParams = [];
    if (baseTags.length > 0) {
      const pieces = baseTags.map(() => 'JSON_CONTAINS(b.tags, ?, "$")').join(' + ');
      tagCTE = `
        tag_matches AS (
          SELECT b.id AS id,
                 (${pieces}) AS tag_score
            FROM blogs b
           WHERE b.id <> ?
             ${effectiveStatus ? 'AND b.status = ?' : ''}
          HAVING tag_score > 0
        )
      `;
      // each tag param must be JSON string literal -> '"tag"'
      tagParams = baseTags.map(t => JSON.stringify(String(t)));
      tagParams.push(blogId);
      if (effectiveStatus) tagParams.push(effectiveStatus);
    }

    // 3) Combine: AND if both exist, else fallback to the one that exists
    let withBlocks = [];
    if (catCTE) withBlocks.push(catCTE);
    if (tagCTE) withBlocks.push(tagCTE);
    const withClause = withBlocks.length ? `WITH ${withBlocks.join(',\n')}` : '';

    let scoreJoinSQL = '';
    let scoreParams = [];
    if (catCTE && tagCTE) {
      // Require BOTH a category match and a tag match
      scoreJoinSQL = `
        SELECT b.id, (c.cat_score + t.tag_score) AS total_score
          FROM blogs b
          JOIN cat_matches c ON c.id = b.id
          JOIN tag_matches t ON t.id = b.id
      `;
      scoreParams = [...catParams, ...tagParams];
    } else if (catCTE) {
      // Only categories available
      scoreJoinSQL = `SELECT id, cat_score AS total_score FROM cat_matches`;
      scoreParams = [...catParams];
    } else {
      // Only tags available
      scoreJoinSQL = `SELECT id, tag_score AS total_score FROM tag_matches`;
      scoreParams = [...tagParams];
    }

    // 4) Final select with categories bundled as [{id,name}]
    const finalSQL = `
      ${withClause}
      , ranked AS (
        ${scoreJoinSQL}
      )
      SELECT 
        b.id,
        b.title,
        b.slug,
        b.status,
        b.published_at,
        b.created_at,
        b.updated_at,
        b.excerpt,
        b.featured_image_url,
        b.canonical_url,
        r.total_score,
        GROUP_CONCAT(JSON_OBJECT('id', c.id, 'name', c.name) ORDER BY c.name SEPARATOR '||') AS cats
      FROM ranked r
      JOIN blogs b ON b.id = r.id
      LEFT JOIN blog_categories bc ON bc.blog_id = b.id
      LEFT JOIN categories c ON c.id = bc.category_id
      GROUP BY b.id, r.total_score
      ORDER BY r.total_score DESC, COALESCE(b.published_at, b.created_at) DESC, b.id DESC
      LIMIT ?
    `;

    const [rows] = await conn.query(finalSQL, [...scoreParams, limit]);

    const blogs = rows.map(r => ({
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
      score: Number(r.total_score) || 0,
      categories: r.cats
        ? r.cats.split('||').map(j => { try { return JSON.parse(j); } catch { return null; } }).filter(Boolean)
        : [],
    }));

    return NextResponse.json({ ok: true, blogs });
  } catch (e) {
    console.error('[GET /api/blogs/related] Error:', e);
    return NextResponse.json({ ok: false, error: 'Failed to fetch related blogs' }, { status: 500 });
  } finally {
    if (conn) conn.release();
  }
}
