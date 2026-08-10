"use client";

import Modal from "./Resultmodal";
import GradeBadge from "./Gradebadge";
import DivisionBadge from "./Divisionbadge";
import { GRADE_POINTS } from "@/lib/grading";
import type { StudentSummary } from "@/lib/types";

export default function StudentResultModal({
  summary,
  onClose,
}: {
  summary: StudentSummary;
  onClose: () => void;
}) {
  return (
    <Modal title={summary.studentName} subtitle={`${summary.studentId} · ${summary.className} · ${summary.examType}`} onClose={onClose}>
      <div className="mb-5 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3">
        <div>
          <p className="text-xs text-slate-400">Total points</p>
          <p className="text-xl font-bold text-slate-900">{summary.totalPoints}</p>
        </div>
        <DivisionBadge division={summary.division} />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <th className="px-4 py-2.5">Subject</th>
              <th className="px-4 py-2.5 text-right">Marks</th>
              <th className="px-4 py-2.5 text-center">Grade</th>
              <th className="px-4 py-2.5 text-right">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {summary.subjects.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-2.5 font-medium text-slate-800">{s.subject}</td>
                <td className="px-4 py-2.5 text-right font-mono text-slate-700">{s.marks}</td>
                <td className="px-4 py-2.5 text-center">
                  <GradeBadge grade={s.grade} />
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-slate-500">{GRADE_POINTS[s.grade]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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