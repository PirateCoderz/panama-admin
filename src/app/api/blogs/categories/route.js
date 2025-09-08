// /src/app/api/blogs/categories/route.js
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import mysqlPool from "@/lib/mysql";

// GET /api/blogs/categories

// export async function GET() {
//     return new Response("Hello, Next.js categories route!");
// }
export async function GET() {
    let conn;
    try {
        console.log("API is working")
        conn = await mysqlPool.getConnection();
        // console.log(conn)
        const [rows] = await conn.query(
            "SELECT id, name, slug, description, created_at, updated_at FROM categories ORDER BY created_at DESC"
        );
        return NextResponse.json({ ok: true, categories: rows });
    } catch (err) {
        console.error("[GET /categories] Error:", err);
        return NextResponse.json({ ok: false, error: "Failed to fetch categories" }, { status: 500 });
    } finally {
        if (conn) conn.release();
    }
}

// POST /api/blogs/categories
export async function POST(req) {
    let conn;
    try {
        const body = await req.json();
        const name = (body?.name || "").trim();
        const slug = (body?.slug || "").trim();
        const description = (body?.description || null);

        if (!name || !slug) {
            return NextResponse.json({ ok: false, error: "Name and slug are required." }, { status: 400 });
        }

        conn = await mysqlPool.getConnection();
        const [result] = await conn.query(
            "INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)",
            [name, slug, description]
        );

        return NextResponse.json({ ok: true, id: result.insertId, message: "Category created" });
    } catch (err) {
        console.error("[POST /categories] Error:", err);
        // Handle duplicate slug
        if (err?.code === "ER_DUP_ENTRY") {
            return NextResponse.json({ ok: false, error: "Slug already exists." }, { status: 409 });
        }
        return NextResponse.json({ ok: false, error: "Failed to create category" }, { status: 500 });
    } finally {
        if (conn) conn.release();
    }
}
