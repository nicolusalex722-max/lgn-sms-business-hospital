"use client";

import Modal from "./Attendancemodal";
import StudentAvatar from "./Studentavatar";
import { formatDateDMY, recordStats } from "@/lib/utils";
import type { AttendanceRecord } from "@/lib/types";

export default function AttendanceRecordModal({
  record,
  onClose,
}: {
  record: AttendanceRecord;
  onClose: () => void;
}) {
  const { present, absent, total, rate } = recordStats(record);

  return (
    <Modal title={`${record.className} · ${record.subject}`} subtitle={formatDateDMY(record.date)} onClose={onClose} wide>
      <div className="mb-5 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-3 text-center">
          <p className="text-xs text-slate-400">Present</p>
          <p className="text-lg font-bold text-emerald-600">{present}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-3 text-center">
          <p className="text-xs text-slate-400">Absent</p>
          <p className="text-lg font-bold text-rose-600">{absent}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-3 text-center">
          <p className="text-xs text-slate-400">Rate</p>
          <p className="text-lg font-bold text-slate-800">{Math.round(rate)}%</p>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-200">
        <div className="divide-y divide-slate-100">
          {record.entries.map((e) => (
            <div key={e.studentId} className="flex items-center gap-3 px-4 py-2.5">
              <StudentAvatar src={e.photoUrl} name={e.studentName} size={32} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">{e.studentName}</p>
                <p className="text-xs text-slate-400">{e.studentId}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  e.status === "Present" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                }`}
              >
                {e.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">{total} student{total === 1 ? "" : "s"} in this session</p>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}