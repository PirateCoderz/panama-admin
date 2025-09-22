import { NextResponse } from "next/server";
import { mysqlPool } from "@/lib/mysql";

// GET all exclusive deals
export async function GET() {
  try {
    const [rows] = await mysqlPool.query("SELECT * FROM exclusive_deals ORDER BY id ASC");
    return NextResponse.json({ ok: true, deals: rows });
  } catch (err) {
    console.error("Error fetching exclusive_deals:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch deals" }, { status: 500 });
  }
}

// PATCH update a single deal
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, featured_image, destination, from_location, price } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: "ID is required" }, { status: 400 });
    }

    await mysqlPool.query(
      "UPDATE exclusive_deals SET featured_image=?, destination=?, from_location=?, price=? WHERE id=?",
      [featured_image, destination, from_location, price, id]
    );

    return NextResponse.json({ ok: true, message: "Exclusive Deal updated successfully" });
  } catch (err) {
    console.error("Error updating exclusive_deals:", err);
    return NextResponse.json({ ok: false, error: "Failed to update deal" }, { status: 500 });
  }
}
