"use client";

import { useState } from "react";
import type { LeaveRequest } from "./Leavetable";

interface LeaveFormProps {
  onSubmit: (data: Omit<LeaveRequest, "id" | "status" | "requestedAt">) => void;
  onCancel: () => void;
}

const EMPLOYEE_OPTIONS = ["Asha Mwakalinga", "John David Mushi", "Neema Kilonzo"];
const LEAVE_TYPES = ["Annual Leave", "Sick Leave", "Maternity Leave", "Paternity Leave", "Compassionate Leave", "Unpaid Leave"];
const APPROVER_OPTIONS = ["Admin Zacbook", "Asha Mwakalinga (Finance Manager)", "Boss Alex"];

export default function LeaveForm({ onSubmit, onCancel }: LeaveFormProps) {
  const [employee, setEmployee] = useState(EMPLOYEE_OPTIONS[0]);
  const [leaveType, setLeaveType] = useState(LEAVE_TYPES[0]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [approver, setApprover] = useState(APPROVER_OPTIONS[0]);

  const dateError = startDate && endDate && endDate < startDate ? "End date can't be before the start date." : "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || dateError) return;

    onSubmit({
      employee,
      leaveType,
      startDate,
      endDate,
      description: description.trim(),
      approver,
    });
  };

  const fieldClass =
    "px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";
  const labelClass = "text-xs font-medium text-slate-500";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Employee *</label>
        <select value={employee} onChange={(e) => setEmployee(e.target.value)} className={`${fieldClass} bg-white`}>
          {EMPLOYEE_OPTIONS.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Type of Leave *</label>
        <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} className={`${fieldClass} bg-white`}>
          {LEAVE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Start Date *</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className={fieldClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass}>End Date *</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required className={fieldClass} />
        </div>
      </div>
      {dateError && <p className="text-xs text-rose-600 -mt-2">{dateError}</p>}

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Reason for the leave request..."
          className={`${fieldClass} resize-none`}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Approver *</label>
        <select value={approver} onChange={(e) => setApprover(e.target.value)} className={`${fieldClass} bg-white`}>
          {APPROVER_OPTIONS.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button type="submit" className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
          Submit Request
        </button>
      </div>
    </form>
  );
}