"use client";

import { useEffect, useState } from "react";
import { callApi } from "@/lib/apiClient";

export default function DegreeTypeSelect({
  value,
  onChange,
  required = false,
}) {
  const [degreeTypes, setDegreeTypes] = useState([]);

  useEffect(() => {
    const fetchDegreeTypes = async () => {
      const res = await callApi("/api/admin/degree-types", {
        cache: "no-store",
        auth: true,
      });
      const data = await res.json();
      setDegreeTypes(data);
    };

    fetchDegreeTypes();
  }, []);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="border px-3 py-2 rounded-md w-full bg-white"
    >
      <option value="">Select Degree Type</option>

      {degreeTypes.map((degree) => (
        <option key={degree._id} value={degree._id}>
          {degree.name}
        </option>
      ))}
    </select>
  );
}