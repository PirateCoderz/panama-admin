"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function AboutPage() {
  const [form, setForm] = useState({ heading: "", content: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchAbout();
  }, []);

  const fetchAbout = async () => {
    try {
      const res = await axios.get("/api/homepage/about");
      if (res.data.ok && res.data.about) {
        setForm({
          heading: res.data.about.heading || "",
          content: res.data.about.content || "",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load About Panama data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.patch("/api/homepage/about", form);
      if (res.data.ok) {
        await Swal.fire({
          icon: "success",
          title: "Saved!",
          text: "About Panama section updated successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
        router.push("/homepage");
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res.data.error || "Failed to save changes.",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong while saving.",
      });
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
    <div className="max-w-3xl mx-auto py-10 relative">
      <h1 className="text-2xl font-bold mb-6">Edit About Panama</h1>

      <div className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Heading</label>
          <input
            type="text"
            value={form.heading}
            onChange={(e) => setForm({ ...form, heading: e.target.value })}
            className="w-full border px-3 py-2 rounded-md"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Content</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full border px-3 py-2 rounded-md h-40"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {saving && (
        <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 flex justify-center items-center rounded-md">
          <div className="w-14 h-14 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
