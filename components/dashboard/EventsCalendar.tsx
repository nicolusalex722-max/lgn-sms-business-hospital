"use client";

import { useState } from "react";
import { MoreHorizontal, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

const EVENTS = [
  { date: "01 Jan, 2026", title: "New Year Celebration", dot: "bg-amber-400" },
  { date: "26 Jan, 2026", title: "Republic Day Celebration", dot: "bg-blue-800" },
];

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function getCalendarGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

export default function EventsCalendar() {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const monthLabel = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const cells = getCalendarGrid(viewDate.getFullYear(), viewDate.getMonth());

  const isToday = (day: number) =>
    day === today.getDate() &&
    viewDate.getMonth() === today.getMonth() &&
    viewDate.getFullYear() === today.getFullYear();

  const goToMonth = (delta: number) => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-800">Events Calendar</h3>
        <button type="button" aria-label="More options" className="text-slate-400 hover:text-slate-600">
          <MoreHorizontal className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Upcoming event cards */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {EVENTS.map((ev) => (
          <div key={ev.title} className="border border-slate-200 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5">
              <span className={`w-2 h-2 rounded-full ${ev.dot}`} />
              {ev.date}
            </div>
            <div className="flex items-start justify-between gap-1">
              <p className="text-sm font-semibold text-slate-800 leading-snug">{ev.title}</p>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            </div>
          </div>
        ))}
      </div>

      {/* Mini calendar */}
      <div className="bg-slate-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-slate-800">{monthLabel}</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => goToMonth(-1)}
              aria-label="Previous month"
              className="w-6 h-6 flex items-center justify-center rounded-md text-slate-400 hover:bg-white hover:text-slate-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => goToMonth(1)}
              aria-label="Next month"
              className="w-6 h-6 flex items-center justify-center rounded-md text-slate-400 hover:bg-white hover:text-slate-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-y-2 text-center">
          {WEEKDAYS.map((d) => (
            <span key={d} className="text-[10px] font-medium text-slate-400">
              {d}
            </span>
          ))}
          {cells.map((day, idx) =>
            day === null ? (
              <span key={`empty-${idx}`} />
            ) : (
              <span
                key={day}
                className={`w-7 h-7 mx-auto flex items-center justify-center rounded-full text-xs ${
                  isToday(day)
                    ? "bg-blue-800 text-white font-semibold"
                    : "text-slate-600 hover:bg-white cursor-pointer"
                }`}
              >
                {day}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}