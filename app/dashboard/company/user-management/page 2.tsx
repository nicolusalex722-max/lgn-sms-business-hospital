"use client";

import { useMemo, useState } from "react";
import { Plus, Search, SlidersHorizontal, Grid3x3, LayoutGrid } from "lucide-react";
import UserTable, { AppUser } from "@/components/company-components/Usertable";
import UserForm from "@/components/company-components/Userform";
import Modal from "@/components/dashboard/Modal";
import FilterDropdown from "@/components/dashboard/Filterdropdown";

const ROLE_OPTIONS = ["Admin", "FIELD_STAFF", "Finance", "Manager"];

const INITIAL_DATA: AppUser[] = [
  { id: "u-001", name: "Nicolaus", email: "nico@lgn.com", phone: "+255700000000", role: "Admin", linkedEmployee: "Admin Zacbook - manager", lastLogin: "just now", emailVerified: "Verified", status: "Active" },
  { id: "u-002", name: "Asha", email: "asha@gmail.com", phone: "+255758303307", role: "FIELD_STAFF", linkedEmployee: "", lastLogin: "2 weeks ago", emailVerified: "Verified", status: "Active" },
  { id: "u-003", name: "Maalim", email: "hussei1@gmail.com", phone: "+255758303309", role: "Manager", linkedEmployee: "", lastLogin: "3 weeks ago", emailVerified: "Pending", status: "Active" },

];

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>(INITIAL_DATA);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase();
      const matchesSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchesRole = roleFilter === "All" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const handleCreate = (data: Omit<AppUser, "id" | "lastLogin" | "emailVerified">) => {
    setUsers((prev) => [
      { ...data, id: crypto.randomUUID(), lastLogin: "Never", emailVerified: "Pending" },
      ...prev,
    ]);
    setCreateOpen(false);
  };

  const openEdit = (user: AppUser) => {
    setEditingUser(user);
    setEditOpen(true);
  };
  const closeEdit = () => {
    setEditOpen(false);
    setEditingUser(null);
  };
  const handleEditSubmit = (data: Omit<AppUser, "id" | "lastLogin" | "emailVerified">) => {
    if (!editingUser) return;
    setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? { ...u, ...data } : u)));
    closeEdit();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage system users, create, update, and delete accounts</p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create User
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Users Directory</h2>
            <p className="text-sm text-slate-500">View and manage all users in your company</p>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            <button
              type="button"
              aria-label="Table view"
              className="w-9 h-9 flex items-center justify-center rounded-md bg-white text-indigo-600 shadow-sm"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label="Card view"
              className="w-9 h-9 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-700"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <FilterDropdown
            label="Role"
            icon={SlidersHorizontal}
            value={roleFilter}
            options={ROLE_OPTIONS}
            allLabel="Filters"
            onChange={setRoleFilter}
          />
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <UserTable users={filtered} onEdit={openEdit} />
        </div>

        <p className="text-sm text-slate-500 mt-4">
          Showing <span className="font-semibold text-slate-700">1&ndash;{filtered.length}</span> / {users.length}
        </p>
      </div>

      {/* Create User modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create New User">
        <UserForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} />
      </Modal>

      {/* Edit User modal */}
      <Modal open={editOpen} onClose={closeEdit} title="Edit User">
        {editingUser && <UserForm initialValue={editingUser} onSubmit={handleEditSubmit} onCancel={closeEdit} />}
      </Modal>
    </div>
  );
}