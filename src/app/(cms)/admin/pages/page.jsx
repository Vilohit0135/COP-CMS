"use client";

import { useEffect, useState } from "react";
import { callApi } from "@/lib/apiClient";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PagesListPage() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  //   useEffect(() => {
  //     fetchPages();
  //   }, []);

  const fetchPages = async () => {
    try {
      const res = await callApi("/api/admin/pages", { auth: true });
      const data = await res.json();
      setPages(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching pages:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchPages();
    };

    loadData();
  }, [])
  const handleDelete = async (slug) => {
    if (!confirm(`Delete page "${slug}"?`)) return;

    try {
      const res = await fetch(`/api/admin/pages/${slug}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Page deleted successfully");
        setPages(pages.filter((p) => p.slug !== slug));
      } else {
        alert("Failed to delete page");
      }
    } catch (error) {
      console.error("Error deleting page:", error);
      alert("Error deleting page");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Loading pages...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-gray-800">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pages</h1>
            <p className="text-gray-600 mt-1">
              Create and manage custom pages with dynamic sections
            </p>
          </div>
          <Link
            href="/admin/pages/new"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            + Create Page
          </Link>
        </div>

        {/* Pages Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden text-gray-800">
          {pages.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-4">No pages yet</p>
              <Link
                href="/admin/pages/new"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Create your first page
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Sections
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pages.map((page) => (
                  <tr key={page._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {page.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <code className="bg-gray-100 px-2 py-1 rounded">
                        {page.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                        {page.sections.length} sections
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${page.isPublished
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                          }`}
                      >
                        {page.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <Link
                        href={`/admin/pages/${page.slug}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(page.slug)}
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
