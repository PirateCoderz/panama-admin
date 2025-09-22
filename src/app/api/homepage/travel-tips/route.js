import { NextResponse } from "next/server";
import { mysqlPool } from "@/lib/mysql";

// ✅ GET all 10 travel tips
export async function GET() {
  try {
    const [rows] = await mysqlPool.query(
      "SELECT * FROM travel_tips ORDER BY id ASC"
    );

    return NextResponse.json({ ok: true, tips: rows });
  } catch (err) {
    console.error("Error fetching travel tips:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch travel tips" },
      { status: 500 }
    );
  }
}

// ✅ PATCH a single travel tip
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, tip_heading, tip_detail } = body;

    if (!id || id < 1 || id > 10) {
      return NextResponse.json(
        { ok: false, error: "Invalid tip ID (must be between 1–10)" },
        { status: 400 }
      );
    }

    await mysqlPool.query(
      "UPDATE travel_tips SET tip_heading=?, tip_detail=? WHERE id=?",
      [tip_heading, tip_detail, id]
    );

    return NextResponse.json({ ok: true, message: "Travel tip updated successfully" });
  } catch (err) {
    console.error("Error updating travel tip:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to update travel tip" },
      { status: 500 }
    );
  }
}
