"use client";

import { useState } from "react";
import { MoreHorizontal, ChevronDown } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MonthlyEarnings {
  month: string;
  earnings: number;
  expenses: number;
}

// Sample data per year — replace with real data fetched from your API/Prisma
const DATA_BY_YEAR: Record<string, MonthlyEarnings[]> = {
  "2023": [
    { month: "Jan", earnings: 48000, expenses: 42000 },
    { month: "Feb", earnings: 41000, expenses: 12000 },
    { month: "Mar", earnings: 33000, expenses: 24000 },
    { month: "Apr", earnings: 38000, expenses: 34000 },
    { month: "May", earnings: 11000, expenses: 20000 },
    { month: "Jun", earnings: 32000, expenses: 12000 },
    { month: "Jul", earnings: 49000, expenses: 46000 },
    { month: "Aug", earnings: 33000, expenses: 11000 },
    { month: "Sep", earnings: 24000, expenses: 21000 },
    { month: "Oct", earnings: 38000, expenses: 34000 },
    { month: "Nov", earnings: 11000, expenses: 20000 },
    { month: "Dec", earnings: 31000, expenses: 9000 },
  ],
  "2022": [
    { month: "Jan", earnings: 39000, expenses: 30000 },
    { month: "Feb", earnings: 35000, expenses: 15000 },
    { month: "Mar", earnings: 28000, expenses: 20000 },
    { month: "Apr", earnings: 31000, expenses: 26000 },
    { month: "May", earnings: 15000, expenses: 18000 },
    { month: "Jun", earnings: 27000, expenses: 10000 },
    { month: "Jul", earnings: 42000, expenses: 38000 },
    { month: "Aug", earnings: 29000, expenses: 9000 },
    { month: "Sep", earnings: 22000, expenses: 19000 },
    { month: "Oct", earnings: 33000, expenses: 28000 },
    { month: "Nov", earnings: 9000, expenses: 17000 },
    { month: "Dec", earnings: 26000, expenses: 8000 },
  ],
};

const YEARS = Object.keys(DATA_BY_YEAR);

function formatCurrency(value: number): string {
  return `$${value.toLocaleString()}`;
}

function formatThousands(value: number): string {
  return `${value / 1000}K`;
}

function YearMenu({
  year,
  onChange,
}: {
  year: string;
  onChange: (year: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-rose-200 text-rose-500 text-xs font-medium hover:bg-rose-50 transition-colors"
      >
        {year}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-24 bg-white rounded-md border border-slate-200 shadow-lg z-20 py-1">
          {YEARS.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => {
                onChange(y);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
            >
              {y}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ChartLegend() {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="w-2.5 h-2.5 rounded-full bg-blue-800" />
        Earnings
      </div>
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        Expenses
      </div>
    </div>
  );
}

export default function TotalEarningsChart() {
  const [year, setYear] = useState<string>(YEARS[0]);
  const data = DATA_BY_YEAR[year];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h3 className="text-base font-semibold text-slate-800">Total Earnings</h3>

        <div className="flex items-center gap-4">
          <ChartLegend />
          <YearMenu year={year} onChange={setYear} />
          <button type="button" aria-label="More options" className="text-slate-400 hover:text-slate-600">
            <MoreHorizontal className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barGap={2} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="#eef1f5" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatThousands}
            tick={{ fontSize: 12, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
          />
          <Bar dataKey="earnings" name="Earnings" fill="#1e3a5f" radius={[3, 3, 0, 0]} maxBarSize={10} />
          <Bar dataKey="expenses" name="Expenses" fill="#f0b93a" radius={[3, 3, 0, 0]} maxBarSize={10} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}