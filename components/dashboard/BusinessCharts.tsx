"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const revenueData = [
  { month: "Feb", revenue: 4200 },
  { month: "Mar", revenue: 5100 },
  { month: "Apr", revenue: 4800 },
  { month: "May", revenue: 6300 },
  { month: "Jun", revenue: 7100 },
  { month: "Jul", revenue: 6800 },
];

const categoryData = [
  { category: "Phones", sales: 3200 },
  { category: "Accessories", sales: 1800 },
  { category: "Appliances", sales: 2600 },
  { category: "TVs", sales: 1400 },
];

export function RevenueChart() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-800">Revenue Trend</h3>
        <p className="text-xs text-slate-500">Last 6 months</p>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={revenueData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef1f5" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#6366f1"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#6366f1" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryChart() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-800">Sales by Category</h3>
        <p className="text-xs text-slate-500">This month</p>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={categoryData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef1f5" />
          <XAxis dataKey="category" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
          <Bar dataKey="sales" fill="#a5b4fc" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}