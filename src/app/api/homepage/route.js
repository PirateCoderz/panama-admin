// /src/app/api/homepage/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import mysqlPool from "@/lib/mysql";

// --- Simple in-memory cache ---
let homepageCache = null;
let lastUpdated = null;

async function fetchHomepageData() {
  let conn;
  try {
    conn = await mysqlPool.getConnection();

    const [sections] = await conn.query(
      "SELECT section_key, section_name FROM homepage_sections WHERE is_active=1 ORDER BY sort_order"
    );

    const responseData = {};

    for (const section of sections) {
      switch (section.section_key) {
        case "about_panama": {
          const [rows] = await conn.query("SELECT * FROM about_panama");
          responseData.about_panama = rows[0] || {};
          break;
        }
        case "popular_flights": {
          const [rows] = await conn.query("SELECT * FROM popular_flights");
          responseData.popular_flights = rows;
          break;
        }
        case "why_choose_us": {
          const [rows] = await conn.query("SELECT * FROM why_choose_us");
          responseData.why_choose_us = rows;
          break;
        }
        case "dream_destinations": {
          const [rows] = await conn.query("SELECT * FROM dream_destinations");
          responseData.dream_destinations = rows;
          break;
        }
        case "need_help": {
          const [rows] = await conn.query("SELECT * FROM need_help");
          responseData.need_help = rows[0] || {};
          break;
        }
        case "exclusive_deals": {
          const [rows] = await conn.query("SELECT * FROM exclusive_deals");
          responseData.exclusive_deals = rows;
          break;
        }
        case "discover_about": {
          const [rows] = await conn.query("SELECT * FROM discover_about");
          const [items] = await conn.query("SELECT * FROM discover_about_items");
          responseData.discover_about = {
            ...(rows[0] || {}),
            items,
          };
          break;
        }
        case "trending_countries_first": {
          const [rows] = await conn.query("SELECT * FROM trending_countries_first");
          responseData.trending_first = rows;
          break;
        }
        case "trending_countries_second": {
          const [rows] = await conn.query("SELECT * FROM trending_countries_second");
          responseData.trending_second = rows;
          break;
        }
        case "travel_tips": {
          const [rows] = await conn.query("SELECT * FROM travel_tips");
          responseData.travel_tips = rows;
          break;
        }
        case "testimonials_feefo": {
          const [rows] = await conn.query("SELECT * FROM testimonials_feefo");
          responseData.testimonials_feefo = rows;
          break;
        }
        case "testimonials_google": {
          const [rows] = await conn.query("SELECT * FROM testimonials_google");
          responseData.testimonials_google = rows;
          break;
        }
        default:
          break;
      }
    }

    return responseData;
  } finally {
    if (conn) conn.release();
  }
}

// --- GET: Serve from cache (or fetch once) ---
export async function GET() {
  try {
    if (homepageCache) {
      return NextResponse.json({
        ok: true,
        cached: true,
        lastUpdated,
        data: homepageCache,
      });
    }

    const freshData = await fetchHomepageData();
    homepageCache = freshData;
    lastUpdated = new Date();

    return NextResponse.json({
      ok: true,
      cached: false,
      lastUpdated,
      data: homepageCache,
    });
  } catch (e) {
    console.error("[GET /api/homepage] Error:", e);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch homepage data" },
      { status: 500 }
    );
  }
}

// --- POST: Force re-fetch & update cache immediately ---
export async function POST() {
  try {
    const freshData = await fetchHomepageData();
    homepageCache = freshData;
    lastUpdated = new Date();

    return NextResponse.json({
      ok: true,
      recached: true,
      lastUpdated,
      data: homepageCache,
      message: "Homepage cache refreshed successfully.",
    });
  } catch (e) {
    console.error("[POST /api/homepage] Error:", e);
    return NextResponse.json(
      { ok: false, error: "Failed to refresh homepage cache" },
      { status: 500 }
    );
  }
}
