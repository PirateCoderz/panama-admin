"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function TravelTipsPage() {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    try {
      const res = await axios.get("/api/homepage/travel-tips");
      if (res.data.ok) {
        setTips(res.data.tips);
      }
    } catch {
      Swal.fire("Error", "Failed to fetch travel tips", "error");
    } finally {
      setLoading(false);
    }
  };

  const saveTip = async (tip) => {
    setSavingId(tip.id);
    try {
      const res = await axios.patch("/api/homepage/travel-tips", tip);
      if (res.data.ok) {
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Travel tip updated successfully",
          timer: 1200,
          showConfirmButton: false,
        });
      }
    } catch {
      Swal.fire("Error", "Failed to update tip", "error");
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
      <h1 className="text-2xl font-bold mb-6">Edit Travel Tips</h1>

      <div className="grid gap-6">
        {tips.map((t) => (
          <div key={t.id} className="border p-4 rounded-md shadow-sm bg-white">
            <h2 className="font-semibold mb-3">Tip #{t.id}</h2>

            <label className="block text-sm font-medium mb-1">Heading</label>
            <input
              type="text"
              value={t.tip_heading}
              onChange={(e) =>
                setTips(
                  tips.map((tip) =>
                    tip.id === t.id ? { ...tip, tip_heading: e.target.value } : tip
                  )
                )
              }
              className="border px-3 py-2 rounded-md w-full mb-3"
            />

            <label className="block text-sm font-medium mb-1">Detail</label>
            <textarea
              value={t.tip_detail}
              onChange={(e) =>
                setTips(
                  tips.map((tip) =>
                    tip.id === t.id ? { ...tip, tip_detail: e.target.value } : tip
                  )
                )
              }
              className="border px-3 py-2 rounded-md w-full mb-3"
              rows="3"
            />

            <button
              onClick={() => saveTip(t)}
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
