"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function TestimonialsGooglePage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await axios.get("/api/homepage/testimonials-google");
      if (res.data.ok) setTestimonials(res.data.testimonials);
    } catch {
      Swal.fire("Error", "Failed to fetch Google testimonials", "error");
    } finally {
      setLoading(false);
    }
  };

  const saveTestimonial = async (t) => {
    setSavingId(t.id);
    try {
      const res = await axios.patch("/api/homepage/testimonials-google", t);
      if (res.data.ok) {
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Google testimonial updated successfully",
          timer: 1200,
          showConfirmButton: false,
        });
      }
    } catch {
      Swal.fire("Error", "Failed to update testimonial", "error");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Edit Google Testimonials</h1>

      <div className="grid gap-6">
        {testimonials.map((t) => (
          <div key={t.id} className="border p-4 rounded-md shadow-sm bg-white">
            <h2 className="font-semibold mb-3">Testimonial #{t.id}</h2>

            <label className="block text-sm font-medium mb-1">Customer Name</label>
            <input
              type="text"
              value={t.customer_name}
              onChange={(e) =>
                setTestimonials(
                  testimonials.map((ts) =>
                    ts.id === t.id ? { ...ts, customer_name: e.target.value } : ts
                  )
                )
              }
              className="border px-3 py-2 rounded-md w-full mb-3"
            />

            <label className="block text-sm font-medium mb-1">Rating (1–5)</label>
            <input
              type="number"
              min="1"
              max="5"
              value={t.rating}
              onChange={(e) =>
                setTestimonials(
                  testimonials.map((ts) =>
                    ts.id === t.id ? { ...ts, rating: e.target.value } : ts
                  )
                )
              }
              className="border px-3 py-2 rounded-md w-full mb-3"
            />

            <label className="block text-sm font-medium mb-1">Published Date</label>
            <input
              type="date"
              value={t.published_date?.split("T")[0] || ""}
              onChange={(e) =>
                setTestimonials(
                  testimonials.map((ts) =>
                    ts.id === t.id ? { ...ts, published_date: e.target.value } : ts
                  )
                )
              }
              className="border px-3 py-2 rounded-md w-full mb-3"
            />

            <label className="block text-sm font-medium mb-1">Testimonial Text</label>
            <textarea
              value={t.testimonial_text}
              onChange={(e) =>
                setTestimonials(
                  testimonials.map((ts) =>
                    ts.id === t.id ? { ...ts, testimonial_text: e.target.value } : ts
                  )
                )
              }
              className="border px-3 py-2 rounded-md w-full mb-3"
            />

            <label className="block text-sm font-medium mb-1">Google Link</label>
            <input
              type="url"
              value={t.google_link}
              onChange={(e) =>
                setTestimonials(
                  testimonials.map((ts) =>
                    ts.id === t.id ? { ...ts, google_link: e.target.value } : ts
                  )
                )
              }
              className="border px-3 py-2 rounded-md w-full mb-3"
            />

            <button
              onClick={() => saveTestimonial(t)}
              disabled={savingId === t.id}
              className="px-5 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
            >
              {savingId === t.id ? "Saving..." : "Save"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
