import { NextResponse } from "next/server";
import { mysqlPool } from "@/lib/mysql";

// ✅ GET all Google testimonials
export async function GET() {
  try {
    const [rows] = await mysqlPool.query(
      "SELECT * FROM testimonials_google ORDER BY id ASC"
    );

    return NextResponse.json({ ok: true, testimonials: rows });
  } catch (err) {
    console.error("Error fetching Google testimonials:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch Google testimonials" },
      { status: 500 }
    );
  }
}

// ✅ PATCH update single testimonial
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, customer_name, rating, published_date, testimonial_text, google_link } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: "ID is required" }, { status: 400 });
    }

    await mysqlPool.query(
      "UPDATE testimonials_google SET customer_name=?, rating=?, published_date=?, testimonial_text=?, google_link=? WHERE id=?",
      [customer_name, rating, published_date, testimonial_text, google_link, id]
    );

    return NextResponse.json({ ok: true, message: "Google testimonial updated successfully" });
  } catch (err) {
    console.error("Error updating Google testimonial:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to update Google testimonial" },
      { status: 500 }
    );
  }
}
