import { NextResponse } from "next/server";
import { mysqlPool } from "@/lib/mysql";

// PATCH update a discover_about_item
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, item_heading, item_description, icon } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: "Item ID is required" }, { status: 400 });
    }

    await mysqlPool.query(
      "UPDATE discover_about_items SET item_heading=?, item_description=?, icon=? WHERE id=?",
      [item_heading, item_description, icon, id]
    );

    return NextResponse.json({ ok: true, message: "Item updated successfully" });
  } catch (err) {
    console.error("Error updating discover_about_items:", err);
    return NextResponse.json({ ok: false, error: "Failed to update item" }, { status: 500 });
  }
}
