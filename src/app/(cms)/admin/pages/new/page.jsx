"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { callApi } from "@/lib/apiClient";

export default function CreatePagePage() {
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.title || !formData.slug) {
      setError("Title and slug are required");
      setLoading(false);
      return;
    }

    try {
      const res = await callApi("/api/admin/pages", {
        method: "POST",
        auth: true,
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/admin/pages/${data.slug}`);
      } else {
        setError(data.error || "Failed to create page");
      }
    } catch (err) {
      console.error("Error creating page:", err);
      setError("Error creating page");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <Link
          href="/admin/pages"
          className="text-blue-600 hover:text-blue-700 font-medium mb-6 inline-block"
        >
          ← Back to Pages
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Page</h1>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Page Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="e.g., About Us, Services, Contact"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Page Slug *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-2 text-gray-600">/</span>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slug: e.target.value
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                        .replace(/[^\w-]+/g, ""),
                    })
                  }
                  placeholder="auto-generated-from-title text-gray-800"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Auto-generated from title. Used in the page URL.
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Optional description for this page"
                rows="3"
                className="w-full px-4 py-2 border text-gray-800 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
              >
                {loading ? "Creating..." : "Create Page"}
              </button>
              <Link
                href="/admin/pages"
                className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
