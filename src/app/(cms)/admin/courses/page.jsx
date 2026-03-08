"use client";

import { useEffect, useState } from "react";
import { callApi } from "@/lib/apiClient";
import DegreeTypeSelect from "../components/DegreeTypeSelect";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    degreeTypeId: "",
    icon: "",
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
  /* Fetch Courses */
  /* ---------------------------------- */
  const fetchCourses = async () => {
    try {
      const res = await callApi("/api/admin/courses", {
        cache: "no-store",
        auth: true,
      });

      if (res.ok) {
        const data = await res.json();
        setCourses(Array.isArray(data) ? data : []);
      } else {
        console.error("Failed to fetch courses:", await res.text());
        setCourses([]);
      }
    } catch (err) {
      console.error("Error fetching courses", err);
      setCourses([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchCourses();
    };

    loadData();
  }, []);

  /* ---------------------------------- */
  /* Create */
  /* ---------------------------------- */
  const handleCreate = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Course name is required!");
      return;
    }

    if (!formData.degreeTypeId) {
      alert("Please select degree type!");
      return;
    }

    setLoading(true);

    await callApi("/api/admin/courses", {
      method: "POST",
      auth: true,
      body: formData,
    });

    setFormData({
      name: "",
      slug: "",
      degreeTypeId: "",
      icon: "",
      isActive: true,
    });

    setLoading(false);
    fetchCourses();
  };

  /* ---------------------------------- */
  /* Edit */
  /* ---------------------------------- */
  const handleEdit = (course) => {
    setEditingId(course._id);
    setFormData({
      name: course.name,
      slug: course.slug,
      degreeTypeId: course.degreeTypeId?._id || course.degreeTypeId,
      icon: course.icon || "",
      isActive: course.isActive,
    });
  };

  const handleUpdate = async (id) => {
    if (!formData.name.trim()) {
      alert("Course name is required!");
      return;
    }

    if (!formData.degreeTypeId) {
      alert("Please select degree type!");
      return;
    }

    setLoading(true);

    await callApi(`/api/admin/courses/${id}`, {
      method: "PUT",
      auth: true,
      body: formData,
    });

    setEditingId(null);
    setLoading(false);
    fetchCourses();
  };

  /* ---------------------------------- */
  /* Delete */
  /* ---------------------------------- */
  const handleDelete = async (id) => {
    const confirmDelete = confirm("Delete this course?");
    if (!confirmDelete) return;

    await callApi(`/api/admin/courses/${id}`, {
      method: "DELETE",
      auth: true,
    });

    fetchCourses();
  };

  return (
    <div className="max-w-7xl mx-auto p-3 text-gray-800">
      <h1 className="text-2xl font-bold mb-6">Courses</h1>

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
            placeholder="Course name"
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

          {/* Degree Type Dropdown */}
          <DegreeTypeSelect
            value={formData.degreeTypeId}
            onChange={(value) =>
              setFormData({ ...formData, degreeTypeId: value })
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
          {loading ? "Creating..." : "Add Course"}
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
              <th className="p-4">Degree Type</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {courses.map((course) => (
              <tr key={course._id} className="border-b hover:bg-gray-50">

                {/* Name */}
                <td className="p-4 font-medium">
                  {editingId === course._id ? (
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
                    course.name
                  )}
                </td>

                {/* Slug */}
                <td className="p-4">
                  {editingId === course._id ? (
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
                    course.slug
                  )}
                </td>

                {/* Degree Type */}
                <td className="p-4">
                  {editingId === course._id ? (
                    <DegreeTypeSelect
                      value={formData.degreeTypeId}
                      onChange={(value) =>
                        setFormData({
                          ...formData,
                          degreeTypeId: value,
                        })
                      }
                      required
                    />
                  ) : (
                    course.degreeTypeId?.name
                  )}
                </td>

                {/* Status */}
                <td className="p-4">
                  {editingId === course._id ? (
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
                    <span className={`px-3 py-1 rounded-full text-sm ${course.isActive
                        ? "bg-green-100 text-gray-900"
                        : "bg-gray-200 text-gray-800"
                      }`}>
                      {course.isActive ? "Active" : "Inactive"}
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="p-4 flex gap-4">
                  {editingId === course._id ? (
                    <>
                      <button
                        onClick={() => handleUpdate(course._id)}
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
                        onClick={() => handleEdit(course)}
                        className="text-blue-600 font-medium"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(course._id)}
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
      </div>
    </div>
  );
}