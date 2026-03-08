"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { callApi } from "@/lib/apiClient";

const FIELD_TYPES = [
  "text",
  "textarea",
  "richtext",
  "image",
  "number",
  "email",
  "date",
  "select",
  "checkbox",
];

export default function EditPagePage({ params: paramsPromise }) {
  const [params, setParams] = useState(null);
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [sectionToEdit, setSectionToEdit] = useState(null);
  const router = useRouter();

  // Unwrap params
  useEffect(() => {
    paramsPromise.then(setParams);
  }, [paramsPromise]);

  useEffect(() => {
    if (params?.slug) {
      fetchPage();
    }
  }, [params]);

  const generateApiIdentifier = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
  };

  const fetchPage = async () => {
    try {
      const res = await callApi(`/api/admin/pages/${params.slug}`, {
        auth: true,
      });
      if (res.ok) {
        const data = await res.json();

        // Migrate old sections that have 'type' but not 'apiIdentifier'
        if (data.sections) {
          data.sections = data.sections.map((section) => {
            if (!section.apiIdentifier && section.title) {
              return {
                ...section,
                apiIdentifier: generateApiIdentifier(section.title),
              };
            }
            return section;
          });
        }

        setPage(data);
      } else {
        setError("Page not found");
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching page:", err);
      setError("Error loading page");
      setLoading(false);
    }
  };

  const handleCreateContentModel = (title, apiIdentifier, description = "") => {
    if (!title || !apiIdentifier) return;

    const newSection = {
      _id: new Date().getTime().toString(),
      title,
      apiIdentifier,
      description,
      fields: [],
      dataInstances: [],
    };

    setPage({
      ...page,
      sections: [...page.sections, newSection],
    });
    setActiveSection(newSection._id);
    setShowCreateModal(false);
  };

  const handleDeleteSection = (sectionId) => {
    if (!confirm("Delete this section?")) return;
    setPage({
      ...page,
      sections: page.sections.filter((s) => s._id !== sectionId),
    });
    setActiveSection(null);
  };

  const handleSectionChange = (sectionId, field, value) => {
    setPage({
      ...page,
      sections: page.sections.map((s) =>
        s._id === sectionId ? { ...s, [field]: value } : s
      ),
    });
  };

  const handleSave = async () => {
    if (!page.title || !page.slug) {
      setError("Title and slug are required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await callApi(`/api/admin/pages/${page.slug}`, {
        method: "PUT",
        auth: true,
        body: {
          title: page.title,
          description: page.description,
          sections: page.sections.map((section) => ({
            title: section.title,
            apiIdentifier: section.apiIdentifier || generateApiIdentifier(section.title),
            description: section.description,
            fields: section.fields.map((field) => ({
              name: field.name,
              label: field.label,
              type: field.type,
              required: field.required,
              placeholder: field.placeholder,
              options: field.options,
            })),
            dataInstances: section.dataInstances || [],
          })),
          isPublished: page.isPublished,
        },
      });

      if (res.ok) {
        alert("Page saved successfully");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save page");
      }
    } catch (err) {
      console.error("Error saving page:", err);
      setError("Error saving page");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Loading page...</p>
      </div>
    );
  }

  if (error && !page) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Link href="/admin/pages" className="text-blue-600 hover:text-blue-700">
          Back to Pages
        </Link>
      </div>
    );
  }

  if (!page) return null;

  const currentSection = activeSection
    ? page.sections.find((s) => s._id === activeSection)
    : null;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Link
          href="/admin/pages"
          className="text-blue-600 hover:text-blue-700 font-medium mb-6 inline-block"
        >
          ← Back to Pages
        </Link>

        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{page.title}</h1>
            <p className="text-gray-600 mt-1">/{page.slug}</p>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/admin/pages/${page.slug}/content`}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              Content
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
            >
              {saving ? "Saving..." : "Save Page"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6">
            {error}
          </div>
        )}

        {/* Top Section - Create Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            + Create Content Model
          </button>
        </div>

        {/* Content Models Table */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Content Models
          </h2>

          {page.sections.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No content models yet. Create one to get started.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      API Identifier
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Fields
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {page.sections.map((section) => (
                    <tr key={section._id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {section.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {section.apiIdentifier}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${section.fields.length === 0
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                            }`}
                        >
                          {section.fields.length === 0
                            ? "Input fields need to be added"
                            : "Complete"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {section.fields.length} fields
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => setActiveSection(section._id)}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Content Model Details */}
        {currentSection && (
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Header showing which model is being edited */}
            <div className="mb-8 pb-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {currentSection.title}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                API Identifier: <span className="font-mono font-semibold">{currentSection.apiIdentifier}</span>
              </p>
            </div>

            {/* Input Fields Management */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Input Fields
                </h3>
                <button
                  onClick={() => {
                    setSectionToEdit(currentSection._id);
                    setShowFieldModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                >
                  + Create Input Field
                </button>
              </div>

              {currentSection.fields.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No input fields yet. Add one to get started.
                </p>
              ) : (
                <div className="space-y-3">
                  {currentSection.fields.map((field) => (
                    <div
                      key={field._id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-200"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {field.label}
                        </p>
                        <p className="text-xs text-gray-500">
                          {field.name} ({field.type})
                        </p>
                      </div>
                      {field.required && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                          Required
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}


      </div>

      {/* Create Content Model Modal */}
      {showCreateModal && (
        <CreateContentModelModal
          onSave={handleCreateContentModel}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Field Modal */}
      {showFieldModal && sectionToEdit && (
        <FieldModal
          section={page.sections.find((s) => s._id === sectionToEdit)}
          onSave={(fields) => {
            setPage({
              ...page,
              sections: page.sections.map((s) =>
                s._id === sectionToEdit ? { ...s, fields } : s
              ),
            });
            setShowFieldModal(false);
          }}
          onClose={() => setShowFieldModal(false)}
        />
      )}
    </div>
  );
}

function CreateContentModelModal({ onSave, onClose }) {
  const [title, setTitle] = useState("");
  const [apiIdentifier, setApiIdentifier] = useState("");
  const [description, setDescription] = useState("");

  // Auto-generate API identifier from title
  const generateApiIdentifier = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setApiIdentifier(generateApiIdentifier(newTitle));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !apiIdentifier.trim()) {
      alert("Title and API Identifier are required");
      return;
    }
    onSave(title, apiIdentifier, description);
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Create Content Model
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="e.g., Hero Section"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              API Identifier (Auto-generated)
            </label>
            <input
              type="text"
              value={apiIdentifier}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this content model..."
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FieldModal({ section, onSave, onClose }) {
  const [fields, setFields] = useState(section.fields || []);

  const handleAddField = () => {
    setFields([
      ...fields,
      {
        _id: new Date().getTime().toString(),
        name: "",
        label: "",
        type: "text",
        required: false,
        placeholder: "",
        options: [],
      },
    ]);
  };

  const handleFieldChange = (fieldId, field, value) => {
    setFields(
      fields.map((f) => {
        if (f._id === fieldId) {
          const updated = { ...f, [field]: value };
          // Auto-populate label from name (same as name)
          if (field === "name") {
            updated.label = value;
          }
          return updated;
        }
        return f;
      })
    );
  };

  const handleDeleteField = (fieldId) => {
    setFields(fields.filter((f) => f._id !== fieldId));
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Add Input Fields</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {fields.map((field, idx) => (
            <div
              key={field._id}
              className="p-4 border border-gray-200 rounded-lg space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Field {idx + 1}</h3>
                <button
                  onClick={() => handleDeleteField(field._id)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Delete
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">
                    Field Name
                  </label>
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) =>
                      handleFieldChange(field._id, "name", e.target.value)
                    }
                    placeholder="e.g., title, content"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">
                    Field Label
                  </label>
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) =>
                      handleFieldChange(field._id, "label", e.target.value)
                    }
                    placeholder="e.g., Page Title"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">
                    Type
                  </label>
                  <select
                    value={field.type}
                    onChange={(e) =>
                      handleFieldChange(field._id, "type", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-800"
                  >
                    {FIELD_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) =>
                        handleFieldChange(field._id, "required", e.target.checked)
                      }
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      Required
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">
                  Placeholder
                </label>
                <input
                  type="text"
                  value={field.placeholder}
                  onChange={(e) =>
                    handleFieldChange(field._id, "placeholder", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-800"
                />
              </div>
            </div>
          ))}

          <button
            onClick={handleAddField}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            + Add Another Field
          </button>
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(fields)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            Save Fields
          </button>
        </div>
      </div>
    </div>
  );
}


