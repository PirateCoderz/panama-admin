"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function WhyChooseUsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get("/api/homepage/why-choose-us");
      if (res.data.ok) setItems(res.data.data);
    } catch {
      Swal.fire("Error", "Failed to fetch data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (item) => {
    setSavingId(item.id);
    try {
      const res = await axios.patch("/api/homepage/why-choose-us", item);
      if (res.data.ok) {
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Data updated successfully",
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
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Edit Why Choose Us</h1>

      <div className="grid gap-6">
        {items.map((item, idx) => (
          <div key={item.id} className="border p-5 rounded-md shadow-sm bg-white">
            <h2 className="font-semibold mb-4">Item #{idx + 1}</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Heading</label>
              <input
                type="text"
                value={item.heading}
                onChange={(e) =>
                  setItems(
                    items.map((it) =>
                      it.id === item.id ? { ...it, heading: e.target.value } : it
                    )
                  )
                }
                className="border px-3 py-2 rounded-md w-full"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Sentence</label>
              <textarea
                rows="3"
                value={item.sentence}
                onChange={(e) =>
                  setItems(
                    items.map((it) =>
                      it.id === item.id ? { ...it, sentence: e.target.value } : it
                    )
                  )
                }
                className="border px-3 py-2 rounded-md w-full"
              ></textarea>
            </div>

            <button
              onClick={() => handleSave(item)}
              disabled={savingId === item.id}
              className="mt-2 px-5 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
            >
              {savingId === item.id ? "Saving..." : "Save"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
