import { NextResponse } from "next/server";
import { mysqlPool } from "@/lib/mysql";

// GET Need Help data
export async function GET() {
  try {
    const [rows] = await mysqlPool.query("SELECT * FROM need_help WHERE id = 1");
    return NextResponse.json({ ok: true, data: rows[0] || null });
  } catch (err) {
    console.error("Error fetching need_help:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch" }, { status: 500 });
  }
}

// PATCH update Need Help data
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { heading, paragraph, cta_text } = body;

    await mysqlPool.query(
      "UPDATE need_help SET heading = ?, paragraph = ?, cta_text = ? WHERE id = 1",
      [heading, paragraph, cta_text]
    );

    return NextResponse.json({ ok: true, message: "Need Help updated successfully" });
  } catch (err) {
    console.error("Error updating need_help:", err);
    return NextResponse.json({ ok: false, error: "Failed to update" }, { status: 500 });
  }
}
