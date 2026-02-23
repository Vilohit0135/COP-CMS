"use client";

import { useEffect, useState } from "react";
import DegreeTypeSelect from "../components/DegreeTypeSelect";
import CourseSelect from "../components/CourseSelect";
import SpecializationSelect from "../components/SpecializationSelect";
import ProviderSelect from "../components/ProviderSelect";

export default function ProviderCoursesPage() {
  const [providerCourses, setProviderCourses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    degreeTypeId: "",
    courseId: "",
    specializationId: "",
    providerId: "",
    title: "",
    slug: "",
    fees: "",
    discountedFees: "",
    feesBreakdown: [],
    duration: "",
    eligibility: "",
    seatsAvailable: "",
    brochureUrl: "",
    weeklyEffort: "",
    examPattern: "",
    employerAcceptance: "Medium",
    difficultyLevel: "Intermediate",
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
  /* Fetch Provider Courses */
  /* ---------------------------------- */
  const fetchProviderCourses = async () => {
    try {
      const res = await fetch("/api/admin/provider-courses", {
        cache: "no-store",
      });
      const data = await res.json();
      setProviderCourses(data);
    } catch (err) {
      console.error("Error fetching provider courses", err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchProviderCourses();
    };

    loadData();
  }, []);

  /* ---------------------------------- */
  /* Create */
  /* ---------------------------------- */
  const handleCreate = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Title is required!");
      return;
    }

    if (!formData.courseId || !formData.degreeTypeId) {
      alert("Course & Degree Type are required!");
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      fees: formData.fees ? Number(formData.fees) : 0,
      discountedFees: formData.discountedFees ? Number(formData.discountedFees) : 0,
      weeklyEffort: formData.weeklyEffort ? Number(formData.weeklyEffort) : undefined,
      seatsAvailable: formData.seatsAvailable ? Number(formData.seatsAvailable) : undefined,
      feesBreakdown: (formData.feesBreakdown || []).map((f) => ({
        label: f.label,
        amount: f.amount ? Number(f.amount) : 0,
      })),
    };

    console.log("Creating provider-course payload:", payload);

    await fetch("/api/admin/provider-courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setFormData({
      degreeTypeId: "",
      courseId: "",
      specializationId: "",
      providerId: "",
      title: "",
      slug: "",
      fees: "",
      discountedFees: "",
      feesBreakdown: [],
      duration: "",
      eligibility: "",
      seatsAvailable: "",
      brochureUrl: "",
      weeklyEffort: "",
      examPattern: "",
      employerAcceptance: "Medium",
      difficultyLevel: "Intermediate",
      isActive: true,
    });

    setLoading(false);
    fetchProviderCourses();
  };

  /* ---------------------------------- */
  /* Edit */
  /* ---------------------------------- */
  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      degreeTypeId: item.degreeTypeId?._id || item.degreeTypeId,
      courseId: item.courseId?._id || item.courseId,
      specializationId: item.specializationId?._id || "",
      providerId: item.providerId?._id || item.providerId || "",
      feesBreakdown: item.feesBreakdown || [],
      weeklyEffort: item.weeklyEffort || "",
      examPattern: item.examPattern || "",
      employerAcceptance: item.employerAcceptance || "Medium",
      difficultyLevel: item.difficultyLevel || "Intermediate",
      title: item.title,
      slug: item.slug,
      fees: item.fees,
      discountedFees: item.discountedFees,
      duration: item.duration,
      eligibility: item.eligibility,
      seatsAvailable: item.seatsAvailable,
      brochureUrl: item.brochureUrl,
      isActive: item.isActive,
    });
  };

  const handleUpdate = async (id) => {
    if (!formData.title.trim()) {
      alert("Title is required!");
      return;
    }

    if (!formData.courseId || !formData.degreeTypeId) {
      alert("Course & Degree Type are required!");
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      fees: formData.fees ? Number(formData.fees) : 0,
      discountedFees: formData.discountedFees ? Number(formData.discountedFees) : 0,
      weeklyEffort: formData.weeklyEffort ? Number(formData.weeklyEffort) : undefined,
      seatsAvailable: formData.seatsAvailable ? Number(formData.seatsAvailable) : undefined,
      feesBreakdown: (formData.feesBreakdown || []).map((f) => ({
        label: f.label,
        amount: f.amount ? Number(f.amount) : 0,
      })),
    };

    console.log("Updating provider-course id", id, "payload:", payload);

    await fetch(`/api/admin/provider-courses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setEditingId(null);
    setLoading(false);
    fetchProviderCourses();
  };

  /* ---------------------------------- */
  /* Delete */
  /* ---------------------------------- */
  const handleDelete = async (id) => {
    const confirmDelete = confirm("Delete this provider course?");
    if (!confirmDelete) return;

    await fetch(`/api/admin/provider-courses/${id}`, {
      method: "DELETE",
    });

    fetchProviderCourses();
  };

  return (
    <div className="max-w-7xl mx-auto p-3 text-gray-800">
      <h1 className="text-2xl font-bold mb-6">Provider Courses</h1>

      {/* ---------------------------------- */}
      {/* Create Form */}
      {/* ---------------------------------- */}
      <form
        onSubmit={handleCreate}
        className="bg-white p-6 rounded-xl shadow mb-8 space-y-4"
      >
        <div className="grid grid-cols-4 gap-4">
          {/* Row 1 - Name & Slug */}
          <div className="col-span-4 text-sm text-gray-600">Course identity (name and slug)</div>
          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={(e) => {
              const value = e.target.value;
              setFormData({ ...formData, title: value, slug: generateSlug(value) });
            }}
            className="border px-4 py-2 rounded-md col-span-2"
          />
          <input
            type="text"
            placeholder="Slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
            className="border px-4 py-2 rounded-md bg-gray-50 col-span-2"
          />

          {/* Row 2 - Dropdowns */}
          <div className="col-span-4 text-sm text-gray-600">Select classification and provider</div>
          <DegreeTypeSelect
            value={formData.degreeTypeId}
            onChange={(value) =>
              setFormData({ ...formData, degreeTypeId: value, courseId: "", specializationId: "" })
            }
            className=""
          />
          <CourseSelect
            degreeTypeId={formData.degreeTypeId}
            value={formData.courseId}
            onChange={(value) => setFormData({ ...formData, courseId: value, specializationId: "" })}
          />
          <SpecializationSelect
            courseId={formData.courseId}
            value={formData.specializationId}
            onChange={(value) => setFormData({ ...formData, specializationId: value })}
          />
          {/* Provider select - shows all providers */}
          <ProviderSelect
            value={formData.providerId}
            onChange={(value) => setFormData({ ...formData, providerId: value })}
          />

          {/* Row 3 - Fees */}
          <div className="col-span-4 text-sm text-gray-600">Pricing</div>
          <input
            type="number"
            placeholder="Fees"
            value={formData.fees}
            onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
            className="border px-4 py-2 rounded-md col-span-2"
          />
          <input
            type="number"
            placeholder="Discounted Fees"
            value={formData.discountedFees}
            onChange={(e) => setFormData({ ...formData, discountedFees: e.target.value })}
            className="border px-4 py-2 rounded-md col-span-2"
          />

          {/* Fees Breakdown (full width) */}
          <div className="col-span-4">
            <label className="block text-sm font-medium mb-2">Fees Breakdown</label>
            {formData.feesBreakdown.map((fb, idx) => (
              <div key={idx} className="flex gap-2 items-center mb-2">
                <input
                  type="text"
                  placeholder="Label"
                  value={fb.label}
                  onChange={(e) => {
                    const arr = [...formData.feesBreakdown];
                    arr[idx].label = e.target.value;
                    setFormData({ ...formData, feesBreakdown: arr });
                  }}
                  className="border px-3 py-2 rounded w-1/2"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={fb.amount}
                  onChange={(e) => {
                    const arr = [...formData.feesBreakdown];
                    arr[idx].amount = e.target.value;
                    setFormData({ ...formData, feesBreakdown: arr });
                  }}
                  className="border px-3 py-2 rounded w-1/3"
                />
                <button
                  type="button"
                  onClick={() => {
                    const arr = formData.feesBreakdown.filter((_, i) => i !== idx);
                    setFormData({ ...formData, feesBreakdown: arr });
                  }}
                  className="text-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  feesBreakdown: [...formData.feesBreakdown, { label: "", amount: 0 }],
                })
              }
              className="px-3 py-1 rounded bg-gray-100"
            >
              Add Fee Item
            </button>
          </div>

          {/* Row 4 - Seats & Eligibility */}
          <div className="col-span-4 text-sm text-gray-600">Capacity & entry requirements</div>
          <input
            type="number"
            placeholder="Seats Available"
            value={formData.seatsAvailable}
            onChange={(e) => setFormData({ ...formData, seatsAvailable: e.target.value })}
            className="border px-4 py-2 rounded-md col-span-2"
          />
          <input
            type="text"
            placeholder="Eligibility"
            value={formData.eligibility}
            onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
            className="border px-4 py-2 rounded-md col-span-2"
          />

          {/* Row 5 - Duration & Weekly Effort */}
          <div className="col-span-4 text-sm text-gray-600">Duration and expected weekly effort</div>
          <input
            type="text"
            placeholder="Duration"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            className="border px-4 py-2 rounded-md col-span-2"
          />
          <input
            type="number"
            placeholder="Weekly Effort (hrs)"
            value={formData.weeklyEffort}
            onChange={(e) => setFormData({ ...formData, weeklyEffort: e.target.value })}
            className="border px-4 py-2 rounded-md col-span-2"
          />

          {/* Row 6 - Brochure & Exam Pattern */}
          <div className="col-span-4 text-sm text-gray-600">Resources & assessment</div>
          <input
            type="text"
            placeholder="Brochure URL"
            value={formData.brochureUrl}
            onChange={(e) => setFormData({ ...formData, brochureUrl: e.target.value })}
            className="border px-4 py-2 rounded-md col-span-2"
          />
          <textarea
            placeholder="Exam Pattern"
            value={formData.examPattern}
            onChange={(e) => setFormData({ ...formData, examPattern: e.target.value })}
            className="border px-4 py-2 rounded-md col-span-2"
          />

          {/* Row 7 - Employer Acceptance & Difficulty & Active Toggle */}
          <div className="col-span-4 flex items-end gap-8">
            <div className="flex flex-col">
              <div className="text-sm text-gray-600 mb-2">Employability signal</div>
              <select
                value={formData.employerAcceptance}
                onChange={(e) => setFormData({ ...formData, employerAcceptance: e.target.value })}
                className="border px-4 py-2 rounded-md"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="flex flex-col">
              <div className="text-sm text-gray-600 mb-2">Difficulty level</div>
              <select
                value={formData.difficultyLevel}
                onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value })}
                className="border px-4 py-2 rounded-md"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <span className="text-sm font-medium">Active</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 rounded-md bg-black text-white"
        >
          {loading ? "Saving..." : "Add Provider Course"}
        </button>
      </form>

      {/* ---------------------------------- */}
      {/* Table */}
      {/* ---------------------------------- */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Degree Type</th>
              <th className="p-3">Course</th>
                <th className="p-3">Specialization</th>
                  <th className="p-3">Weekly Effort</th>
                  <th className="p-3">Difficulty</th>
                  <th className="p-3">Fees</th>
              <th className="p-3">Disc. Fees</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {providerCourses.map((item) => (
              <tr key={item._id} className="border-b hover:bg-gray-50">
                {/* Title */}
                <td className="p-3 font-medium">
                  {editingId === item._id ? (
                    <input
                      value={formData.title}
                      onChange={(e) => {
                        const titleValue = e.target.value;
                        setFormData({
                          ...formData,
                          title: titleValue,
                          slug: generateSlug(titleValue),
                        });
                      }}
                      className="border px-2 py-1 rounded w-full"
                    />
                  ) : (
                    item.title
                  )}
                </td>

                {/* Degree Type */}
                <td className="p-3">
                  {editingId === item._id ? (
                    <DegreeTypeSelect
                      value={formData.degreeTypeId}
                      onChange={(value) =>
                        setFormData({
                          ...formData,
                          degreeTypeId: value,
                          courseId: "",
                          specializationId: "",
                        })
                      }
                      required
                    />
                  ) : (
                    item.degreeTypeId?.name
                  )}
                </td>

                {/* Course */}
                <td className="p-3">
                  {editingId === item._id ? (
                    <CourseSelect
                      degreeTypeId={formData.degreeTypeId}
                      value={formData.courseId}
                      onChange={(value) =>
                        setFormData({
                          ...formData,
                          courseId: value,
                          specializationId: "",
                        })
                      }
                      required
                    />
                  ) : (
                    item.courseId?.name
                  )}
                </td>

                {/* Specialization */}
                <td className="p-3">
                  {editingId === item._id ? (
                    <SpecializationSelect
                      courseId={formData.courseId}
                      value={formData.specializationId}
                      onChange={(value) =>
                        setFormData({
                          ...formData,
                          specializationId: value,
                        })
                      }
                    />
                  ) : (
                    item.specializationId?.name || "-"
                  )}
                </td>

                {/* Weekly Effort */}
                <td className="p-3">
                  {editingId === item._id ? (
                    <input
                      type="number"
                      value={formData.weeklyEffort}
                      onChange={(e) => setFormData({ ...formData, weeklyEffort: e.target.value })}
                      className="border px-2 py-1 rounded w-24"
                    />
                  ) : (
                    item.weeklyEffort ? `${item.weeklyEffort} hrs` : "-"
                  )}
                </td>

                {/* Difficulty */}
                <td className="p-3">
                  {editingId === item._id ? (
                    <select
                      value={formData.difficultyLevel}
                      onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value })}
                      className="border px-2 py-1 rounded"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  ) : (
                    item.difficultyLevel || "-"
                  )}
                </td>

                {/* Fees */}
                <td className="p-3">
                  {editingId === item._id ? (
                    <input
                      type="number"
                      value={formData.fees}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fees: e.target.value,
                        })
                      }
                      className="border px-2 py-1 rounded w-20"
                    />
                  ) : (
                    `₹${item.fees}`
                  )}
                </td>

                {/* Discounted Fees */}
                <td className="p-3">
                  {editingId === item._id ? (
                    <input
                      type="number"
                      value={formData.discountedFees}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountedFees: e.target.value,
                        })
                      }
                      className="border px-2 py-1 rounded w-20"
                    />
                  ) : (
                    `₹${item.discountedFees}`
                  )}
                </td>

                {/* Status */}
                <td className="p-3">
                  {editingId === item._id ? (
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
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      item.isActive
                        ? "bg-green-100 text-gray-900"
                        : "bg-gray-200 text-gray-800"
                    }`}>
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="p-3 flex gap-3">
                  {editingId === item._id ? (
                    <>
                      <button
                        onClick={() => handleUpdate(item._id)}
                        className="text-gray-600 font-medium text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-gray-500 text-sm"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 font-medium text-sm"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-red-600 font-medium text-sm"
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

        {providerCourses.length === 0 && (
          <div className="p-6 text-gray-500 text-center">
            No Provider Courses Found
          </div>
        )}
      </div>
    </div>
  );
}