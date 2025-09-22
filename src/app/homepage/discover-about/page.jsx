"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function DiscoverAboutPage() {
  const [about, setAbout] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get("/api/homepage/discover-about");
      if (res.data.ok) {
        setAbout(res.data.about);
        setItems(res.data.items);
      }
    } catch {
      Swal.fire("Error", "Failed to fetch Discover About", "error");
    } finally {
      setLoading(false);
    }
  };

  const saveAbout = async () => {
    try {
      const res = await axios.patch("/api/homepage/discover-about", about);
      if (res.data.ok) {
        Swal.fire("Updated!", "Discover About updated successfully", "success");
      }
    } catch {
      Swal.fire("Error", "Failed to update Discover About", "error");
    }
  };

  const saveItem = async (item) => {
    setSavingId(item.id);
    try {
      const res = await axios.patch("/api/homepage/discover-about/items", item);
      if (res.data.ok) {
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Item updated successfully",
          timer: 1200,
          showConfirmButton: false,
        });
      }
    } catch {
      Swal.fire("Error", "Failed to update item", "error");
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
      <h1 className="text-2xl font-bold mb-6">Edit Discover About</h1>

      {/* About Section */}
      {about && (
        <div className="mb-10 border p-4 rounded-md bg-white shadow-sm">
          <h2 className="font-semibold mb-3">Main Section</h2>
          <label className="block text-sm font-medium mb-1">Heading</label>
          <input
            type="text"
            value={about.heading}
            onChange={(e) => setAbout({ ...about, heading: e.target.value })}
            className="border px-3 py-2 rounded-md w-full mb-3"
          />
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={about.description}
            onChange={(e) => setAbout({ ...about, description: e.target.value })}
            className="border px-3 py-2 rounded-md w-full mb-3"
            rows="3"
          />
          <button
            onClick={saveAbout}
            className="px-5 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
          >
            Save About
          </button>
        </div>
      )}

      {/* Items Section */}
      <h2 className="text-xl font-bold mb-4">Timeline Items</h2>
      <div className="grid gap-6">
        {items.map((item) => (
          <div key={item.id} className="border p-4 rounded-md shadow-sm bg-white">
            <h3 className="font-semibold mb-3">Item #{item.id}</h3>

            <label className="block text-sm font-medium mb-1">Heading</label>
            <input
              type="text"
              value={item.item_heading}
              onChange={(e) =>
                setItems(
                  items.map((i) => (i.id === item.id ? { ...i, item_heading: e.target.value } : i))
                )
              }
              className="border px-3 py-2 rounded-md w-full mb-3"
            />

            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={item.item_description}
              onChange={(e) =>
                setItems(
                  items.map((i) =>
                    i.id === item.id ? { ...i, item_description: e.target.value } : i
                  )
                )
              }
              className="border px-3 py-2 rounded-md w-full mb-3"
              rows="2"
            />

            {/* <label className="block text-sm font-medium mb-1">Color</label>
            <input
              type="text"
              value={item.color}
              onChange={(e) =>
                setItems(
                  items.map((i) => (i.id === item.id ? { ...i, color: e.target.value } : i))
                )
              }
              className="border px-3 py-2 rounded-md w-full mb-3"
            /> */}

            <label className="block text-sm font-medium mb-1">Icon</label>
            <input
              type="text"
              value={item.icon}
              onChange={(e) =>
                setItems(
                  items.map((i) => (i.id === item.id ? { ...i, icon: e.target.value } : i))
                )
              }
              className="border px-3 py-2 rounded-md w-full mb-3"
            />

            <button
              onClick={() => saveItem(item)}
              disabled={savingId === item.id}
              className="px-5 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
            >
              {savingId === item.id ? "Saving..." : "Save Item"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
