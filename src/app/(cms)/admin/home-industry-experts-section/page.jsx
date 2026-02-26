"use client";

import { useEffect, useState } from "react";

// ─── UI Helpers ───────────────────────────────────────────────────────

function SectionHeader({ title }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
        {title}
      </span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
        {label}
      </label>
      {children}
      {hint && <span className="text-xs text-slate-400">{hint}</span>}
    </div>
  );
}

const inp =
  "border-2 border-slate-300 bg-white px-3 py-2.5 rounded-lg text-sm text-slate-800 " +
  "focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 w-full " +
  "placeholder-slate-400 transition-colors hover:border-slate-400";

const ta =
  "border-2 border-slate-300 bg-white px-3 py-2.5 rounded-lg text-sm text-slate-800 " +
  "focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 w-full " +
  "placeholder-slate-400 transition-colors hover:border-slate-400 resize-none";

const EMPTY_FORM = {
  name: "",
  title: "",
  description: "",
  photo: { url: "", alt: "" },
};

// ─── Main Page ────────────────────────────────────────────────────────

export default function HomeIndustryExpertsSectionPage() {
  const [sectionTitle, setSectionTitle] = useState("Learn From Industry Experts");
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const res = await fetch("/api/admin/home-industry-experts-section");
        const data = await res.json();
        if (data.sectionTitle) setSectionTitle(data.sectionTitle);
        if (data.experts) setExperts(data.experts);
      } catch (error) {
        console.error("Error fetching industry experts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExperts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("photo.")) {
      const photoField = name.split(".")[1];
      setFormData({ ...formData, photo: { ...formData.photo, [photoField]: value } });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddExpert = () => {
    if (!formData.name || !formData.photo.url) return alert("Name and photo URL are required");
    if (experts.length >= 8) return alert("Maximum 8 experts allowed");
    setExperts([...experts, { ...formData, localId: Date.now().toString() }]);
    setFormData(EMPTY_FORM);
  };

  const handleEditExpert = (index) => {
    setFormData(experts[index]);
    setEditingIndex(index);
  };

  const handleUpdateExpert = () => {
    if (!formData.name || !formData.photo.url) return alert("Name and photo URL are required");
    const updated = [...experts];
    updated[editingIndex] = formData;
    setExperts(updated);
    setEditingIndex(null);
    setFormData(EMPTY_FORM);
  };

  const handleDeleteExpert = (index) => {
    if (confirm("Delete this expert?")) setExperts(experts.filter((_, i) => i !== index));
  };

  const handleSaveAll = async () => {
    if (experts.length === 0) return alert("Please add at least one expert");
    setSaving(true);
    try {
      const expertsToSave = experts.map(expert => {
        const { localId, ...expertData } = expert;
        return expertData;
      });
      const res = await fetch("/api/admin/home-industry-experts-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionTitle, experts: expertsToSave }),
      });
      const data = await res.json();
      if (res.ok) alert("Industry experts section saved successfully");
      else alert(data.error || "Failed to save");
    } catch (error) {
      alert("Error saving industry experts section");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setFormData(EMPTY_FORM);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ── Page Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Industry Experts Manager</h1>
            <p className="text-sm text-slate-400 mt-1">Manage homepage industry expert profiles</p>
          </div>

          <button
            onClick={handleSaveAll}
            disabled={saving || experts.length === 0}
            className="px-5 py-2.5 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? "Saving..." : "💾 Save All"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Form Panel ── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            {/* Panel header */}
            <div className="bg-slate-800 px-6 py-4">
              <h2 className="text-white font-semibold text-sm tracking-wide">
                {editingIndex !== null ? "✏️ Edit Expert" : "➕ New Expert"}
              </h2>
            </div>

            <div className="p-6 space-y-6">

              {/* ── Section Settings ── */}
              <div>
                <SectionHeader title="Section Settings" />
                <Field label="Section Title">
                  <input
                    type="text"
                    value={sectionTitle}
                    onChange={(e) => setSectionTitle(e.target.value)}
                    placeholder="e.g. Learn From Industry Experts"
                    className={inp}
                  />
                </Field>
              </div>

              {/* ── Expert Info ── */}
              <div>
                <SectionHeader title="Expert Details" />
                <div className="space-y-4">

                  <Field label="Name *">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Dr. Sarah Johnson"
                      className={inp}
                    />
                  </Field>

                  <Field label="Title / Position">
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g. Senior Admissions Counselor"
                      className={inp}
                    />
                  </Field>

                  <Field label="Bio / Description">
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Brief bio or description of the expert..."
                      rows={3}
                      className={ta}
                    />
                  </Field>

                </div>
              </div>

              {/* ── Photo ── */}
              <div>
                <SectionHeader title="Photo" />
                <div className="space-y-4">

                  <Field label="Photo URL *">
                    <input
                      type="text"
                      name="photo.url"
                      value={formData.photo.url}
                      onChange={handleInputChange}
                      placeholder="https://example.com/photo.jpg"
                      className={inp}
                    />
                  </Field>

                  <Field label="Alt Text" hint="Describe the photo for accessibility">
                    <input
                      type="text"
                      name="photo.alt"
                      value={formData.photo.alt}
                      onChange={handleInputChange}
                      placeholder="e.g. Dr. Sarah Johnson smiling"
                      className={inp}
                    />
                  </Field>

                  {/* Preview */}
                  {formData.photo.url ? (
                    <img
                      src={formData.photo.url}
                      alt={formData.photo.alt || "Preview"}
                      className="w-full h-44 object-cover rounded-lg border-2 border-slate-200"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Found";
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-44 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 text-xs">
                      Photo preview will appear here
                    </div>
                  )}

                </div>
              </div>

              {/* ── Actions ── */}
              <div className="flex gap-3 pt-2 border-t border-slate-100">
                {editingIndex !== null ? (
                  <>
                    <button
                      onClick={handleUpdateExpert}
                      className="flex-1 px-4 py-2.5 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      Update Expert
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleAddExpert}
                    className="w-full px-4 py-2.5 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    + Add Expert
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* ── Experts List Panel ── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            {/* Panel header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600">All Experts</span>
              <span className="text-xs font-semibold bg-slate-100 text-slate-500 rounded-full px-2.5 py-0.5">
                {experts.length} / 8
              </span>
            </div>

            <div className="p-6">
              {experts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 gap-2">
                  <span className="text-2xl">👤</span>
                  <p className="text-xs">No experts yet — add one from the form</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {experts.map((expert, index) => (
                    <div
                      key={expert.localId || expert._id || index}
                      className={`
                        flex gap-3 p-3 rounded-xl border-2 transition-colors
                        ${editingIndex === index
                          ? "border-slate-800 bg-slate-50"
                          : "border-slate-200 hover:border-slate-300"
                        }
                      `}
                    >
                      {/* Avatar */}
                      <div className="w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-100">
                        <img
                          src={expert.photo.url}
                          alt={expert.photo.alt || expert.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/80x80?text=?";
                          }}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <p className="font-semibold text-slate-800 text-sm truncate">
                          {expert.name}
                        </p>
                        {expert.title && (
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {expert.title}
                          </p>
                        )}
                        {expert.description && (
                          <p className="text-xs text-slate-400 truncate mt-0.5">
                            {expert.description}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1.5 flex-shrink-0 justify-center">
                        <button
                          onClick={() => handleEditExpert(index)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteExpert(index)}
                          className="text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-1 rounded hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Slot indicators */}
              {experts.length > 0 && experts.length < 8 && (
                <p className="text-xs text-slate-400 text-center mt-4">
                  {8 - experts.length} slot{8 - experts.length !== 1 ? "s" : ""} remaining
                </p>
              )}
              {experts.length === 8 && (
                <p className="text-xs text-amber-500 text-center mt-4 font-medium">
                  ⚠️ Maximum of 8 experts reached
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}