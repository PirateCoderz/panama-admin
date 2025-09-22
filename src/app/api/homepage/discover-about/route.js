import { NextResponse } from "next/server";
import { mysqlPool } from "@/lib/mysql";

// GET discover_about with items
export async function GET() {
  try {
    const [aboutRows] = await mysqlPool.query("SELECT * FROM discover_about LIMIT 1");
    const [itemsRows] = await mysqlPool.query(
      "SELECT * FROM discover_about_items WHERE discover_id = ? ORDER BY id ASC",
      [aboutRows[0]?.id || 0]
    );

    return NextResponse.json({
      ok: true,
      about: aboutRows[0] || null,
      items: itemsRows || [],
    });
  } catch (err) {
    console.error("Error fetching discover_about:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch Discover About" }, { status: 500 });
  }
}

// PATCH update discover_about
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, heading, description } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: "ID is required" }, { status: 400 });
    }

    await mysqlPool.query(
      "UPDATE discover_about SET heading=?, description=? WHERE id=?",
      [heading, description, id]
    );

    return NextResponse.json({ ok: true, message: "Discover About updated successfully" });
  } catch (err) {
    console.error("Error updating discover_about:", err);
    return NextResponse.json({ ok: false, error: "Failed to update Discover About" }, { status: 500 });
  }
}
