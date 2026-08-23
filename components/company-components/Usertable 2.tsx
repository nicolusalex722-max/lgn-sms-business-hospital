"use client";

import { useState } from "react";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  linkedEmployee: string;
  lastLogin: string;
  emailVerified: string;
  status: string;
}

interface UserTableProps {
  users: AppUser[];
  onEdit: (user: AppUser) => void;
}

function RoleBadge({ role }: { role: string }) {
  if (role === "Admin") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-600 text-white">
        {role}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border border-slate-300 text-slate-700 bg-white">
      {role}
    </span>
  );
}

function NeutralPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
      {label}
    </span>
  );
}

export default function UserTable({ users, onEdit }: UserTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const allSelected = users.length > 0 && selected.size === users.length;

  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(users.map((u) => u.id)));
  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (users.length === 0) {
    return (
      <div className="p-10 text-center">
        <p className="text-sm text-slate-500">No users match your search.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="w-10 px-5 py-3.5">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
              />
            </th>
            <th className="text-left font-medium text-slate-500 px-2 py-3.5">Name</th>
            <th className="text-left font-medium text-slate-500 px-2 py-3.5">Email</th>
            <th className="text-left font-medium text-slate-500 px-2 py-3.5">Phone</th>
            <th className="text-left font-medium text-slate-500 px-2 py-3.5">Role</th>
            <th className="text-left font-medium text-slate-500 px-2 py-3.5">Last Login</th>
            <th className="text-left font-medium text-slate-500 px-2 py-3.5">Email Verified</th>
            <th className="text-left font-medium text-slate-500 px-2 py-3.5">Status</th>
            <th className="text-right font-medium text-slate-500 px-5 py-3.5">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
              <td className="px-5 py-4">
                <input
                  type="checkbox"
                  checked={selected.has(user.id)}
                  onChange={() => toggleOne(user.id)}
                  className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
                />
              </td>
              <td className="px-2 py-4 font-semibold text-slate-800">{user.name}</td>
              <td className="px-2 py-4 text-slate-600">{user.email}</td>
              <td className="px-2 py-4 text-slate-500">{user.phone || "\u2014"}</td>
              <td className="px-2 py-4">
                <RoleBadge role={user.role} />
              </td>
              <td className="px-2 py-4 text-slate-500">{user.lastLogin}</td>
              <td className="px-2 py-4">
                <NeutralPill label={user.emailVerified} />
              </td>
              <td className="px-2 py-4">
                <NeutralPill  label={user.status} />
              </td>
              <td className="px-5 py-4 text-right">
                <button
                  type="button"
                  onClick={() => onEdit(user)}
                  className="px-4 py-1.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}