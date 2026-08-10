"use client";

import { MoreHorizontal } from "lucide-react";
import { PieChart, Pie, Cell } from "recharts";

const STUDENTS_PCT = 84;
const FACULTY_PCT = 91;

export default function AttendanceDonut() {
  const studentsData = [
    { value: STUDENTS_PCT, color: "#1e3a5f" },
    { value: 100 - STUDENTS_PCT, color: "#e2e8f0" },
  ];
  const facultyData = [
    { value: FACULTY_PCT, color: "#f0b93a" },
    { value: 100 - FACULTY_PCT, color: "#e2e8f0" },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-800">Attendance</h3>
        <button type="button" aria-label="More options" className="text-slate-400 hover:text-slate-600">
          <MoreHorizontal className="w-4.5 h-4.5" />
        </button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative w-40 h-40 shrink-0">
          <PieChart width={160} height={160}>
            <Pie
              data={studentsData}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={72}
              startAngle={90}
              endAngle={-270}
              stroke="none"
            >
              {studentsData.map((entry, i) => (
                <Cell key={`s-${i}`} fill={entry.color} />
              ))}
            </Pie>
            <Pie
              data={facultyData}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={38}
              outerRadius={52}
              startAngle={90}
              endAngle={-270}
              stroke="none"
            >
              {facultyData.map((entry, i) => (
                <Cell key={`f-${i}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-800 shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Students</p>
              <p className="text-lg font-bold text-slate-800">{STUDENTS_PCT}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Faculty</p>
              <p className="text-lg font-bold text-slate-800">{FACULTY_PCT}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}