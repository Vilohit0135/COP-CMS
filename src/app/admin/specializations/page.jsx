"use client";

import { useEffect, useState } from "react";
import CourseSelect from "../components/CourseSelect";

export default function SpecializationsPage() {
  const [specializations, setSpecializations] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    courseId: "",
    isActive: true,
  });

  /* ---------------------------------- */
  /* Slug Generator */
  /* ---------------------------------- */
  const generateSlug = (value) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
  };

  /* ---------------------------------- */
  /* Fetch Specializations */
  /* ---------------------------------- */
  const fetchSpecializations = async () => {
    try {
      const res = await fetch("/api/admin/specialization", {
        cache: "no-store",
      });
      const data = await res.json();
      setSpecializations(data);
    } catch (err) {
      console.error("Error fetching specializations", err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchSpecializations();
    };

    loadData();
  }, []);

  /* ---------------------------------- */
  /* Create */
  /* ---------------------------------- */
  const handleCreate = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Specialization name is required!");
      return;
    }

    if (!formData.courseId) {
      alert("Please select a course!");
      return;
    }

    setLoading(true);

    await fetch("/api/admin/specialization", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    setFormData({
      name: "",
      slug: "",
      courseId: "",
      isActive: true,
    });

    setLoading(false);
    fetchSpecializations();
  };

  /* ---------------------------------- */
  /* Edit */
  /* ---------------------------------- */
  const handleEdit = (spec) => {
    setEditingId(spec._id);
    setFormData({
      name: spec.name,
      slug: spec.slug,
      courseId: spec.courseId?._id || spec.courseId,
      isActive: spec.isActive,
    });
  };

  const handleUpdate = async (id) => {
    if (!formData.name.trim()) {
      alert("Specialization name is required!");
      return;
    }

    if (!formData.courseId) {
      alert("Please select a course!");
      return;
    }

    setLoading(true);

    await fetch(`/api/admin/specialization/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    setEditingId(null);
    setLoading(false);
    fetchSpecializations();
  };

  /* ---------------------------------- */
  /* Delete */
  /* ---------------------------------- */
  const handleDelete = async (id) => {
    const confirmDelete = confirm("Delete this specialization?");
    if (!confirmDelete) return;

    await fetch(`/api/admin/specialization/${id}`, {
      method: "DELETE",
    });

    fetchSpecializations();
  };

  return (
    <div className="max-w-7xl mx-auto p-3 text-gray-800">
      <h1 className="text-2xl font-bold mb-6">Specializations</h1>

      {/* ---------------------------------- */}
      {/* Create Form */}
      {/* ---------------------------------- */}
      <form
        onSubmit={handleCreate}
        className="bg-white p-6 rounded-xl shadow mb-8 space-y-4"
      >
        <div className="flex gap-4">

          {/* Name */}
          <input
            type="text"
            placeholder="Specialization name"
            value={formData.name}
            onChange={(e) => {
              const value = e.target.value;
              setFormData({
                ...formData,
                name: value,
                slug: generateSlug(value),
              });
            }}
            className="flex-1 border px-4 py-2 rounded-md"
          />

          {/* Slug */}
          <input
            type="text"
            placeholder="slug"
            value={formData.slug}
            onChange={(e) =>
              setFormData({
                ...formData,
                slug: generateSlug(e.target.value),
              })
            }
            className="flex-1 border px-4 py-2 rounded-md bg-gray-50"
          />

          {/* Course Dropdown */}
          <CourseSelect
            value={formData.courseId}
            onChange={(value) =>
              setFormData({ ...formData, courseId: value })
            }
            required
          />

          {/* Active Toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  isActive: e.target.checked,
                })
              }
            />
            <span className="text-sm font-medium">Active</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 rounded-md bg-black text-white"
        >
          {loading ? "Creating..." : "Add Specialization"}
        </button>
      </form>

      {/* ---------------------------------- */}
      {/* Table */}
      {/* ---------------------------------- */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Slug</th>
              <th className="p-4">Course</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {specializations.map((spec) => (
              <tr key={spec._id} className="border-b hover:bg-gray-50">

                {/* Name */}
                <td className="p-4 font-medium">
                  {editingId === spec._id ? (
                    <input
                      value={formData.name}
                      onChange={(e) => {
                        const nameValue = e.target.value;
                        setFormData({
                          ...formData,
                          name: nameValue,
                          slug: generateSlug(nameValue),
                        });
                      }}
                      className="border px-2 py-1 rounded w-full"
                    />
                  ) : (
                    spec.name
                  )}
                </td>

                {/* Slug */}
                <td className="p-4">
                  {editingId === spec._id ? (
                    <input
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          slug: generateSlug(e.target.value),
                        })
                      }
                      className="border px-2 py-1 rounded w-full"
                    />
                  ) : (
                    spec.slug
                  )}
                </td>

                {/* Course */}
                <td className="p-4">
                  {editingId === spec._id ? (
                    <CourseSelect
                      value={formData.courseId}
                      onChange={(value) =>
                        setFormData({
                          ...formData,
                          courseId: value,
                        })
                      }
                      required
                    />
                  ) : (
                    spec.courseId?.name
                  )}
                </td>

                {/* Status */}
                <td className="p-4">
                  {editingId === spec._id ? (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isActive: e.target.checked,
                          })
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">Active</span>
                    </label>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      spec.isActive
                        ? "bg-green-100 text-gray-900"
                        : "bg-gray-200 text-gray-800"
                    }`}>
                      {spec.isActive ? "Active" : "Inactive"}
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="p-4 flex gap-4">
                  {editingId === spec._id ? (
                    <>
                      <button
                        onClick={() => handleUpdate(spec._id)}
                        className="text-gray-600 font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-gray-500"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(spec)}
                        className="text-blue-600 font-medium"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(spec._id)}
                        className="text-red-600 font-medium"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>

              </tr>
            ))}
          </tbody>
        </table>

        {specializations.length === 0 && (
          <div className="p-6 text-gray-500 text-center">
            No Specializations Found
          </div>
        )}
      </div>
    </div>
  );
}