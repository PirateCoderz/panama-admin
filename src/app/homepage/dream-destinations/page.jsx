"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function DreamDestinationsPage() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      const res = await axios.get("/api/homepage/dream-destinations");
      if (res.data.ok) setDestinations(res.data.data);
    } catch {
      Swal.fire("Error", "Failed to fetch dream destinations", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (item) => {
    setSavingId(item.id);
    try {
      const res = await axios.patch("/api/homepage/dream-destinations", item);
      if (res.data.ok) {
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Dream destination updated successfully",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire("Error", res.data.error || "Failed to update", "error");
      }
    } catch {
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
    <div className="max-w-5xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Edit Dream Destinations</h1>

      <div className="grid gap-6">
        {destinations.map((d, idx) => (
          <div key={d.id} className="border p-5 rounded-md shadow-sm bg-white">
            <h2 className="font-semibold mb-4">Destination #{idx + 1}</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Destination Name</label>
              <input
                type="text"
                value={d.destination_name}
                onChange={(e) =>
                  setDestinations(
                    destinations.map((it) =>
                      it.id === d.id ? { ...it, destination_name: e.target.value } : it
                    )
                  )
                }
                className="border px-3 py-2 rounded-md w-full"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Featured Image URL</label>
              <input
                type="text"
                value={d.featured_image}
                onChange={(e) =>
                  setDestinations(
                    destinations.map((it) =>
                      it.id === d.id ? { ...it, featured_image: e.target.value } : it
                    )
                  )
                }
                className="border px-3 py-2 rounded-md w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Price</label>
                <input
                  type="number"
                  value={d.price}
                  onChange={(e) =>
                    setDestinations(
                      destinations.map((it) =>
                        it.id === d.id ? { ...it, price: e.target.value } : it
                      )
                    )
                  }
                  className="border px-3 py-2 rounded-md w-full"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                rows="3"
                value={d.description}
                onChange={(e) =>
                  setDestinations(
                    destinations.map((it) =>
                      it.id === d.id ? { ...it, description: e.target.value } : it
                    )
                  )
                }
                className="border px-3 py-2 rounded-md w-full"
              ></textarea>
            </div>

            <button
              onClick={() => handleSave(d)}
              disabled={savingId === d.id}
              className="mt-2 px-5 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
            >
              {savingId === d.id ? "Saving..." : "Save"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
