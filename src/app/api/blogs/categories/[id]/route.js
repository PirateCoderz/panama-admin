// /src/app/api/blogs/categories/[id]/route.js
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import mysqlPool from "@/lib/mysql";

export async function GET(_req, context) {
    const { params } = await context;
    const id = Number(await params?.id);
    if (!id) {
        return NextResponse.json({ ok: false, error: 'Invalid id.' }, { status: 400 });
    }
    let conn;
    try {
        conn = await mysqlPool.getConnection();
        const [rows] = await conn.query(
            'SELECT id, name, slug, description, created_at, updated_at FROM categories WHERE id=? LIMIT 1',
            [id]
        );
        const category = rows?.[0] || null;
        if (!category) {
            return NextResponse.json({ ok: false, error: 'Category not found.' }, { status: 404 });
        }
        return NextResponse.json({ ok: true, category });
    } catch (e) {
        console.error('[GET /categories/:id] Error:', e);
        return NextResponse.json({ ok: false, error: 'Failed to fetch category' }, { status: 500 });
    } finally {
        if (conn) conn.release();
    }
}

// PUT /api/blogs/categories/:id
export async function PUT(req, { params }) {
    let conn;
    try {
        const id = Number(await params?.id);
        if (!id) {
            return NextResponse.json({ ok: false, error: "Invalid id." }, { status: 400 });
        }

        const body = await req.json();
        const name = (body?.name || "").trim();
        const slug = (body?.slug || "").trim();
        const description = (body?.description || null);

        if (!name || !slug) {
            return NextResponse.json({ ok: false, error: "Name and slug are required." }, { status: 400 });
        }

        conn = await mysqlPool.getConnection();
        const [result] = await conn.query(
            "UPDATE categories SET name=?, slug=?, description=? WHERE id=?",
            [name, slug, description, id]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json({ ok: false, error: "Category not found." }, { status: 404 });
        }

        return NextResponse.json({ ok: true, message: "Category updated" });
    } catch (err) {
        console.error("[PUT /categories/:id] Error:", err);
        if (err?.code === "ER_DUP_ENTRY") {
            return NextResponse.json({ ok: false, error: "Slug already exists." }, { status: 409 });
        }
        return NextResponse.json({ ok: false, error: "Failed to update category" }, { status: 500 });
    } finally {
        if (conn) conn.release();
    }
}

// DELETE /api/blogs/categories/:id
export async function DELETE(_req, { params }) {
    let conn;
    try {
        const id = Number(await params?.id);
        if (!id) {
            return NextResponse.json({ ok: false, error: "Invalid id." }, { status: 400 });
        }

        conn = await mysqlPool.getConnection();
        const [result] = await conn.query("DELETE FROM categories WHERE id=?", [id]);

        if (result.affectedRows === 0) {
            return NextResponse.json({ ok: false, error: "Category not found." }, { status: 404 });
        }

        return NextResponse.json({ ok: true, message: "Category deleted" });
    } catch (err) {
        console.error("[DELETE /categories/:id] Error:", err);
        return NextResponse.json({ ok: false, error: "Failed to delete category" }, { status: 500 });
    } finally {
        if (conn) conn.release();
    }
}
