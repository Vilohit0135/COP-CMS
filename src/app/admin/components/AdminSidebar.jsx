"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Layers,
  Building2,
  Link2,
  Users,
  MessageSquare,
  Star,
  ChevronDown,
} from "lucide-react";

const sidebarItems = [
  {
    name: "Dashboard",
    path: "/admin",
    icon: <LayoutDashboard size={18} />,
  },
  {
    name: "Blogs",
    path: "/admin/blogs",
    icon: <BookOpen size={18} />,
  },
  {
     name: "Courses",
     path: "/admin/courses",
    icon: <GraduationCap size={18} />,
  },
  {
    name: "Degree Types",
    path: "/admin/degree-types",
    icon: <Layers size={18} />,
  },
  {
    name: "Specializations",
    path: "/admin/specializations",
    icon: <Layers size={18} />,
  },
  {
    name: "Providers",
    path: "/admin/providers",
    icon: <Building2 size={18} />,
  },
  {
    name: "Provider Courses",
    path: "/admin/provider-courses",
    icon: <Link2 size={18} />,
  },
  {
    name: "Leads",
    path: "/admin/leads",
    icon: <MessageSquare size={18} />,
  },
  {
    name: "Reviews",
    path: "/admin/reviews",
    icon: <Star size={18} />,
  },
  {
    name: "Users",
    path: "/admin/users",
    icon: <Users size={18} />,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState(null);

  return (
    <aside className="w-64 h-screen bg-white border-r shadow-lg p-2 text-gray-800 border-6 border-gray-200">
      <h2 className="text-xl font-bold mb-10">COP CMS Admin</h2>

      <nav className="space-y-5">
        {sidebarItems.map((item) => {
          const isActive =
            pathname === item.path ||
            (item.children &&
              item.children.some((child) => child.path === pathname));

          if (item.children) {
            return (
              <div key={item.name}>
                <button
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === item.name ? null : item.name
                    )
                  }
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-gray-800 ${
                    isActive
                      ? "bg-gray-100 font-semibold"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {item.icon}
                    {item.name}
                  </div>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      openDropdown === item.name ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openDropdown === item.name && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        href={child.path}
                        className={`block px-3 py-2 rounded-md text-sm ${
                          pathname === child.path
                            ? "bg-gray-200 font-medium"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-gray-800 ${
                pathname === item.path
                  ? "bg-gray-200 font-semibold"
                  : "hover:bg-gray-100"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}