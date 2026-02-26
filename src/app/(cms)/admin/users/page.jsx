"use client";

import { useEffect, useState } from "react";

const SECTION_NAMES = {
  leads: "Leads",
  courses: "Courses",
  blogs: "Blogs",
  providers: "Providers",
  specializations: "Specializations",
  "degree-types": "Degree Types",
  "provider-courses": "Provider Courses",
  reviews: "Reviews",
  "home-hero-section": "Hero Section",
  "home-industry-experts-section": "Industry Experts",
  "home-program-experts-section": "Program Experts",
  "home-questions-section": "Questions",
  pages: "Pages",
  "page-content": "Page Content",
};

const ACTION_COLORS = {
  create: "bg-green-100 text-green-800",
  update: "bg-blue-100 text-blue-800",
  delete: "bg-red-100 text-red-800",
  view: "bg-gray-100 text-gray-800",
};

const ACCESS_OPTIONS = [
  { id: "pages", label: "Pages" },
  { id: "providers", label: "Providers" },
  { id: "courses", label: "Courses" },
  { id: "specializations", label: "Specializations" },
  { id: "leads", label: "Leads" },
  { id: "reviews", label: "Reviews" },
  { id: "users", label: "Users Management" },
];

export default function UsersPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSection, setFilterSection] = useState("");
  const [filterUserId, setFilterUserId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalActivities, setTotalActivities] = useState(0);
  const [users, setUsers] = useState([]);
  
  // Modal states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteAccessLevel, setInviteAccessLevel] = useState("viewer"); // "admin" or "viewer"
  const [inviteAccess, setInviteAccess] = useState([]);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState({ type: "", text: "" });

  const itemsPerPage = 20;

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users-list", {
        cache: "no-store",
      });

      const data = await res.json();

      if (res.ok) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (filterSection) params.append("section", filterSection);
      if (filterUserId) params.append("userId", filterUserId);
      
      params.append("limit", itemsPerPage);
      params.append("skip", (currentPage - 1) * itemsPerPage);

      const res = await fetch(`/api/admin/activities?${params.toString()}`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("API error:", data);
        setLoading(false);
        return;
      }

      setActivities(data.logs);
      setTotalActivities(data.total);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching activities:", err);
      setLoading(false);
    }
  };
    useEffect(() => {
        const loadData = async () => {
        await fetchUsers();
        await fetchActivities();
        };

        loadData();
    }, [filterSection, filterUserId, currentPage]);

  const handleAccessToggle = (accessId) => {
    setInviteAccess((prev) =>
      prev.includes(accessId)
        ? prev.filter((id) => id !== accessId)
        : [...prev, accessId]
    );
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setInviteMessage({ type: "", text: "" });

    if (!inviteEmail) {
      setInviteMessage({ type: "error", text: "Email is required" });
      return;
    }

    // If admin, grant all sections
    const accessToSend = inviteAccessLevel === "admin" 
      ? ACCESS_OPTIONS.map(opt => opt.id)
      : inviteAccess;

    if (accessToSend.length === 0) {
      setInviteMessage({ type: "error", text: "Please select at least one section" });
      return;
    }

    setInviteLoading(true);

    try {
      const res = await fetch("/api/auth/send-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail,
          access: accessToSend,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setInviteMessage({
          type: "error",
          text: data?.error || "Failed to send invite",
        });
        setInviteLoading(false);
        return;
      }

      setInviteMessage({
        type: "success",
        text: `Invitation sent to ${inviteEmail}! They will receive an email to set their password.`,
      });

      // Reset form
      setTimeout(() => {
        setInviteEmail("");
        setInviteAccessLevel("viewer");
        setInviteAccess([]);
        setInviteMessage({ type: "", text: "" });
        setShowInviteModal(false);
      }, 2000);
    } catch (err) {
      setInviteMessage({
        type: "error",
        text: "Network error. Please try again.",
      });
    } finally {
      setInviteLoading(false);
    }
  };

  const totalPages = Math.ceil(totalActivities / itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto p-3 text-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Activity Log & Users</h1>
        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
        >
          + Invite Admin
        </button>
      </div>

      {/* ================================ */}
      {/* Users Section */}
      {/* ================================ */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Active Users</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.length > 0 ? (
            users.map((user) => (
              <div
                key={user.userId}
                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition"
              >
                <div className="font-semibold text-gray-900">{user.userName}</div>
                <div className="text-xs text-gray-500 mt-1">{user.userEmail}</div>
                <button
                  onClick={() => setFilterUserId(user.userId)}
                  className="mt-3 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                >
                  View Activity
                </button>
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-sm">No users found</div>
          )}
        </div>
      </div>

      {/* ================================ */}
      {/* Filters */}
      {/* ================================ */}
      <div className="mb-6 flex gap-3 flex-wrap items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Filter by Section:</label>
          <select
            value={filterSection}
            onChange={(e) => {
              setFilterSection(e.target.value);
              setCurrentPage(1);
            }}
            className="border px-3 py-2 rounded-md text-sm"
          >
            <option value="">All Sections</option>
            {Object.entries(SECTION_NAMES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Filter by User:</label>
          <select
            value={filterUserId}
            onChange={(e) => {
              setFilterUserId(e.target.value);
              setCurrentPage(1);
            }}
            className="border px-3 py-2 rounded-md text-sm"
          >
            <option value="">All Users</option>
            {users.map((user) => (
              <option key={user.userId} value={user.userId}>
                {user.userName}
              </option>
            ))}
          </select>
        </div>

        {filterUserId && (
          <button
            onClick={() => {
              setFilterUserId("");
              setCurrentPage(1);
            }}
            className="text-sm bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300"
          >
            Clear User Filter (x)
          </button>
        )}
      </div>

      {/* ================================ */}
      {/* Activity Table */}
      {/* ================================ */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Action</th>
              <th className="p-3">Section</th>
              <th className="p-3">Item</th>
              <th className="p-3">Details</th>
              <th className="p-3">Time</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : activities.length > 0 ? (
              activities.map((activity) => (
                <tr key={activity._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <div className="font-medium text-sm">{activity.userName}</div>
                    <div className="text-xs text-gray-500">
                      {activity.userEmail}
                    </div>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        ACTION_COLORS[activity.action] ||
                        "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {activity.action.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 text-sm">
                    {SECTION_NAMES[activity.section] || activity.section}
                  </td>
                  <td className="p-3 text-sm font-medium max-w-xs truncate">
                    {activity.itemName || activity.itemId || "-"}
                  </td>
                  <td className="p-3 text-xs text-gray-600 max-w-md truncate">
                    {activity.details || "-"}
                  </td>
                  <td className="p-3 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(activity.createdAt).toLocaleDateString()}{" "}
                    {new Date(activity.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-500">
                  No activities found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================================ */}
      {/* Pagination */}
      {/* ================================ */}
      {totalPages > 1 && (
        <div className="mt-6 flex gap-2 justify-center items-center">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-md border disabled:opacity-50 hover:bg-gray-100"
          >
            Previous
          </button>

          <div className="text-sm">
            Page {currentPage} of {totalPages}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-md border disabled:opacity-50 hover:bg-gray-100"
          >
            Next
          </button>
        </div>
      )}

      {/* ================================ */}
      {/* Invite Admin Modal */}
      {/* ================================ */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Invite Admin</h2>
            <p className="text-sm text-gray-600 mb-6">
              Send an invitation email to a new admin. They will set their password and can then log in.
            </p>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Access Level *
                </label>
                <select
                  value={inviteAccessLevel}
                  onChange={(e) => {
                    setInviteAccessLevel(e.target.value);
                    // If switching to admin, auto-select all sections
                    if (e.target.value === "admin") {
                      setInviteAccess(ACCESS_OPTIONS.map(opt => opt.id));
                    } else {
                      setInviteAccess([]);
                    }
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="viewer">Read-only (Select Sections)</option>
                  <option value="admin">Admin (Full Access)</option>
                </select>
              </div>

              {inviteAccessLevel === "viewer" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Select Sections *
                  </label>
                  <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    {ACCESS_OPTIONS.map((option) => (
                      <label
                        key={option.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={inviteAccess.includes(option.id)}
                          onChange={() => handleAccessToggle(option.id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {inviteAccessLevel === "admin" && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    ✓ Admin will have full access to all sections
                  </p>
                </div>
              )}

              {inviteMessage.text && (
                <div
                  className={`p-3 rounded-lg text-sm font-medium ${
                    inviteMessage.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {inviteMessage.text}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteEmail("");
                    setInviteRole("viewer");
                    setInviteAccess([]);
                    setInviteMessage({ type: "", text: "" });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 font-medium transition"
                >
                  {inviteLoading ? "Sending..." : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
