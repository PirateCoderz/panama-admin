import { NextResponse } from "next/server";
import { mysqlPool } from "@/lib/mysql";

// ✅ GET all trending_countries_second
export async function GET() {
  try {
    const [rows] = await mysqlPool.query(
      "SELECT * FROM trending_countries_second ORDER BY id ASC"
    );

    return NextResponse.json({ ok: true, countries: rows });
  } catch (err) {
    console.error("Error fetching trending_countries_second:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch trending countries (second)" },
      { status: 500 }
    );
  }
}

// ✅ PATCH update a single record
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, location_name, country_name, iso_code, featured_image, price_per_person } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: "ID is required" }, { status: 400 });
    }

    await mysqlPool.query(
      "UPDATE trending_countries_second SET location_name=?, country_name=?, iso_code=?, featured_image=?, price_per_person=? WHERE id=?",
      [location_name, country_name, iso_code, featured_image, price_per_person, id]
    );

    return NextResponse.json({ ok: true, message: "Trending country (second) updated successfully" });
  } catch (err) {
    console.error("Error updating trending_countries_second:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to update trending country (second)" },
      { status: 500 }
    );
  }
}
