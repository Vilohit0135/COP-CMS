"use client";

import { useEffect, useState } from "react";

export default function DegreeTypesPage() {
  const [degreeTypes, setDegreeTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    order: 0,
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
  /* Fetch Degree Types */
  /* ---------------------------------- */
  const fetchDegreeTypes = async () => {
    try {
      const res = await fetch("/api/admin/degree-types", {
        cache: "no-store",
      });

      const data = await res.json();
      setDegreeTypes(data);
    } catch (err) {
      console.error("Error fetching degree types", err);
    }
  };

    useEffect(() => {
    const loadData = async () => {
        await fetchDegreeTypes();
    };

    loadData();
    }, []);

  /* ---------------------------------- */
  /* Create */
  /* ---------------------------------- */
  const handleCreate = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Name is required!");
      return;
    }

    setLoading(true);

    await fetch("/api/admin/degree-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    setFormData({
      name: "",
      slug: "",
      order: 0,
      isActive: true,
    });

    setLoading(false);
    fetchDegreeTypes();
  };

  /* ---------------------------------- */
  /* Edit */
  /* ---------------------------------- */
  const handleEdit = (degree) => {
    setEditingId(degree._id);
    setFormData({
      name: degree.name,
      slug: degree.slug,
      order: degree.order,
      isActive: degree.isActive,
    });
  };

  const handleUpdate = async (id) => {
    if (!formData.name.trim()) {
      alert("Name is required!");
      return;
    }

    setLoading(true);

    await fetch(`/api/admin/degree-types/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    setEditingId(null);
    setLoading(false);
    fetchDegreeTypes();
  };

  /* ---------------------------------- */
  /* Delete */
  /* ---------------------------------- */
  const handleDelete = async (id) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this degree type?"
    );
    if (!confirmDelete) return;

    await fetch(`/api/admin/degree-types/${id}`, {
      method: "DELETE",
    });

    fetchDegreeTypes();
  };

  return (
    <div className="max-w-7xl mx-auto p-3  text-gray-800">

      <h1 className="text-2xl font-bold mb-6">Degree Types</h1>

      {/* ---------------------------------- */}
      {/* Create Form */}
      {/* ---------------------------------- */}
      <form
        onSubmit={handleCreate}
        className="bg-white p-6 rounded-xl shadow mb-8 space-y-4  text-gray-800"
      >
        <div className="flex gap-4">

          {/* Name */}
          <input
            type="text"
            placeholder="Enter degree type name"
            value={formData.name}
            onChange={(e) => {
              const nameValue = e.target.value;

              setFormData({
                ...formData,
                name: nameValue,
                slug: generateSlug(nameValue),
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

          {/* Order */}
          <input
            type="number"
            value={formData.order}
            onChange={(e) =>
              setFormData({
                ...formData,
                order: Number(e.target.value),
              })
            }
            className="w-24 border px-4 py-2 rounded-md"
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
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">Active</span>
          </label>

        </div>

        <button
          type="submit"
          disabled={!formData.name.trim() || loading}
          className={`px-6 py-2 rounded-md ${
            formData.name.trim()
              ? "bg-black text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {loading ? "Creating..." : "Add Degree Type"}
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
              <th className="p-4">Order</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {degreeTypes.map((degree) => (
              <tr
                key={degree._id}
                className="border-b hover:bg-gray-50"
              >
                {/* Name */}
                <td className="p-4 font-medium">
                  {editingId === degree._id ? (
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
                    degree.name
                  )}
                </td>

                {/* Slug */}
                <td className="p-4">
                  {editingId === degree._id ? (
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
                    degree.slug
                  )}
                </td>

                {/* Order */}
                <td className="p-4">
                  {editingId === degree._id ? (
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          order: Number(e.target.value),
                        })
                      }
                      className="border px-2 py-1 rounded w-20"
                    />
                  ) : (
                    degree.order
                  )}
                </td>

                {/* Status/Active Toggle */}
                <td className="p-4">
                  {editingId === degree._id ? (
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
                      degree.isActive
                        ? "bg-green-100 text-gray-900"
                        : "bg-gray-200 text-gray-800"
                    }`}>
                      {degree.isActive ? "Active" : "Inactive"}
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="p-4 flex gap-4">
                  {editingId === degree._id ? (
                    <>
                      <button
                        onClick={() => handleUpdate(degree._id)}
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
                        onClick={() => handleEdit(degree)}
                        className="text-blue-600 font-medium"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(degree._id)}
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

        {degreeTypes.length === 0 && (
          <div className="p-6 text-gray-500 text-center">
            No Degree Types Found
          </div>
        )}
      </div>
    </div>
  );
}