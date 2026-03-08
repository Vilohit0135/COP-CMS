"use client";

import { useEffect, useState } from "react";
import { callApi } from "@/lib/apiClient";

export default function SpecializationSelect({
  value,
  onChange,
  courseId,
  required = false,
}) {
  const [specializations, setSpecializations] = useState([]);

  useEffect(() => {
    if (!courseId) {
      setSpecializations([]);
      return;
    }

    const fetchSpecializations = async () => {
      try {
        const res = await callApi(
          `/api/admin/specializations?courseId=${courseId}`,
          { cache: "no-store", auth: true }
        );

        if (res.ok) {
          const data = await res.json();
          setSpecializations(Array.isArray(data) ? data : []);
        } else {
          setSpecializations([]);
        }
      } catch (err) {
        console.error("Error fetching specializations:", err);
        setSpecializations([]);
      }
    };

    fetchSpecializations();
  }, [courseId]);

  // 🔥 If no course selected → just render empty list
  const finalList = courseId ? specializations : [];

  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="border px-3 py-2 rounded-md w-full bg-white"
    >
      <option value="">Select Specialization</option>

      {finalList.map((spec) => (
        <option key={spec._id} value={spec._id}>
          {spec.name}
        </option>
      ))}
    </select>
  );
}