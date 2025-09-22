import { NextResponse } from "next/server";
import mysqlPool from "@/lib/mysql";

// GET all flights
export async function GET() {
  let conn;
  try {
    conn = await mysqlPool.getConnection();
    const [rows] = await conn.query(`SELECT * FROM popular_flights ORDER BY id ASC`);
    return NextResponse.json({ ok: true, flights: rows });
  } catch (err) {
    console.error("GET /popular-flights error:", err);
    return NextResponse.json({ ok: false, error: "Failed to fetch flights" }, { status: 500 });
  } finally {
    if (conn) conn.release();
  }
}

// PATCH update one flight by id
export async function PATCH(req) {
  let conn;
  try {
    const body = await req.json();
    const { id, featured_image, image_alt, image_title, card_heading, location1, price1, location2, price2 } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: "Flight ID is required" }, { status: 400 });
    }

    conn = await mysqlPool.getConnection();
    await conn.query(
      `UPDATE popular_flights
       SET featured_image=?, image_alt=?, image_title=?, card_heading=?,
           location1=?, price1=?, location2=?, price2=?
       WHERE id=?`,
      [featured_image, image_alt, image_title, card_heading, location1, price1, location2, price2, id]
    );

    return NextResponse.json({ ok: true, message: "Flight updated successfully" });
  } catch (err) {
    console.error("PATCH /popular-flights error:", err);
    return NextResponse.json({ ok: false, error: "Failed to update flight" }, { status: 500 });
  } finally {
    if (conn) conn.release();
  }
}
