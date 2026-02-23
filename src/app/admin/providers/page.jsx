"use client";

import { useEffect, useState } from "react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const slugify = (str = "") =>
  str.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

const EMPTY_FORM = {
  // Basic
  name: "",
  slug: "",
  type: "University",
  shortExcerpt: "",
  logo: "",
  coverImage: "",
  galleryImages: [],
  isFeatured: false,
  isActive: true,
  publicationStatus: "draft",
  // Ratings
  averageRating: 0,
  reviewCount: 0,
  ratingBreakdown: {
    averageRating: 0,
    digitalInfrastructure: 0,
    curriculum: 0,
    valueForMoney: 0,
  },
  // Arrays
  scholarships: [],
  approvals: [],
  rankings: [],
  facts: [],
  campuses: [],
  placementPartners: [],
  faq: [],
  // Media
  sampleCertificateImage: "",
  // Admission
  admissionOpen: { isOpen: false, year: "", text: "" },
  // SEO
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  canonicalUrl: "",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ title, count }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{title}</span>
      {count !== undefined && (
        <span className="text-xs bg-slate-100 text-slate-500 rounded-full px-2 py-0.5">{count}</span>
      )}
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );
}

function Field({ label, children, span = 1, hint }) {
  return (
    <div className={`flex flex-col gap-1 col-span-${span}`}>
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      {children}
      {hint && <span className="text-xs text-slate-400">{hint}</span>}
    </div>
  );
}

const inp =
  "border border-slate-200 bg-white px-3 py-2 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 w-full placeholder-slate-300";
const sel =
  "border border-slate-200 bg-white px-3 py-2 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 w-full";
const ta =
  "border border-slate-200 bg-white px-3 py-2 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 w-full resize-none placeholder-slate-300";

// ─── Array Editor ─────────────────────────────────────────────────────────────

function ArrayEditor({ label, fieldName, form, setForm, fields, template, addLabel }) {
  const items = form[fieldName] || [];

  const add = () => setForm({ ...form, [fieldName]: [...items, { ...template }] });
  const remove = (i) => setForm({ ...form, [fieldName]: items.filter((_, idx) => idx !== i) });
  const update = (i, key, val) => {
    const arr = [...items];
    arr[i] = { ...arr[i], [key]: val };
    setForm({ ...form, [fieldName]: arr });
  };

  return (
    <div>
      <SectionHeader title={label} count={items.length} />
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 items-start p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex-1 grid grid-cols-3 gap-2">
              {fields.map((f) => (
                <input
                  key={f.key}
                  type="text"
                  placeholder={f.label}
                  value={item[f.key] || ""}
                  onChange={(e) => update(i, f.key, e.target.value)}
                  className={inp + " col-span-1"}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => remove(i)}
              className="mt-0.5 text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors whitespace-nowrap"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={add}
          className="text-xs text-slate-500 hover:text-slate-700 border border-dashed border-slate-300 rounded-lg px-4 py-2 w-full hover:bg-slate-50 transition-colors"
        >
          + {addLabel || `Add ${label}`}
        </button>
      </div>
    </div>
  );
}

// ─── Gallery Editor ───────────────────────────────────────────────────────────

function GalleryEditor({ form, setForm }) {
  const images = form.galleryImages || [];
  const add = () => setForm({ ...form, galleryImages: [...images, ""] });
  const remove = (i) => setForm({ ...form, galleryImages: images.filter((_, idx) => idx !== i) });
  const update = (i, val) => {
    const arr = [...images];
    arr[i] = val;
    setForm({ ...form, galleryImages: arr });
  };

  return (
    <div>
      <SectionHeader title="galleryImages" count={images.length} />
      <div className="space-y-2">
        {images.map((img, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Image URL"
              value={img}
              onChange={(e) => update(i, e.target.value)}
              className={inp}
            />
            <button type="button" onClick={() => remove(i)} className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors whitespace-nowrap">
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={add} className="text-xs text-slate-500 hover:text-slate-700 border border-dashed border-slate-300 rounded-lg px-4 py-2 w-full hover:bg-slate-50 transition-colors">
          + Add Image URL
        </button>
      </div>
    </div>
  );
}

// ─── Provider Form ────────────────────────────────────────────────────────────

function ProviderForm({ form, setForm, onSubmit, loading, submitLabel, onCancel }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Form header */}
      <div className="bg-slate-800 px-6 py-4 flex items-center justify-between">
        <h2 className="text-white font-semibold text-sm tracking-wide">{submitLabel === "Update Provider" ? "✏️ Edit Provider" : "➕ New Provider"}</h2>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-slate-400 hover:text-white text-sm transition-colors">
            Cancel
          </button>
        )}
      </div>

      <form onSubmit={onSubmit} className="p-6 space-y-8">

        {/* ── BASIC INFORMATION ── */}
        <div>
          <SectionHeader title="Basic Information" />
          <div className="grid grid-cols-6 gap-4">
            <Field label="name *" span={3}>
              <input
                type="text"
                placeholder="e.g. Amity University Online"
                value={form.name}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm({ ...form, name: v, slug: slugify(v) });
                }}
                className={inp}
                required
              />
            </Field>

            <Field label="slug *" span={3} hint="Auto-generated from name. Must be unique.">
              <input
                type="text"
                placeholder="amity-university-online"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                className={inp + " font-mono bg-slate-50"}
              />
            </Field>

            <Field label="type" span={2}>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={sel}>
                <option value="University">University</option>
                <option value="Edtech">Edtech</option>
                <option value="Platform">Platform</option>
              </select>
            </Field>

            <Field label="publicationStatus" span={2}>
              <select value={form.publicationStatus} onChange={(e) => setForm({ ...form, publicationStatus: e.target.value })} className={sel}>
                <option value="draft">draft</option>
                <option value="published">published</option>
              </select>
            </Field>

            <Field label="Flags" span={2}>
              <div className="flex gap-4 h-[38px] items-center">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
                  <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="w-4 h-4 rounded" />
                  isFeatured
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 rounded" />
                  isActive
                </label>
              </div>
            </Field>

            <Field label="shortExcerpt" span={6} hint="Shown in listing cards">
              <textarea
                placeholder="Brief description shown in cards..."
                value={form.shortExcerpt}
                onChange={(e) => setForm({ ...form, shortExcerpt: e.target.value })}
                className={ta}
                rows={2}
              />
            </Field>

            <Field label="logo" span={3} hint="University logo URL (header + cards)">
              <input type="text" placeholder="https://..." value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} className={inp} />
            </Field>

            <Field label="coverImage" span={3} hint="Main banner image URL">
              <input type="text" placeholder="https://..." value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} className={inp} />
            </Field>

            <div className="col-span-6">
              <GalleryEditor form={form} setForm={setForm} />
            </div>
          </div>
        </div>

        {/* ── RATINGS ── */}
        <div>
          <SectionHeader title="Ratings" />
          <div className="grid grid-cols-6 gap-4">
            <Field label="averageRating" span={2}>
              <input type="number" min="0" max="5" step="0.1" value={form.averageRating} onChange={(e) => setForm({ ...form, averageRating: parseFloat(e.target.value) || 0 })} className={inp} />
            </Field>
            <Field label="reviewCount" span={2}>
              <input type="number" min="0" value={form.reviewCount} onChange={(e) => setForm({ ...form, reviewCount: parseInt(e.target.value) || 0 })} className={inp} />
            </Field>
          </div>
          <p className="text-xs text-slate-400 mt-2 mb-3">ratingBreakdown (detailed breakdown shown in UI)</p>
          <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            {["averageRating", "digitalInfrastructure", "curriculum", "valueForMoney"].map((k) => (
              <Field key={k} label={`ratingBreakdown.${k}`} span={1}>
                <input
                  type="number" min="0" max="5" step="0.1"
                  value={form.ratingBreakdown[k]}
                  onChange={(e) => setForm({ ...form, ratingBreakdown: { ...form.ratingBreakdown, [k]: parseFloat(e.target.value) || 0 } })}
                  className={inp}
                />
              </Field>
            ))}
          </div>
        </div>

        {/* ── ADMISSIONS ── */}
        <div>
          <SectionHeader title="admissionOpen" />
          <div className="grid grid-cols-6 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <Field label="admissionOpen.isOpen" span={2}>
              <div className="flex items-center h-[38px]">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
                  <input type="checkbox" checked={form.admissionOpen.isOpen} onChange={(e) => setForm({ ...form, admissionOpen: { ...form.admissionOpen, isOpen: e.target.checked } })} className="w-4 h-4" />
                  Admission Open
                </label>
              </div>
            </Field>
            <Field label="admissionOpen.year" span={2} hint='e.g. "2025"'>
              <input type="text" placeholder="2025" value={form.admissionOpen.year} onChange={(e) => setForm({ ...form, admissionOpen: { ...form.admissionOpen, year: e.target.value } })} className={inp} />
            </Field>
            <Field label="admissionOpen.text" span={2} hint="Custom admission message">
              <input type="text" placeholder="Applications open for 2025 batch" value={form.admissionOpen.text} onChange={(e) => setForm({ ...form, admissionOpen: { ...form.admissionOpen, text: e.target.value } })} className={inp} />
            </Field>
          </div>
        </div>

        {/* ── STRUCTURED ARRAYS ── */}
        <div className="space-y-6">
          <ArrayEditor
            label="approvals"
            fieldName="approvals"
            form={form} setForm={setForm}
            fields={[{ key: "name", label: "name (e.g. AICTE)" }, { key: "logo", label: "logo URL" }]}
            template={{ name: "", logo: "" }}
            addLabel="Add Approval"
          />
          <ArrayEditor
            label="rankings"
            fieldName="rankings"
            form={form} setForm={setForm}
            fields={[{ key: "title", label: "title" }, { key: "description", label: "description" }]}
            template={{ title: "", description: "" }}
            addLabel="Add Ranking"
          />
          <ArrayEditor
            label="facts (Key Facts)"
            fieldName="facts"
            form={form} setForm={setForm}
            fields={[{ key: "icon", label: "icon (optional)" }, { key: "text", label: "text" }]}
            template={{ icon: "", text: "" }}
            addLabel="Add Fact"
          />
          <ArrayEditor
            label="campuses"
            fieldName="campuses"
            form={form} setForm={setForm}
            fields={[{ key: "city", label: "city" }, { key: "state", label: "state" }, { key: "country", label: "country" }]}
            template={{ city: "", state: "", country: "" }}
            addLabel="Add Campus"
          />
          <ArrayEditor
            label="placementPartners"
            fieldName="placementPartners"
            form={form} setForm={setForm}
            fields={[{ key: "name", label: "name" }, { key: "logo", label: "logo URL" }]}
            template={{ name: "", logo: "" }}
            addLabel="Add Placement Partner"
          />
          <ArrayEditor
            label="scholarships"
            fieldName="scholarships"
            form={form} setForm={setForm}
            fields={[{ key: "category", label: "category" }, { key: "scholarshipCredit", label: "scholarshipCredit" }, { key: "eligibility", label: "eligibility" }]}
            template={{ category: "", scholarshipCredit: "", eligibility: "" }}
            addLabel="Add Scholarship"
          />
          <ArrayEditor
            label="faq"
            fieldName="faq"
            form={form} setForm={setForm}
            fields={[{ key: "question", label: "question" }, { key: "answer", label: "answer" }]}
            template={{ question: "", answer: "" }}
            addLabel="Add FAQ"
          />
        </div>

        {/* ── MEDIA ── */}
        <div>
          <SectionHeader title="Media" />
          <Field label="sampleCertificateImage" hint="URL to sample certificate image">
            <input type="text" placeholder="https://..." value={form.sampleCertificateImage} onChange={(e) => setForm({ ...form, sampleCertificateImage: e.target.value })} className={inp} />
          </Field>
        </div>

        {/* ── SEO ── */}
        <div>
          <SectionHeader title="SEO Fields" />
          <div className="grid grid-cols-6 gap-4">
            <Field label="metaTitle" span={3}>
              <input type="text" placeholder="Page title for search engines" value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} className={inp} />
            </Field>
            <Field label="metaKeywords" span={3}>
              <input type="text" placeholder="keyword1, keyword2, ..." value={form.metaKeywords} onChange={(e) => setForm({ ...form, metaKeywords: e.target.value })} className={inp} />
            </Field>
            <Field label="metaDescription" span={6}>
              <textarea placeholder="Meta description for search results..." value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} className={ta} rows={2} />
            </Field>
            <Field label="canonicalUrl" span={6}>
              <input type="text" placeholder="https://yourdomain.com/providers/slug" value={form.canonicalUrl} onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })} className={inp} />
            </Field>
          </div>
        </div>

        {/* ── SUBMIT ── */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Saving..." : submitLabel}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="px-4 py-2.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProvidersPage() {
  const [providers, setProviders] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  const fetchProviders = async () => {
    try {
      setFetchLoading(true);
      const res = await fetch("/api/admin/providers", { cache: "no-store" });
      setProviders(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => { fetchProviders(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert("name is required!");
    setLoading(true);
    await fetch("/api/admin/providers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm(EMPTY_FORM);
    setShowForm(false);
    setLoading(false);
    fetchProviders();
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      name: item.name || "",
      slug: item.slug || "",
      type: item.type || "University",
      shortExcerpt: item.shortExcerpt || "",
      logo: item.logo || "",
      coverImage: item.coverImage || "",
      galleryImages: item.galleryImages || [],
      isFeatured: item.isFeatured || false,
      isActive: item.isActive ?? true,
      publicationStatus: item.publicationStatus || "draft",
      averageRating: item.averageRating || 0,
      reviewCount: item.reviewCount || 0,
      ratingBreakdown: item.ratingBreakdown || { averageRating: 0, digitalInfrastructure: 0, curriculum: 0, valueForMoney: 0 },
      scholarships: item.scholarships || [],
      approvals: item.approvals || [],
      rankings: item.rankings || [],
      facts: item.facts || [],
      campuses: item.campuses || [],
      placementPartners: item.placementPartners || [],
      faq: item.faq || [],
      sampleCertificateImage: item.sampleCertificateImage || "",
      admissionOpen: item.admissionOpen || { isOpen: false, year: "", text: "" },
      metaTitle: item.metaTitle || "",
      metaDescription: item.metaDescription || "",
      metaKeywords: item.metaKeywords || "",
      canonicalUrl: item.canonicalUrl || "",
    });
    setShowForm(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert("name is required!");
    setLoading(true);
    await fetch(`/api/admin/providers/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setEditingId(null);
    setForm(EMPTY_FORM);
    setLoading(false);
    fetchProviders();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this provider?")) return;
    await fetch(`/api/admin/providers/${id}`, { method: "DELETE" });
    fetchProviders();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const statusBadge = (pub) =>
    pub === "published"
      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
      : "bg-amber-50 text-amber-700 border border-amber-200";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Providers</h1>
            <p className="text-sm text-slate-400 mt-1">Manage universities, edtech platforms, and learning providers</p>
          </div>
          {!editingId && (
            <button
              onClick={() => { setShowForm((v) => !v); setForm(EMPTY_FORM); }}
              className="px-5 py-2.5 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 transition-colors"
            >
              {showForm ? "✕ Close" : "+ New Provider"}
            </button>
          )}
        </div>

        {/* ── Create Form ── */}
        {showForm && !editingId && (
          <div className="mb-8">
            <ProviderForm
              form={form}
              setForm={setForm}
              onSubmit={handleCreate}
              loading={loading}
              submitLabel="Create Provider"
              onCancel={() => { setShowForm(false); setForm(EMPTY_FORM); }}
            />
          </div>
        )}

        {/* ── Edit Form ── */}
        {editingId && (
          <div className="mb-8">
            <ProviderForm
              form={form}
              setForm={setForm}
              onSubmit={handleUpdate}
              loading={loading}
              submitLabel="Update Provider"
              onCancel={cancelEdit}
            />
          </div>
        )}

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600">All Providers</span>
            <span className="text-xs text-slate-400">{providers.length} total</span>
          </div>

          {fetchLoading ? (
            <div className="p-12 text-center text-sm text-slate-400">Loading...</div>
          ) : providers.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-400 text-sm">No providers yet. Create one above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["name", "type", "slug", "shortExcerpt", "isFeatured", "publicationStatus", "isActive", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {providers.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{item.name}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{item.type || "—"}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-400 max-w-[160px] truncate">{item.slug}</td>
                      <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">{item.shortExcerpt || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={item.isFeatured ? "text-amber-500 font-bold" : "text-slate-300"}>
                          {item.isFeatured ? "★" : "☆"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusBadge(item.publicationStatus)}`}>
                          {item.publicationStatus || "draft"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${item.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                          {item.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-1 rounded hover:bg-red-50 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
