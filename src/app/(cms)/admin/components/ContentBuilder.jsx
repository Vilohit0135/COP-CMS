"use client";

import TextBlock from "./TextBlock";

// ─── Section Header ───────────────────────────────────────────────

function SectionHeader({ title, count }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
        {title}
      </span>
      {count !== undefined && (
        <span className="text-xs bg-slate-200 text-slate-600 font-semibold rounded-full px-2 py-0.5">
          {count}
        </span>
      )}
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

// ── Stronger input — visible border + readable placeholder ────────
const inp =
  "border-2 border-slate-300 bg-white px-3 py-2.5 rounded-lg text-sm text-slate-800 " +
  "focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 w-full " +
  "placeholder-slate-400 transition-colors hover:border-slate-400";

// ─── Content Builder ───────────────────────────────────────────────

export default function ContentBuilder({ form, setForm }) {

  const addTextBlock = () => {
    setForm({
      ...form,
      content: [...form.content, { type: "text", value: "", align: "left" }],
    });
  };

  const addImageBlock = () => {
    setForm({
      ...form,
      content: [...form.content, { type: "image", value: "", align: "center" }],
    });
  };

  const removeBlock = (index) => {
    const updated = form.content.filter((_, i) => i !== index);
    setForm({ ...form, content: updated });
  };

  const updateBlock = (index, newValue) => {
    const updated = [...form.content];
    updated[index].value = newValue;
    setForm({ ...form, content: updated });
  };

  return (
    <div>
      <SectionHeader title="Content Builder" count={form.content.length} />

      {/* ── Add Buttons ── */}
      <div className="flex gap-3 mb-6">
        <button
          type="button"
          onClick={addTextBlock}
          className="px-4 py-2 text-xs font-semibold text-slate-600 border-2 border-dashed border-slate-300 rounded-lg hover:border-slate-400 hover:bg-slate-50 transition-colors"
        >
          + Add Text Block
        </button>

        <button
          type="button"
          onClick={addImageBlock}
          className="px-4 py-2 text-xs font-semibold text-slate-600 border-2 border-dashed border-slate-300 rounded-lg hover:border-slate-400 hover:bg-slate-50 transition-colors"
        >
          + Add Image Block
        </button>
      </div>

      {/* ── Blocks ── */}
      <div className="space-y-4">
        {form.content.map((block, index) => (
          <div
            key={index}
            className="relative border-2 border-slate-200 rounded-xl p-4 bg-slate-50 hover:border-slate-300 transition-colors"
          >
            {/* Block type label */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                {block.type === "text" ? "📝 Text Block" : "🖼️ Image Block"}
              </span>

              <button
                type="button"
                onClick={() => removeBlock(index)}
                className="text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-1 rounded hover:bg-red-50 transition-colors"
              >
                Remove
              </button>
            </div>

            {/* TEXT BLOCK */}
            {block.type === "text" && (
              <TextBlock
                value={block.value}
                onChange={(val) => updateBlock(index, val)}
              />
            )}

            {/* IMAGE BLOCK */}
            {block.type === "image" && (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Paste image URL here, e.g. https://example.com/photo.jpg"
                  value={block.value}
                  onChange={(e) => updateBlock(index, e.target.value)}
                  className={inp}
                />

                {block.value ? (
                  <img
                    src={block.value}
                    alt="Preview"
                    className="rounded-lg max-h-60 object-cover border-2 border-slate-200"
                  />
                ) : (
                  <div className="flex items-center justify-center h-24 rounded-lg border-2 border-dashed border-slate-300 bg-white text-slate-400 text-xs">
                    Image preview will appear here
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Empty state */}
        {form.content.length === 0 && (
          <div className="flex items-center justify-center h-24 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 text-xs">
            No content blocks yet — add one above
          </div>
        )}
      </div>
    </div>
  );
}