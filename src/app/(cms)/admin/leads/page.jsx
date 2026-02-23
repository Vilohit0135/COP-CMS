"use client";

import { useEffect, useState } from "react";

const CALL_STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "bg-gray-100" },
  { value: "called", label: "Called", color: "bg-blue-100" },
  { value: "did_not_answer", label: "Did Not Answer", color: "bg-red-100" },
  { value: "called_and_helped", label: "Called & Helped", color: "bg-green-100" },
  { value: "need_follow_up", label: "Need Follow-up", color: "bg-yellow-100" },
  { value: "schedule_call", label: "Schedule Call", color: "bg-purple-100" },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState(""); // "" means show all

  const [formData, setFormData] = useState({
    callStatus: "pending",
    notes: "",
    assignedTo: "",
    scheduledCallDate: "",
  });

  /* ---------------------------------- */
  /* Fetch Leads */
  /* ---------------------------------- */
  const fetchLeads = async () => {
    try {
      let url = "/api/admin/leads";
      if (filterStatus) {
        url += `?status=${filterStatus}`;
      }
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      
      if (!res.ok) {
        console.error("API error:", data);
        return;
      }
      
      setLeads(data);
    } catch (err) {
      console.error("Error fetching leads:", err);
    }
  };


    useEffect(() => {
    const loadData = async () => {
        await fetchLeads();
    };

    loadData();
    }, [filterStatus]);


//   useEffect(() => {
//     fetchLeads();
//   }, [filterStatus]);

  /* ---------------------------------- */
  /* Edit Lead */
  /* ---------------------------------- */
  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      callStatus: item.callStatus || "pending",
      notes: item.notes || "",
      assignedTo: item.assignedTo || "",
      scheduledCallDate: item.scheduledCallDate
        ? item.scheduledCallDate.split("T")[0]
        : "",
    });
  };

  /* ---------------------------------- */
  /* Update Lead */
  /* ---------------------------------- */
  const handleUpdate = async (id) => {
    setLoading(true);

    const payload = {
      callStatus: formData.callStatus,
      notes: formData.notes,
      assignedTo: formData.assignedTo,
      scheduledCallDate: formData.scheduledCallDate
        ? new Date(formData.scheduledCallDate)
        : null,
    };

    console.log("Updating lead id", id, "payload:", payload);

    await fetch(`/api/admin/leads/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setEditingId(null);
    setLoading(false);
    fetchLeads();
  };

  /* ---------------------------------- */
  /* Delete Lead */
  /* ---------------------------------- */
  const handleDelete = async (id) => {
    const confirmDelete = confirm("Delete this lead?");
    if (!confirmDelete) return;

    await fetch(`/api/admin/leads/${id}`, {
      method: "DELETE",
    });

    fetchLeads();
  };

  const getStatusColor = (status) => {
    const option = CALL_STATUS_OPTIONS.find((o) => o.value === status);
    return option?.color || "bg-gray-100";
  };

  const getStatusLabel = (status) => {
    const option = CALL_STATUS_OPTIONS.find((o) => o.value === status);
    return option?.label || status;
  };

  return (
    <div className="max-w-7xl mx-auto p-3 text-gray-800">
      <h1 className="text-2xl font-bold mb-6">Leads Management</h1>

      {/* ---------------------------------- */}
      {/* Filter Section */}
      {/* ---------------------------------- */}
      <div className="mb-6 flex gap-3">
        <label className="flex items-center gap-2">
          <span className="text-sm font-medium">Filter by Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border px-4 py-2 rounded-md"
          >
            <option value="">All Leads</option>
            {CALL_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* ---------------------------------- */}
      {/* Leads Table */}
      {/* ---------------------------------- */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Course Interest</th>
              <th className="p-3">Status</th>
              <th className="p-3">Assigned To</th>
              <th className="p-3">Notes</th>
              <th className="p-3">Last Updated</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {leads.map((lead) => (
              <tr key={lead._id} className="border-b hover:bg-gray-50">
                {/* Name */}
                <td className="p-3 font-medium">{lead.name}</td>

                {/* Email */}
                <td className="p-3 text-xs">{lead.email}</td>

                {/* Phone */}
                <td className="p-3 text-xs">{lead.phone}</td>

                {/* Course Interest */}
                <td className="p-3 text-xs truncate max-w-xs">
                  {lead.courseOfInterest || "-"}
                </td>

                {/* Status */}
                <td className="p-3">
                  {editingId === lead._id ? (
                    <select
                      value={formData.callStatus}
                      onChange={(e) =>
                        setFormData({ ...formData, callStatus: e.target.value })
                      }
                      className="border px-2 py-1 rounded text-sm"
                    >
                      {CALL_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded text-xs font-medium ${getStatusColor(
                        lead.callStatus
                      )}`}
                    >
                      {getStatusLabel(lead.callStatus)}
                    </span>
                  )}
                </td>

                {/* Assigned To */}
                <td className="p-3">
                  {editingId === lead._id ? (
                    <input
                      type="text"
                      placeholder="Counselor name"
                      value={formData.assignedTo}
                      onChange={(e) =>
                        setFormData({ ...formData, assignedTo: e.target.value })
                      }
                      className="border px-2 py-1 rounded w-full text-sm"
                    />
                  ) : (
                    <span className="text-xs">{lead.assignedTo || "-"}</span>
                  )}
                </td>

                {/* Notes */}
                <td className="p-3">
                  {editingId === lead._id ? (
                    <textarea
                      placeholder="Add update or notes"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      className="border px-2 py-1 rounded w-full text-sm"
                      rows="2"
                    />
                  ) : (
                    <span className="text-xs truncate block max-w-xs">
                      {lead.notes || "-"}
                    </span>
                  )}
                </td>

                {/* Last Updated */}
                <td className="p-3 text-xs">
                  {lead.lastUpdated
                    ? new Date(lead.lastUpdated).toLocaleDateString()
                    : "-"}
                </td>

                {/* Actions */}
                <td className="p-3 flex gap-2">
                  {editingId === lead._id ? (
                    <>
                      <button
                        onClick={() => handleUpdate(lead._id)}
                        disabled={loading}
                        className="text-green-600 font-medium text-sm hover:underline"
                      >
                        {loading ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-gray-500 text-sm hover:underline"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(lead)}
                        className="text-blue-600 font-medium text-sm hover:underline"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(lead._id)}
                        className="text-red-600 font-medium text-sm hover:underline"
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

        {leads.length === 0 && (
          <div className="p-6 text-gray-500 text-center">
            No Leads Found
          </div>
        )}
      </div>
    </div>
  );
}
