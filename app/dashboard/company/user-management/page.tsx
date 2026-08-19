"use client";

import { useMemo, useState } from "react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";

import UserForm from "@/components/company-components/Userform";
import UserTable from "@/components/company-components/Usertable";
import FilterDropdown from "@/components/dashboard/Filterdropdown";
import Modal from "@/components/dashboard/Modal";
import { useCompanyUsers } from "@/hooks/use-company-users";
import { useEmployees } from "@/hooks/use-employees";
import type { CompanyUser } from "@/lib/types";
import type {
  CompanyUserCreateInput,
  CompanyUserUpdateInput,
} from "@/lib/validations/company-users-schema";

const ROLE_OPTIONS = ["User"];

export default function UsersPage() {
  const {
    companyUsers,
    loading,
    error,
    fetchCompanyUsers,
    createCompanyUser,
    updateCompanyUser,
    deleteCompanyUser,
  } = useCompanyUsers();
  const { employees } = useEmployees();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<CompanyUser | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return companyUsers.filter((user) => {
      const name =
        user.displayName ??
        [user.employee?.firstName, user.employee?.lastName]
          .filter(Boolean)
          .join(" ");
      const matchesSearch =
        !query ||
        name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query);
      return (
        matchesSearch && (roleFilter === "All" || user.role === roleFilter)
      );
    });
  }, [companyUsers, roleFilter, search]);

  const closeForm = () => {
    if (!submitting) {
      setFormOpen(false);
      setEditingUser(null);
    }
  };
  const save = async (
    data: CompanyUserCreateInput | CompanyUserUpdateInput,
  ) => {
    setSubmitting(true);
    const result = editingUser
      ? await updateCompanyUser(editingUser.id, data as CompanyUserUpdateInput)
      : await createCompanyUser(data as CompanyUserCreateInput);
    setSubmitting(false);
    if (result.success) {
      setFormOpen(false);
      setEditingUser(null);
    }
  };
  const remove = async (user: CompanyUser) => {
    if (
      window.confirm(
        `Delete ${user.displayName ?? user.email}? This also removes the login account and cannot be undone.`,
      )
    )
      await deleteCompanyUser(user.id);
  };

  if (loading)
    return (
      <p className="py-10 text-center text-sm text-slate-500">Loading users…</p>
    );
  if (!companyUsers.length && error)
    return (
      <div className="py-10 text-center">
        <p className="text-sm text-rose-600">{error}</p>
        <button
          type="button"
          onClick={() => void fetchCompanyUsers()}
          className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Try again
        </button>
      </div>
    );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage login accounts for employees in your company.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingUser(null);
            setFormOpen(true);
          }}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Create User
        </button>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-800">Users Directory</h2>
          <p className="text-sm text-slate-500">
            View and manage all users in your company.
          </p>
        </div>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search users..."
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-11 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <FilterDropdown
            label="Role"
            icon={SlidersHorizontal}
            value={roleFilter}
            options={ROLE_OPTIONS}
            allLabel="All roles"
            onChange={setRoleFilter}
          />
        </div>
        {error && <p className="mb-4 text-sm text-rose-600">{error}</p>}
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <UserTable
            users={filtered}
            onEdit={(user) => {
              setEditingUser(user);
              setFormOpen(true);
            }}
            onDelete={remove}
          />
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-700">
            {filtered.length}
          </span>{" "}
          of {companyUsers.length} users
        </p>
      </div>
      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editingUser ? "Edit User" : "Create New User"}
      >
        <UserForm
          initialValue={editingUser}
          employees={employees}
          submitting={submitting}
          error={error}
          onSubmit={save}
          onCancel={closeForm}
        />
      </Modal>
    </div>
  );
}
