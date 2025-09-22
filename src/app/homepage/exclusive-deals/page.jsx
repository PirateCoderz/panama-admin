"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function ExclusiveDealsPage() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const res = await axios.get("/api/homepage/exclusive-deals");
      if (res.data.ok) setDeals(res.data.deals);
    } catch {
      Swal.fire("Error", "Failed to fetch exclusive deals", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (deal) => {
    setSavingId(deal.id);
    try {
      const res = await axios.patch("/api/homepage/exclusive-deals", deal);
      if (res.data.ok) {
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Deal updated successfully",
          timer: 1200,
          showConfirmButton: false,
        });
      } else {
        Swal.fire("Error", res.data.error || "Failed to update deal", "error");
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
    <div className="max-w-6xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Edit Exclusive Deals</h1>

      <div className="grid gap-6">
        {deals.map((d, idx) => (
          <div key={d.id} className="border p-4 rounded-md shadow-sm bg-white">
            <h2 className="font-semibold mb-3">Deal #{idx + 1}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Featured Image URL</label>
                <input
                  type="text"
                  value={d.featured_image}
                  onChange={(e) =>
                    setDeals(
                      deals.map((dl) =>
                        dl.id === d.id ? { ...dl, featured_image: e.target.value } : dl
                      )
                    )
                  }
                  className="border px-3 py-2 rounded-md w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Destination</label>
                <input
                  type="text"
                  value={d.destination}
                  onChange={(e) =>
                    setDeals(
                      deals.map((dl) =>
                        dl.id === d.id ? { ...dl, destination: e.target.value } : dl
                      )
                    )
                  }
                  className="border px-3 py-2 rounded-md w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">From Location</label>
                <input
                  type="text"
                  value={d.from_location}
                  onChange={(e) =>
                    setDeals(
                      deals.map((dl) =>
                        dl.id === d.id ? { ...dl, from_location: e.target.value } : dl
                      )
                    )
                  }
                  className="border px-3 py-2 rounded-md w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input
                  type="number"
                  value={d.price}
                  onChange={(e) =>
                    setDeals(
                      deals.map((dl) =>
                        dl.id === d.id ? { ...dl, price: e.target.value } : dl
                      )
                    )
                  }
                  className="border px-3 py-2 rounded-md w-full"
                />
              </div>
            </div>

            <button
              onClick={() => handleSave(d)}
              disabled={savingId === d.id}
              className="mt-4 px-5 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
            >
              {savingId === d.id ? "Saving..." : "Save"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
