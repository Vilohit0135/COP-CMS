"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BookOpen, Building2, MessageSquare, Star } from "lucide-react";

// ─── Stat Card ────────────────────────────────────────────────────────

function StatCard({ title, value, icon: Icon, trend }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
          <Icon size={18} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            trend >= 0
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-500"
          }`}>
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-slate-800 mb-1">{value.toLocaleString()}</p>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{title}</p>
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border-2 border-slate-200 rounded-xl px-4 py-3 shadow-lg">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-sm font-bold text-slate-800">
          {p.value} <span className="text-slate-400 font-normal">{p.name}</span>
        </p>
      ))}
    </div>
  );
}

// ─── Chart Panel ─────────────────────────────────────────────────────

function ChartPanel({ title, subtitle, children, empty }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100">
        <h2 className="text-sm font-bold text-slate-700">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="p-6">
        {empty ? (
          <div className="flex flex-col items-center justify-center h-64 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 gap-2">
            <span className="text-2xl">📊</span>
            <p className="text-xs">No data available yet</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────

export default function AdminDashboard() {
  const [stats, setStats] = useState({ courses: 0, providers: 0, leads: 0, reviews: 0 });
  const [reviewsByRating, setReviewsByRating] = useState([]);
  const [leadsBySource, setLeadsBySource] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, reviewsRes, leadsRes] = await Promise.all([
          fetch("/api/admin/dashboard/stats"),
          fetch("/api/admin/dashboard/reviews-by-rating"),
          fetch("/api/admin/dashboard/leads-by-source"),
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (reviewsRes.ok) setReviewsByRating(await reviewsRes.json());
        if (leadsRes.ok) setLeadsBySource(await leadsRes.json());
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-400">Loading dashboard...</p>
      </div>
    );
  }

  const statCards = [
    { title: "Total Courses", value: stats.courses, icon: BookOpen },
    { title: "Total Providers", value: stats.providers, icon: Building2 },
    { title: "Total Leads", value: stats.leads, icon: MessageSquare },
    { title: "Total Reviews", value: stats.reviews, icon: Star },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ── Page Header ── */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            Welcome back — heres whats happening today.
          </p>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </div>

        {/* ── Charts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Reviews by Rating */}
          <ChartPanel
            title="Reviews by Rating"
            subtitle="Distribution of review scores"
            empty={reviewsByRating.length === 0}
          >
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={reviewsByRating} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="_id"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#1e293b"
                  strokeWidth={2.5}
                  dot={{ fill: "#1e293b", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: "#1e293b" }}
                  name="Reviews"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartPanel>

          {/* Leads by Source */}
          <ChartPanel
            title="Leads by Source"
            subtitle="Where your leads are coming from"
            empty={leadsBySource.length === 0}
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={leadsBySource} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="_id"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
                <Bar
                  dataKey="count"
                  fill="#1e293b"
                  name="Leads"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>

        </div>
      </div>
    </div>
  );
}