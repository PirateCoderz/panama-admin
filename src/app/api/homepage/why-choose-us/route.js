import { NextResponse } from "next/server";
import { mysqlPool } from "@/lib/mysql";

// GET all records
export async function GET() {
  try {
    const [rows] = await mysqlPool.query(
      "SELECT * FROM why_choose_us ORDER BY id ASC"
    );
    return NextResponse.json({ ok: true, data: rows });
  } catch (err) {
    console.error("Error fetching why_choose_us:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch" },
      { status: 500 }
    );
  }
}

// PATCH update one record
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, heading, sentence } = body;

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "ID required" },
        { status: 400 }
      );
    }

    await mysqlPool.query(
      "UPDATE why_choose_us SET heading = ?, sentence = ? WHERE id = ?",
      [heading, sentence, id]
    );

    return NextResponse.json({ ok: true, message: "Updated successfully" });
  } catch (err) {
    console.error("Error updating why_choose_us:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to update" },
      { status: 500 }
    );
  }
}
