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

const EMPTY_FORM = { title: "", subtitle: "", banner: { url: "", alt: "" } };

// ─── Main Page ────────────────────────────────────────────────────────

export default function HomeHeroSectionPage() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    const fetchHeroSection = async () => {
      try {
        const res = await fetch("/api/admin/home-hero-section");
        const data = await res.json();
        if (data.slides) setSlides(data.slides);
      } catch (error) {
        console.error("Error fetching hero section:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHeroSection();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("banner.")) {
      const bannerField = name.split(".")[1];
      setFormData({ ...formData, banner: { ...formData.banner, [bannerField]: value } });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddSlide = () => {
    if (!formData.title || !formData.banner.url) return alert("Title and banner URL are required");
    if (slides.length >= 5) return alert("Maximum 5 slides allowed");
    setSlides([...slides, { ...formData, localId: Date.now().toString() }]);
    setFormData(EMPTY_FORM);
  };

  const handleEditSlide = (index) => {
    setFormData(slides[index]);
    setEditingIndex(index);
  };

  const handleUpdateSlide = () => {
    if (!formData.title || !formData.banner.url) return alert("Title and banner URL are required");
    const updated = [...slides];
    updated[editingIndex] = formData;
    setSlides(updated);
    setEditingIndex(null);
    setFormData(EMPTY_FORM);
  };

  const handleDeleteSlide = (index) => {
    if (confirm("Delete this slide?")) setSlides(slides.filter((_, i) => i !== index));
  };

  const handleSaveAll = async () => {
    if (slides.length === 0) return alert("Please add at least one slide");
    setSaving(true);
    try {
      // Remove localId and _id from new slides before sending
      const slidesToSave = slides.map(slide => {
        const { localId, ...slideData } = slide;
        return slideData;
      });
      const res = await fetch("/api/admin/home-hero-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides: slidesToSave }),
      });
      const data = await res.json();
      if (res.ok) alert("Hero section saved successfully");
      else alert(data.error || "Failed to save");
    } catch (error) {
      alert("Error saving hero section");
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
            <h1 className="text-2xl font-bold text-slate-800">Hero Section Manager</h1>
            <p className="text-sm text-slate-400 mt-1">Manage homepage hero slides and banners</p>
          </div>

          <button
            onClick={handleSaveAll}
            disabled={saving || slides.length === 0}
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
                {editingIndex !== null ? "✏️ Edit Slide" : "➕ New Slide"}
              </h2>
            </div>

            <div className="p-6 space-y-6">

              {/* ── Content ── */}
              <div>
                <SectionHeader title="Slide Content" />
                <div className="space-y-4">

                  <Field label="Title *">
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g. Discover Your Dream University"
                      className={inp}
                    />
                  </Field>

                  <Field label="Subtitle">
                    <input
                      type="text"
                      name="subtitle"
                      value={formData.subtitle}
                      onChange={handleInputChange}
                      placeholder="e.g. Expert guidance for global admissions"
                      className={inp}
                    />
                  </Field>

                </div>
              </div>

              {/* ── Banner ── */}
              <div>
                <SectionHeader title="Banner Image" />
                <div className="space-y-4">

                  <Field label="Image URL *">
                    <input
                      type="text"
                      name="banner.url"
                      value={formData.banner.url}
                      onChange={handleInputChange}
                      placeholder="https://example.com/hero-image.jpg"
                      className={inp}
                    />
                  </Field>

                  <Field label="Alt Text" hint="Describe the image for accessibility">
                    <input
                      type="text"
                      name="banner.alt"
                      value={formData.banner.alt}
                      onChange={handleInputChange}
                      placeholder="e.g. Students walking on campus"
                      className={inp}
                    />
                  </Field>

                  {/* Preview */}
                  {formData.banner.url ? (
                    <img
                      src={formData.banner.url}
                      alt={formData.banner.alt || "Preview"}
                      className="w-full h-44 object-cover rounded-lg border-2 border-slate-200"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/800x300?text=Image+Not+Found";
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-44 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 text-xs">
                      Banner preview will appear here
                    </div>
                  )}

                </div>
              </div>

              {/* ── Actions ── */}
              <div className="flex gap-3 pt-2 border-t border-slate-100">
                {editingIndex !== null ? (
                  <>
                    <button
                      onClick={handleUpdateSlide}
                      className="flex-1 px-4 py-2.5 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      Update Slide
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
                    onClick={handleAddSlide}
                    className="w-full px-4 py-2.5 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    + Add Slide
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* ── Slides List Panel ── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            {/* Panel header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600">All Slides</span>
              <span className="text-xs font-semibold bg-slate-100 text-slate-500 rounded-full px-2.5 py-0.5">
                {slides.length} / 5
              </span>
            </div>

            <div className="p-6">
              {slides.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 gap-2">
                  <span className="text-2xl">🖼️</span>
                  <p className="text-xs">No slides yet — add one from the form</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {slides.map((slide, index) => (
                    <div
                      key={slide.localId || slide._id || index}
                      className={`
                        flex gap-3 p-3 rounded-xl border-2 transition-colors
                        ${editingIndex === index
                          ? "border-slate-800 bg-slate-50"
                          : "border-slate-200 hover:border-slate-300"
                        }
                      `}
                    >
                      {/* Thumbnail */}
                      <div className="w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 border-slate-200 bg-slate-100">
                        <img
                          src={slide.banner.url}
                          alt={slide.banner.alt || "Slide"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/100x80?text=No+Image";
                          }}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <p className="font-semibold text-slate-800 text-sm truncate">
                          {slide.title}
                        </p>
                        {slide.subtitle && (
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {slide.subtitle}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 truncate mt-1 font-mono">
                          {slide.banner.url}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1.5 flex-shrink-0 justify-center">
                        <button
                          onClick={() => handleEditSlide(index)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSlide(index)}
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
              {slides.length > 0 && slides.length < 5 && (
                <p className="text-xs text-slate-400 text-center mt-4">
                  {5 - slides.length} slot{5 - slides.length !== 1 ? "s" : ""} remaining
                </p>
              )}
              {slides.length === 5 && (
                <p className="text-xs text-amber-500 text-center mt-4 font-medium">
                  ⚠️ Maximum of 5 slides reached
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}