"use client";

import { useEffect, useState } from "react";
import { callApi } from "@/lib/apiClient";

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
  { id: "provider-courses", label: "Provider Courses" },
  { id: "specializations", label: "Specializations" },
  { id: "degree-types", label: "Degree Types" },
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

  // Delete user modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteUserData, setDeleteUserData] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Update access modal
  const [showUpdateAccessModal, setShowUpdateAccessModal] = useState(false);
  const [updateAccessUser, setUpdateAccessUser] = useState(null);
  const [updateAccessLevel, setUpdateAccessLevel] = useState("viewer"); // "admin" or "viewer"
  const [updateAccessList, setUpdateAccessList] = useState([]);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState({ type: "", text: "" });

  const itemsPerPage = 20;

  const fetchUsers = async () => {
    try {
      const res = await callApi("/api/admin/users", {
        cache: "no-store",
        auth: true,
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

      const res = await callApi(`/api/admin/activities?${params.toString()}`, {
        cache: "no-store",
        auth: true,
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
    // ignore fetchActivities dependency, it's stable in this component
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterSection, filterUserId, currentPage]);

  const handleAccessToggle = (accessId) => {
    setInviteAccess((prev) =>
      prev.includes(accessId)
        ? prev.filter((id) => id !== accessId)
        : [...prev, accessId]
    );
  };

  const handleAccessToggleForUpdate = (accessId) => {
    setUpdateAccessList((prev) =>
      prev.includes(accessId)
        ? prev.filter((id) => id !== accessId)
        : [...prev, accessId]
    );
  };

  const handleDeleteUser = async () => {
    if (!deleteUserData) return;
    setDeleteLoading(true);

    try {
      const res = await callApi(`/api/admin/users/${deleteUserData.userId}`, {
        method: "DELETE",
        auth: true,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || "Failed to delete user");
        setDeleteLoading(false);
        return;
      }

      setUsers((prev) => prev.filter((u) => u.userId !== deleteUserData.userId));
      setShowDeleteModal(false);
      setDeleteUserData(null);
      alert(data.message);
    } catch (err) {
      alert("Network error. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleOpenUpdateAccessModal = (user) => {
    console.log("Opening update modal for user:", user);
    if (!user || !user.userId) {
      console.error("User object missing userId:", user);
      alert("Error: User ID not found. Please try again.");
      return;
    }
    setUpdateAccessUser(user);
    setUpdateAccessLevel(user.role === "admin" ? "admin" : "viewer");
    setUpdateAccessList(user.access || []);
    setUpdateMessage({ type: "", text: "" });
    setShowUpdateAccessModal(true);
  };

  const handleUpdateAccess = async () => {
    if (!updateAccessUser || !updateAccessUser.userId) {
      setUpdateMessage({
        type: "error",
        text: "User ID is missing. Please close and try again.",
      });
      return;
    }
    setUpdateLoading(true);
    
    const fetchUrl = `/api/admin/users/${updateAccessUser.userId}`;
    console.log("Updating access for user:", updateAccessUser.userId, "URL:", fetchUrl);

    // If admin, grant all sections; if viewer, use selected sections
    const accessToSend = updateAccessLevel === "admin" 
      ? ACCESS_OPTIONS.map(opt => opt.id)
      : updateAccessList;

    try {
      const res = await callApi(fetchUrl, {
        method: "PUT",
        auth: true,
        body: {
          access: accessToSend,
          role: updateAccessLevel === "admin" ? "admin" : "viewer",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setUpdateMessage({
          type: "error",
          text: data?.error || "Failed to update user access",
        });
        setUpdateLoading(false);
        return;
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.userId === updateAccessUser.userId
            ? { ...u, access: accessToSend, role: updateAccessLevel === "admin" ? "admin" : "viewer" }
            : u
        )
      );

      setUpdateMessage({
        type: "success",
        text: "User access updated successfully!",
      });

      setTimeout(() => {
        setShowUpdateAccessModal(false);
        setUpdateAccessUser(null);
        setUpdateAccessLevel("viewer");
        setUpdateAccessList([]);
        setUpdateMessage({ type: "", text: "" });
      }, 1500);
    } catch (err) {
      setUpdateMessage({
        type: "error",
        text: "Network error. Please try again.",
      });
    } finally {
      setUpdateLoading(false);
    }
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
      const res = await callApi("/api/auth/send-invite", {
        method: "POST",
        body: {
          email: inviteEmail,
          access: accessToSend,
          role: inviteAccessLevel === "admin" ? "admin" : "viewer",
        },
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
          + Invite User
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
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{user.userName}</div>
                    <div className="text-xs text-gray-500 mt-1">{user.userEmail}</div>
                  </div>
                  <div className="ml-2">
                    {user.role === "admin" ? (
                      <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-xs font-semibold">
                        Admin
                      </span>
                    ) : (
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-semibold">
                        Read-only
                      </span>
                    )}
                  </div>
                </div>
                {user.role !== "admin" && user.access && user.access.length > 0 && (
                  <div className="mt-2 text-xs">
                    <p className="text-gray-600 font-medium">Access:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {user.access.map((acc) => (
                        <span
                          key={acc}
                          className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs"
                        >
                          {acc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {user.role === "admin" && (
                  <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded text-xs text-purple-700">
                    ✓ Full access to all sections
                  </div>
                )}
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => setFilterUserId(user.userId)}
                    className="w-full text-xs bg-blue-100 text-blue-700 px-2 py-1.5 rounded hover:bg-blue-200 font-medium"
                  >
                    View Activity
                  </button>
                  <button
                    onClick={() => handleOpenUpdateAccessModal(user)}
                    className="w-full text-xs bg-amber-100 text-amber-700 px-2 py-1.5 rounded hover:bg-amber-200 font-medium"
                  >
                    Update Access
                  </button>
                  <button
                    onClick={() => {
                      setDeleteUserData(user);
                      setShowDeleteModal(true);
                    }}
                    className="w-full text-xs bg-red-100 text-red-700 px-2 py-1.5 rounded hover:bg-red-200 font-medium"
                  >
                    Delete User
                  </button>
                </div>
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
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Invite User</h2>
            <p className="text-sm text-gray-600 mb-6">
              Send an invitation email to a new user. Choose between Admin (full access) or Read-Only (view-only) access.
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
                    setInviteAccessLevel("viewer");
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

      {/* ================================ */}
      {/* Delete User Modal */}
      {/* ================================ */}
      {showDeleteModal && deleteUserData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Delete User</h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deleteUserData.userName}</span> ({deleteUserData.userEmail})? This
              action cannot be undone.
            </p>

            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-6">
              <p className="text-sm text-red-700">
                ⚠️ This will permanently delete the user account and all associated data.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteUserData(null);
                }}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 font-medium transition"
              >
                {deleteLoading ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================ */}
      {/* Update User Access Modal */}
      {/* ================================ */}
      {showUpdateAccessModal && updateAccessUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Update User Access</h2>
            <p className="text-sm text-gray-600 mb-6">
              Manage access for{" "}
              <span className="font-semibold">{updateAccessUser.userName}</span>
            </p>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Access Level
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50" style={{borderColor: updateAccessLevel === "admin" ? "#7c3aed" : "#d1d5db"}}>
                  <input
                    type="radio"
                    name="accessLevel"
                    value="admin"
                    checked={updateAccessLevel === "admin"}
                    onChange={(e) => {
                      setUpdateAccessLevel(e.target.value);
                      setUpdateAccessList(ACCESS_OPTIONS.map(opt => opt.id));
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-purple-600"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">Admin</div>
                    <div className="text-xs text-gray-600">Full access to edit and manage all sections</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50" style={{borderColor: updateAccessLevel === "viewer" ? "#3b82f6" : "#d1d5db"}}>
                  <input
                    type="radio"
                    name="accessLevel"
                    value="viewer"
                    checked={updateAccessLevel === "viewer"}
                    onChange={(e) => {
                      setUpdateAccessLevel(e.target.value);
                      setUpdateAccessList([]);
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">Read-Only</div>
                    <div className="text-xs text-gray-600">Can view activity but cannot edit anything</div>
                  </div>
                </label>
              </div>
            </div>

            {updateAccessLevel === "viewer" && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Select Sections to View
                </label>
                <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
                  {ACCESS_OPTIONS.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={updateAccessList.includes(option.id)}
                        onChange={() => handleAccessToggleForUpdate(option.id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {updateAccessLevel === "admin" && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg mb-4">
                <p className="text-sm text-purple-700">
                  ✓ Admin will have full access to all sections and can edit everything
                </p>
              </div>
            )}

            {updateMessage.text && (
              <div
                className={`p-3 rounded-lg text-sm font-medium mt-4 ${
                  updateMessage.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {updateMessage.text}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowUpdateAccessModal(false);
                  setUpdateAccessUser(null);
                  setUpdateAccessLevel("viewer");
                  setUpdateAccessList([]);
                  setUpdateMessage({ type: "", text: "" });
                }}
                disabled={updateLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateAccess}
                disabled={updateLoading}
                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-60 font-medium transition"
              >
                {updateLoading ? "Updating..." : "Update Access"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
