"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function TrendingSecondPage() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const res = await axios.get("/api/homepage/trending-second");
      if (res.data.ok) {
        setCountries(res.data.countries);
      }
    } catch {
      Swal.fire("Error", "Failed to fetch trending countries (second)", "error");
    } finally {
      setLoading(false);
    }
  };

  const saveCountry = async (country) => {
    setSavingId(country.id);
    try {
      const res = await axios.patch("/api/homepage/trending-second", country);
      if (res.data.ok) {
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Trending country (second) updated successfully",
          timer: 1200,
          showConfirmButton: false,
        });
      }
    } catch {
      Swal.fire("Error", "Failed to update country", "error");
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
    <div className="max-w-6xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Edit Trending Countries (Second Section)</h1>

      <div className="grid gap-6">
        {countries.map((c) => (
          <div key={c.id} className="border p-4 rounded-md shadow-sm bg-white">
            <h2 className="font-semibold mb-3">Country #{c.id}</h2>

            <label className="block text-sm font-medium mb-1">Location Name</label>
            <input
              type="text"
              value={c.location_name}
              onChange={(e) =>
                setCountries(
                  countries.map((co) =>
                    co.id === c.id ? { ...co, location_name: e.target.value } : co
                  )
                )
              }
              className="border px-3 py-2 rounded-md w-full mb-3"
            />

            <label className="block text-sm font-medium mb-1">Country Name</label>
            <input
              type="text"
              value={c.country_name}
              onChange={(e) =>
                setCountries(
                  countries.map((co) =>
                    co.id === c.id ? { ...co, country_name: e.target.value } : co
                  )
                )
              }
              className="border px-3 py-2 rounded-md w-full mb-3"
            />

            <label className="block text-sm font-medium mb-1">ISO Code</label>
            <input
              type="text"
              value={c.iso_code}
              onChange={(e) =>
                setCountries(
                  countries.map((co) =>
                    co.id === c.id ? { ...co, iso_code: e.target.value } : co
                  )
                )
              }
              className="border px-3 py-2 rounded-md w-full mb-3"
            />

            <label className="block text-sm font-medium mb-1">Featured Image URL</label>
            <input
              type="text"
              value={c.featured_image}
              onChange={(e) =>
                setCountries(
                  countries.map((co) =>
                    co.id === c.id ? { ...co, featured_image: e.target.value } : co
                  )
                )
              }
              className="border px-3 py-2 rounded-md w-full mb-3"
            />

            <label className="block text-sm font-medium mb-1">Price per Person</label>
            <input
              type="number"
              value={c.price_per_person}
              onChange={(e) =>
                setCountries(
                  countries.map((co) =>
                    co.id === c.id ? { ...co, price_per_person: e.target.value } : co
                  )
                )
              }
              className="border px-3 py-2 rounded-md w-full mb-3"
            />

            <button
              onClick={() => saveCountry(c)}
              disabled={savingId === c.id}
              className="px-5 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
            >
              {savingId === c.id ? "Saving..." : "Save"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
