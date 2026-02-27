"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import TextBlock from "../../../components/TextBlock"; 

export default function PageContentPage() { 
  const router = useRouter();
  const params = useParams(); 
  const slug = params.slug;

  const [page, setPage] = useState(null);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // activeSection holds the apiIdentifier string of the selected section
  const [activeSection, setActiveSection] = useState("");
  const [successMessage, setSuccessMessage] = useState("");



//   useEffect(() => {
//     fetchPageAndContent();
//   }, [slug]);

  const fetchPageAndContent = async () => {
    try {
      const pageRes = await fetch(`/api/admin/pages/${slug}`);
      const pageData = await pageRes.json();
      setPage(pageData);

      // set default activeSection to first section if not already set
      if (pageData.sections && pageData.sections.length > 0) {
        setActiveSection((prev) => prev || pageData.sections[0].apiIdentifier);
      }

      const contentRes = await fetch(`/api/admin/pages/${slug}/content`);
      const contentData = await contentRes.json();
      setContent(contentData);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };
    useEffect(() => {
    const loadData = async () => {
        await fetchPageAndContent();
    };

    loadData();
    }, [slug]);


  const saveContent = async (sectionApiId, itemIndex = 0, values, originalItemIndex) => {
    try {
      setSaving(true);
      const payload = {
        sectionApiId,
        itemIndex,
        values,
      };
      if (originalItemIndex !== undefined) payload.originalItemIndex = originalItemIndex;
      const res = await fetch(`/api/admin/pages/${slug}/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const savedContent = await res.json();
        setContent((prev) => {
          const filtered = prev.filter((c) => {
            // remove old entry either by original index or current one
            const matchSection = c.sectionApiId === sectionApiId;
            const matchIndex = originalItemIndex !== undefined
              ? c.itemIndex === originalItemIndex
              : c.itemIndex === itemIndex;
            return !(matchSection && matchIndex);
          });
          return [...filtered, savedContent];
        });
        setSuccessMessage("✓ Content saved successfully");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        alert("Failed to save content");
      }
    } catch (error) {
      console.error("Error saving content:", error);
      alert("Error saving content");
    } finally {
      setSaving(false);
    }
  };

  const deleteContent = async (sectionApiId, itemIndex = 0) => {
    if (!confirm("Delete this content?")) return;

    try {
      const res = await fetch(`/api/admin/pages/${slug}/content`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionApiId, itemIndex }),
      });

      if (res.ok) {
        setContent((prev) =>
          prev.filter(
            (c) => !(c.sectionApiId === sectionApiId && c.itemIndex === itemIndex)
          )
        );
        alert("Content deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting content:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Page not found</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 mb-4 font-medium"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {page.title} - Content
          </h1>
          <p className="text-gray-600 mt-2">Fill in content for each section</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Sections Dropdown */}
        <div className="mb-8 max-w-xs">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Select Section
          </label>
          <select
            value={activeSection}
            onChange={(e) => setActiveSection(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 bg-white"
          >
            {page.sections.map((section) => (
              <option key={section.apiIdentifier} value={section.apiIdentifier}>
                {section.title}
              </option>
            ))}
          </select>
        </div>

        {/* Content Editor */}
        {page.sections.find((s) => s.apiIdentifier === activeSection) && (
          <SectionContentEditor
            section={page.sections.find((s) => s.apiIdentifier === activeSection)}
            sectionApiId={activeSection}
            content={content.filter((c) => c.sectionApiId === activeSection)}
            onSave={saveContent}
            onDelete={deleteContent}
            saving={saving}
          />
        )}
      </div>
    </div>
  );
}

function SectionContentEditor({
  section,
  sectionApiId,
  content,
  onSave,
  onDelete,
  saving,
}) {
    const [itemIndex, setItemIndex] = useState(0);
    const [originalIndex, setOriginalIndex] = useState(0);
    const [formValues, setFormValues] = useState(() => {
    const firstItem = content.find(c => c.itemIndex === 0);

    if (firstItem?.values) return firstItem.values;

    return section.fields.reduce((acc, field) => {
        acc[field.name] = "";
        return acc;
    }, {});
    });

  const currentContent = content.find((c) => c.itemIndex === itemIndex);

  // when the active content record changes, remember its original index
  useEffect(() => {
    if (currentContent) {
      setOriginalIndex(currentContent.itemIndex);
    } else {
      setOriginalIndex(itemIndex);
    }
    // we intentionally do not include itemIndex in deps, so that manual edits
    // to the index field do not overwrite the original value
  }, [currentContent]);

  // Initialize form values on mount and when itemIndex or content changes
//   useEffect(() => {
//     if (currentContent?.values) {
//       setFormValues(currentContent.values);
//     } else {
//       const initial = {};
//       section.fields.forEach((field) => {
//         initial[field.name] = currentContent?.values?.[field.name] || "";
//       });
//       setFormValues(initial);
//     }
//   }, [itemIndex, currentContent, section.fields]);



  const handleInputChange = (fieldName, value) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSave = () => {
    onSave(sectionApiId, itemIndex, formValues, originalIndex);
  };

  const handleAddItem = () => {
    // content prop already contains only this section
    const maxIndex = Math.max(-1, ...content.map((c) => c.itemIndex));
    const newIndex = maxIndex + 1;
    setItemIndex(newIndex);
    setOriginalIndex(undefined); // mark as new content

    // initialize empty form values for new item
    const initial = {};
    section.fields.forEach((field) => {
      initial[field.name] = "";
    });
    setFormValues(initial);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      {/* Section Info */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
        {section.description && (
          <p className="text-gray-600 mt-2">{section.description}</p>
        )}
      </div>

      {/* Items Tabs */}
      {content.length > 0 && (
        <div className="mb-6">
          <div className="flex gap-2 mb-4 pb-2 border-b">
            {[...content]
              .sort((a, b) => a.itemIndex - b.itemIndex)
              .map((item) => (
              <div key={item.itemIndex} className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setItemIndex(item.itemIndex);

                    const existing = content.find(
                        (c) => c.itemIndex === item.itemIndex
                    );

                    const nextValues =
                        existing?.values ||
                        section.fields.reduce((acc, field) => {
                        acc[field.name] = "";
                        return acc;
                        }, {});

                    setFormValues(nextValues);
}}
                  className={`px-3 py-1 rounded font-medium ${
                    itemIndex === item.itemIndex
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Item {item.itemIndex + 1}
                </button>
                <button
                  onClick={() => onDelete(sectionApiId, item.itemIndex)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={handleAddItem}
              className="ml-auto px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium text-sm"
            >
              + Add Item
            </button>
          </div>
        </div>
      )}

      {/* Form Fields */}
      {/* Order control */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Item Order
        </label>
        <input
          type="number"
          value={itemIndex}
          onChange={(e) => setItemIndex(Number(e.target.value))}
          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800"
          min="0"
        />
        <p className="text-xs text-gray-500 mt-1">
          Change this number to reorder items within the section. Be sure to press Save.
        </p>
      </div>
      <div className="space-y-6 mb-8">
        {section.fields.map((field) => (
          <FormField
            key={field.name}
            field={field}
            value={formValues[field.name] || ""}
            onChange={(value) => handleInputChange(field.name, value)}
          />
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {saving ? "Saving..." : "Save Content"}
        </button>
        {content.length === 0 && (
          <button
            onClick={handleAddItem}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            + Add First Item
          </button>
        )}
      </div>
    </div>
  );
}

function FormField({ field, value, onChange }) {
  const isRequired = field.required ? "*" : "";

  const renderInput = () => {
    switch (field.type) {
      case "text":
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          />
        );

      case "textarea":
        return (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ""}
            rows="4"
            className="w-full px-3 py-2 border text-gray-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ""}
            className="w-full px-3 text-gray-800 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      case "email":
        return (
          <input
            type="email"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ""}
            className="w-full px-3  text-gray-800 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      case "date":
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full text-gray-800 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      case "image":
        return (
          <div>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Image URL"
              className="w-full text-gray-800 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            />
            {value && (
              <div className="mt-2">
                <img
                  src={value}
                  alt="Preview"
                  className="max-w-xs max-h-64 text-gray-800 rounded border border-gray-300"
                />
              </div>
            )}
          </div>
        );

      case "select":
        return (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border text-gray-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select an option</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case "checkbox":
        return (
          <input
            type="checkbox"
            checked={value === true || value === "true"}
            onChange={(e) => onChange(e.target.checked)}
            className="w-4 h-4 border text-gray-800 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          />
        );

      case "richtext":
        return (
          <TextBlock
            value={value || ""}
            onChange={onChange}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-2">
        {field.label}
        <span className="text-red-600">{isRequired}</span>
      </label>
      {renderInput()}
      {field.placeholder && field.type !== "image" && (
        <p className="text-gray-500 text-sm mt-1">{field.placeholder}</p>
      )}
    </div>
  );
}
