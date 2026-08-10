"use client";

import { useState } from "react";
import type { Employee } from "./Employeetable";

interface EmployeeFormProps {
  initialValue?: Employee | null;
  onSubmit: (data: Omit<Employee, "id">) => void;
  onCancel: () => void;
}

const DEPARTMENT_OPTIONS = ["Collections", "Credit", "Customer Service", "Finance", "Human Resources", "Information Technology", "Operations"];
const BRANCH_OPTIONS = ["Head Office", "Mwanza Branch", "Arusha Branch"];

export default function EmployeeForm({ initialValue, onSubmit, onCancel }: EmployeeFormProps) {
  const [firstName, setFirstName] = useState(initialValue?.firstName ?? "");
  const [middleName, setMiddleName] = useState(initialValue?.middleName ?? "");
  const [lastName, setLastName] = useState(initialValue?.lastName ?? "");
  const [email, setEmail] = useState(initialValue?.email ?? "");
  const [department, setDepartment] = useState(initialValue?.department ?? "");
  const [branch, setBranch] = useState(initialValue?.branch ?? "");
  const [phone, setPhone] = useState(initialValue?.phone ?? "");
  const [salary, setSalary] = useState(initialValue ? String(initialValue.salary) : "");
  const [birthdate, setBirthdate] = useState(initialValue?.birthdate ?? "");
  const [position, setPosition] = useState(initialValue?.position ?? "");
  const [nextOfKin, setNextOfKin] = useState(initialValue?.nextOfKin ?? "");
  const [guarantorPhone, setGuarantorPhone] = useState(initialValue?.guarantorPhone ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) return;

    onSubmit({
      firstName: firstName.trim(),
      middleName: middleName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      department,
      branch,
      phone: phone.trim(),
      salary: Number(salary) || 0,
      birthdate,
      position: position.trim(),
      nextOfKin: nextOfKin.trim(),
      guarantorPhone: guarantorPhone.trim(),
    });
  };

  const fieldClass =
    "px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";
  const labelClass = "text-xs font-medium text-slate-500";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-h-[70vh] overflow-y-auto pr-1">
      {/* Identity */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1">
          <label className={labelClass}>First Name *</label>
          <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required autoFocus className={fieldClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Middle Name</label>
          <input type="text" value={middleName} onChange={(e) => setMiddleName(e.target.value)} className={fieldClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Last Name *</label>
          <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className={fieldClass} />
        </div>
      </div>

      {/* Contact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Email *</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={fieldClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Phone *</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className={fieldClass} />
        </div>
      </div>

      {/* Department / Branch — optional */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Department (optional)</label>
          <select value={department} onChange={(e) => setDepartment(e.target.value)} className={`${fieldClass} bg-white`}>
            <option value="">Not assigned</option>
            {DEPARTMENT_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Branch (optional)</label>
          <select value={branch} onChange={(e) => setBranch(e.target.value)} className={`${fieldClass} bg-white`}>
            <option value="">Not assigned</option>
            {BRANCH_OPTIONS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Employment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Position *</label>
          <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} required className={fieldClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Salary (TZS) *</label>
          <input type="number" min="0" value={salary} onChange={(e) => setSalary(e.target.value)} required className={fieldClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Birthdate *</label>
          <input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} required className={fieldClass} />
        </div>
      </div>

      {/* Emergency contact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Next of Kin *</label>
          <input type="text" value={nextOfKin} onChange={(e) => setNextOfKin(e.target.value)} required placeholder="Full name" className={fieldClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Guarantor Phone *</label>
          <input type="tel" value={guarantorPhone} onChange={(e) => setGuarantorPhone(e.target.value)} required className={fieldClass} />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 sticky bottom-0 bg-white">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button type="submit" className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
          {initialValue ? "Save Changes" : "Add Employee"}
        </button>
      </div>
    </form>
  );
}