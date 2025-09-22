// /src/app/api/homepage/about/route.js
import { NextResponse } from "next/server";
import mysqlPool from "@/lib/mysql";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  let conn;
  try {
    conn = await mysqlPool.getConnection();
    const [rows] = await conn.query("SELECT * FROM about_panama LIMIT 1");

    return NextResponse.json({ ok: true, about: rows[0] || null });
  } catch (err) {
    console.error("[GET /api/homepage/about] Error:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch about" }, { status: 500 });
  } finally {
    if (conn) conn.release();
  }
}

export async function PATCH(req) {
  let conn;
  try {
    const body = await req.json();
    const { heading, content } = body;

    if (!heading || !content) {
      return NextResponse.json({ ok: false, error: "Heading and content are required." }, { status: 400 });
    }

    conn = await mysqlPool.getConnection();
    await conn.query(
      "UPDATE about_panama SET heading = ?, content = ? WHERE id = 1",
      [heading, content]
    );

    return NextResponse.json({ ok: true, message: "About Panama updated successfully" });
  } catch (err) {
    console.error("[PATCH /api/homepage/about] Error:", err);
    return NextResponse.json({ ok: false, error: "Failed to update about" }, { status: 500 });
  } finally {
    if (conn) conn.release();
  }
}
