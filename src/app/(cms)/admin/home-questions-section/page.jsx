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

const EMPTY_FORM = { title: "", subtitle: "" };

// ─── Main Page ────────────────────────────────────────────────────────

export default function HomeQuestionsSectionPage() {
  const [sectionTitle, setSectionTitle] = useState("Questions & Answers");
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch("/api/admin/home-questions-section");
        const data = await res.json();
        if (data.sectionTitle) setSectionTitle(data.sectionTitle);
        if (data.cards) setCards(data.cards);
      } catch (error) {
        console.error("Error fetching questions section:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddCard = () => {
    if (!formData.title || !formData.subtitle) return alert("Title and answer are required");
    if (cards.length >= 8) return alert("Maximum 8 question cards allowed");
    setCards([...cards, { ...formData, localId: Date.now().toString() }]);
    setFormData(EMPTY_FORM);
  };

  const handleEditCard = (index) => {
    setFormData(cards[index]);
    setEditingIndex(index);
  };

  const handleUpdateCard = () => {
    if (!formData.title || !formData.subtitle) return alert("Title and answer are required");
    const updated = [...cards];
    updated[editingIndex] = formData;
    setCards(updated);
    setEditingIndex(null);
    setFormData(EMPTY_FORM);
  };

  const handleDeleteCard = (index) => {
    if (confirm("Delete this question card?")) setCards(cards.filter((_, i) => i !== index));
  };

  const handleSaveAll = async () => {
    if (cards.length === 0) return alert("Please add at least one question card");
    setSaving(true);
    try {
      const cardsToSave = cards.map(card => {
        const { localId, ...cardData } = card;
        return cardData;
      });
      const res = await fetch("/api/admin/home-questions-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionTitle, cards: cardsToSave }),
      });
      const data = await res.json();
      if (res.ok) alert("Questions section saved successfully");
      else alert(data.error || "Failed to save");
    } catch (error) {
      alert("Error saving questions section");
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

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Questions & Answers Manager</h1>
            <p className="text-sm text-slate-400 mt-1">Manage homepage Q&A cards</p>
          </div>
          <button
            onClick={handleSaveAll}
            disabled={saving || cards.length === 0}
            className="px-5 py-2.5 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? "Saving..." : "💾 Save All"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Form Panel */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-800 px-6 py-4">
              <h2 className="text-white font-semibold text-sm tracking-wide">
                {editingIndex !== null ? "✏️ Edit Question Card" : "➕ New Question Card"}
              </h2>
            </div>

            <div className="p-6 space-y-6">

              {/* Section Settings */}
              <div>
                <SectionHeader title="Section Settings" />
                <Field label="Section Title">
                  <input
                    type="text"
                    value={sectionTitle}
                    onChange={(e) => setSectionTitle(e.target.value)}
                    placeholder="e.g. Questions & Answers"
                    className={inp}
                  />
                </Field>
              </div>

              {/* Card Content */}
              <div>
                <SectionHeader title="Card Content" />
                <div className="space-y-4">
                  <Field label="Question *">
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g. What is COP?"
                      className={inp}
                    />
                  </Field>

                  <Field label="Answer *">
                    <textarea
                      name="subtitle"
                      value={formData.subtitle}
                      onChange={handleInputChange}
                      placeholder="Enter the answer to this question..."
                      rows={4}
                      className={ta}
                    />
                  </Field>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2 border-t border-slate-100">
                {editingIndex !== null ? (
                  <>
                    <button
                      onClick={handleUpdateCard}
                      className="flex-1 px-4 py-2.5 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      Update Card
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
                    onClick={handleAddCard}
                    className="w-full px-4 py-2.5 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    + Add Card
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Cards List Panel */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600">All Question Cards</span>
              <span className="text-xs font-semibold bg-slate-100 text-slate-500 rounded-full px-2.5 py-0.5">
                {cards.length} / 8
              </span>
            </div>

            <div className="p-6">
              {cards.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 gap-2">
                  <span className="text-2xl">❓</span>
                  <p className="text-xs">No question cards yet — add one from the form</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cards.map((card, index) => (
                    <div
                      key={card.localId || card._id || index}
                      className={`flex gap-3 p-4 rounded-xl border-2 transition-colors ${
                        editingIndex === index
                          ? "border-slate-800 bg-slate-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {/* Q badge */}
                      <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs mt-0.5">
                        Q
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 text-sm truncate">
                          {card.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {card.subtitle}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1.5 flex-shrink-0 justify-center">
                        <button
                          onClick={() => handleEditCard(index)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCard(index)}
                          className="text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-1 rounded hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {cards.length > 0 && cards.length < 8 && (
                <p className="text-xs text-slate-400 text-center mt-4">
                  {8 - cards.length} slot{8 - cards.length !== 1 ? "s" : ""} remaining
                </p>
              )}
              {cards.length === 8 && (
                <p className="text-xs text-amber-500 text-center mt-4 font-medium">
                  ⚠️ Maximum of 8 cards reached
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}