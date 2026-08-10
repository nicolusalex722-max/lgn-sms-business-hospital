"use client";

import { Check, X } from "lucide-react";

export interface LeaveRequest {
  id: string;
  employee: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  description: string;
  approver: string;
  status: string;
  requestedAt: string;
}

interface LeaveTableProps {
  leaves: LeaveRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Approved: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-rose-100 text-rose-700",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}

function countDays(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return diff > 0 ? diff : 0;
}

function formatDate(value: string) {
  if (!value) return "\u2014";
  return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function LeaveTable({ leaves, onApprove, onReject }: LeaveTableProps) {
  if (leaves.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
        <p className="text-sm text-slate-500">No leave requests match your search.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left font-medium text-slate-500 px-5 py-4">Employee</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Type</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Start</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">End</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Days</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Approver</th>
              <th className="text-left font-medium text-slate-500 px-2 py-4">Status</th>
              <th className="text-right font-medium text-slate-500 px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((leave) => (
              <tr key={leave.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                <td className="px-5 py-4">
                  <div className="font-semibold text-slate-800">{leave.employee}</div>
                  {leave.description && (
                    <div className="text-xs text-slate-400 max-w-xs truncate" title={leave.description}>
                      {leave.description}
                    </div>
                  )}
                </td>
                <td className="px-2 py-4 text-slate-600">{leave.leaveType}</td>
                <td className="px-2 py-4 text-slate-500">{formatDate(leave.startDate)}</td>
                <td className="px-2 py-4 text-slate-500">{formatDate(leave.endDate)}</td>
                <td className="px-2 py-4 text-slate-600">{countDays(leave.startDate, leave.endDate)}</td>
                <td className="px-2 py-4 text-slate-500">{leave.approver}</td>
                <td className="px-2 py-4">
                  <StatusBadge status={leave.status} />
                </td>
                <td className="px-5 py-4">
                  {leave.status === "Pending" ? (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onApprove(leave.id)}
                        aria-label={`Approve ${leave.employee}'s leave`}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onReject(leave.id)}
                        aria-label={`Reject ${leave.employee}'s leave`}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 block text-right">&mdash;</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}