import { NextResponse } from "next/server";
import { mysqlPool } from "@/lib/mysql";

// GET all dream destinations
export async function GET() {
  try {
    const [rows] = await mysqlPool.query(
      "SELECT * FROM dream_destinations ORDER BY id ASC"
    );
    return NextResponse.json({ ok: true, data: rows });
  } catch (err) {
    console.error("Error fetching dream_destinations:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch" },
      { status: 500 }
    );
  }
}

// PATCH update one dream destination
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, featured_image, destination_name, price, description } = body;

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "ID required" },
        { status: 400 }
      );
    }

    await mysqlPool.query(
      "UPDATE dream_destinations SET featured_image = ?, destination_name = ?, price = ?, description = ? WHERE id = ?",
      [featured_image, destination_name, price, description, id]
    );

    return NextResponse.json({ ok: true, message: "Updated successfully" });
  } catch (err) {
    console.error("Error updating dream_destinations:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to update" },
      { status: 500 }
    );
  }
}
