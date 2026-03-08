"use client";

import { useEffect, useState } from "react";
import { callApi } from "@/lib/apiClient";

export default function SpecializationTypeSelect({
  value,
  onChange,
  required = false,
}) {
  const [specializationTypes, setSpecializationTypes] = useState([]);

  useEffect(() => {
    const fetchSpecializationTypes = async () => {
      try {
        const res = await callApi("/api/admin/specialization-types", {
          cache: "no-store",
          auth: true,
        });

        const data = await res.json();
        setSpecializationTypes(data);
      } catch (error) {
        console.error("Failed to fetch specialization types", error);
      }
    };

    fetchSpecializationTypes();
  }, []);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="border px-3 py-2 rounded-md w-full bg-white"
    >
      <option value="">Select Specialization Type</option>

      {specializationTypes.map((specialization) => (
        <option key={specialization._id} value={specialization._id}>
          {specialization.name}
        </option>
      ))}
    </select>
  );
}