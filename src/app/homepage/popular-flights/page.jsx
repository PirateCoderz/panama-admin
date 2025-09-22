"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function PopularFlightsPage() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    try {
      const res = await axios.get("/api/homepage/popular-flights");
      if (res.data.ok) setFlights(res.data.flights);
    } catch (err) {
      Swal.fire("Error", "Failed to fetch flights", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (flight) => {
    setSavingId(flight.id);
    try {
      const res = await axios.patch("/api/homepage/popular-flights", flight);
      if (res.data.ok) {
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Flight updated successfully",
          timer: 1200,
          showConfirmButton: false,
        });
      } else {
        Swal.fire("Error", res.data.error || "Failed to update flight", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Something went wrong", "error");
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
      <h1 className="text-3xl font-bold mb-8">Edit Popular Flights ✈️</h1>

      <div className="space-y-8">
        {flights.map((f, idx) => (
          <div
            key={f.id}
            className="border rounded-lg shadow-md bg-white p-6 hover:shadow-lg transition"
          >
            <h2 className="font-semibold text-lg mb-4 text-teal-700">
              Flight #{idx + 1}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card Heading */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Card Heading
                </label>
                <input
                  type="text"
                  value={f.card_heading}
                  onChange={(e) =>
                    setFlights(
                      flights.map((fl) =>
                        fl.id === f.id
                          ? { ...fl, card_heading: e.target.value }
                          : fl
                      )
                    )
                  }
                  className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Featured Image URL
                </label>
                <input
                  type="text"
                  value={f.featured_image}
                  onChange={(e) =>
                    setFlights(
                      flights.map((fl) =>
                        fl.id === f.id
                          ? { ...fl, featured_image: e.target.value }
                          : fl
                      )
                    )
                  }
                  className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Image Alt */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Image Alt Text
                </label>
                <input
                  type="text"
                  value={f.image_alt}
                  onChange={(e) =>
                    setFlights(
                      flights.map((fl) =>
                        fl.id === f.id
                          ? { ...fl, image_alt: e.target.value }
                          : fl
                      )
                    )
                  }
                  className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Image Title */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Image Title
                </label>
                <input
                  type="text"
                  value={f.image_title}
                  onChange={(e) =>
                    setFlights(
                      flights.map((fl) =>
                        fl.id === f.id
                          ? { ...fl, image_title: e.target.value }
                          : fl
                      )
                    )
                  }
                  className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Location 1 */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Location 1
                </label>
                <input
                  type="text"
                  value={f.location1}
                  onChange={(e) =>
                    setFlights(
                      flights.map((fl) =>
                        fl.id === f.id
                          ? { ...fl, location1: e.target.value }
                          : fl
                      )
                    )
                  }
                  className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Price 1 */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Price 1 (£)
                </label>
                <input
                  type="number"
                  value={f.price1}
                  onChange={(e) =>
                    setFlights(
                      flights.map((fl) =>
                        fl.id === f.id
                          ? { ...fl, price1: e.target.value }
                          : fl
                      )
                    )
                  }
                  className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Location 2 */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Location 2
                </label>
                <input
                  type="text"
                  value={f.location2}
                  onChange={(e) =>
                    setFlights(
                      flights.map((fl) =>
                        fl.id === f.id
                          ? { ...fl, location2: e.target.value }
                          : fl
                      )
                    )
                  }
                  className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Price 2 */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Price 2 (£)
                </label>
                <input
                  type="number"
                  value={f.price2}
                  onChange={(e) =>
                    setFlights(
                      flights.map((fl) =>
                        fl.id === f.id
                          ? { ...fl, price2: e.target.value }
                          : fl
                      )
                    )
                  }
                  className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <button
              onClick={() => handleSave(f)}
              disabled={savingId === f.id}
              className="mt-6 px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
            >
              {savingId === f.id ? "Saving..." : "Save"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
