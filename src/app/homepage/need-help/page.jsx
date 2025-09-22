"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function NeedHelpPage() {
  const [data, setData] = useState({ heading: "", paragraph: "", cta_text: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchNeedHelp();
  }, []);

  const fetchNeedHelp = async () => {
    try {
      const res = await axios.get("/api/homepage/need-help");
      if (res.data.ok) setData(res.data.data);
    } catch {
      Swal.fire("Error", "Failed to fetch Need Help data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.patch("/api/homepage/need-help", data);
      if (res.data.ok) {
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Need Help section updated successfully",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          window.location.href = "/homepage"; // redirect after success
        });
      } else {
        Swal.fire("Error", res.data.error || "Failed to update", "error");
      }
    } catch {
      Swal.fire("Error", "Something went wrong", "error");
    } finally {
      setSaving(false);
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
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Edit Need Help Section</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Heading</label>
          <input
            type="text"
            value={data.heading}
            onChange={(e) => setData({ ...data, heading: e.target.value })}
            className="border px-3 py-2 rounded-md w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Paragraph</label>
          <textarea
            rows="3"
            value={data.paragraph}
            onChange={(e) => setData({ ...data, paragraph: e.target.value })}
            className="border px-3 py-2 rounded-md w-full"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">CTA Text</label>
          <input
            type="text"
            value={data.cta_text}
            onChange={(e) => setData({ ...data, cta_text: e.target.value })}
            className="border px-3 py-2 rounded-md w-full"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-6 px-5 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
