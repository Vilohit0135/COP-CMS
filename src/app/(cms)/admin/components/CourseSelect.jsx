"use client";

import { useEffect, useState } from "react";

export default function CourseSelect({
  value,
  onChange,
  degreeTypeId,
  required = false,
}) {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const res = await fetch("/api/admin/courses", {
        cache: "no-store",
      });
      const data = await res.json();
      setCourses(data.filter((c) => c.isActive)); // Only show active courses
    };

    fetchCourses();
  }, []);

  const finalList = degreeTypeId
    ? courses.filter((c) =>
        c.degreeTypeId?._id === degreeTypeId || c.degreeTypeId === degreeTypeId
      )
    : courses;

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="border px-3 py-2 rounded-md w-full bg-white"
    >
      <option value="">Select Course</option>

      {finalList.map((course) => (
        <option key={course._id} value={course._id}>
          {course.name}
        </option>
      ))}
    </select>
  );
}
