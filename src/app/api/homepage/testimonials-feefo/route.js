import { NextResponse } from "next/server";
import { mysqlPool } from "@/lib/mysql";

// ✅ GET all testimonials
export async function GET() {
  try {
    const [rows] = await mysqlPool.query(
      "SELECT * FROM testimonials_feefo ORDER BY id ASC"
    );

    return NextResponse.json({ ok: true, testimonials: rows });
  } catch (err) {
    console.error("Error fetching Feefo testimonials:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch Feefo testimonials" },
      { status: 500 }
    );
  }
}

// ✅ PATCH update a single testimonial
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, rating, small_heading, short_sentence, customer_name, published_date } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: "ID is required" }, { status: 400 });
    }

    await mysqlPool.query(
      "UPDATE testimonials_feefo SET rating=?, small_heading=?, short_sentence=?, customer_name=?, published_date=? WHERE id=?",
      [rating, small_heading, short_sentence, customer_name, published_date, id]
    );

    return NextResponse.json({ ok: true, message: "Feefo testimonial updated successfully" });
  } catch (err) {
    console.error("Error updating Feefo testimonial:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to update Feefo testimonial" },
      { status: 500 }
    );
  }
}
