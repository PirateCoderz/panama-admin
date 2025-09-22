import pool from '@/lib/mysql';
import Image from 'next/image';

export const runtime = 'nodejs';
export const revalidate = 0;

export default async function BlogPostPage({ params }) {
  const slug = params.slug;
  const [rows] = await pool.query(
    `SELECT id, title, slug, excerpt, content_html,
            seo_title, seo_description, canonical_url,
            published_at, created_at, updated_at, tags
     FROM blogs
     WHERE slug=? AND status='published' AND deleted_at IS NULL
     LIMIT 1`,
    [slug]
  );
  if (!rows?.length) return <div className="p-6">Not found</div>;
  const post = rows[0];

  const title = post.seo_title || post.title;
  const description = post.seo_description || post.excerpt || '';
  const canonical = post.canonical_url || `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`;

  return (
    <>
      <head>
        <title>{title}</title>
        {description && <meta name="description" content={description} />}
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
        {description && <meta property="og:description" content={description} />}
        <meta property="og:url" content={canonical} />
        {post.canonical_url && <meta property="og:image" content={post.canonical_url} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        {description && <meta name="twitter:description" content={description} />}
        {post.canonical_url && <meta name="twitter:image" content={post.canonical_url} />}
      </head>

      <article className="prose mx-auto max-w-3xl p-6 dark:prose-invert">
        <h1 className='text-3xl font-bold'>{post.title}</h1>
        {post.canonical_url && (
          <Image src={post.canonical_url} alt={post.title} width={640} height={360} className="my-4 rounded" />
        )}
        <div dangerouslySetInnerHTML={{ __html: post.content_html || '' }} />
      </article>
    </>
  );
}
