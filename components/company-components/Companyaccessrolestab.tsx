"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Modal from "@/components/dashboard/Modal";

const ACTIONS = ["view", "create", "edit", "delete"] as const;
type Action = (typeof ACTIONS)[number];

const ACTION_LABELS: Record<Action, string> = {
  view: "View",
  create: "Create",
  edit: "Edit",
  delete: "Delete",
};

type ModulePermissions = Record<Action, boolean>;
type RolePermissions = Record<string, ModulePermissions>;
type AllPermissions = Record<string, RolePermissions>;

const INITIAL_MODULES = ["Dashboard", "Companies", "Products", "Subscriptions", "Reports", "Settings"];
const INITIAL_ROLES = ["Admin", "Finance", "Staff"];

function emptyModulePerms(defaultOn: boolean): ModulePermissions {
  return { view: defaultOn, create: defaultOn, edit: defaultOn, delete: defaultOn };
}

function buildRolePermissions(modules: string[], defaultViewOnly: boolean): RolePermissions {
  const perms: RolePermissions = {};
  for (const mod of modules) {
    perms[mod] = defaultViewOnly ? { ...emptyModulePerms(false), view: true } : emptyModulePerms(true);
  }
  return perms;
}

function buildDefaultPermissions(): AllPermissions {
  const state: AllPermissions = {};
  for (const role of INITIAL_ROLES) {
    state[role] = buildRolePermissions(INITIAL_MODULES, role !== "Admin");
  }
  return state;
}

export default function CompanyAccessRolesTab() {
  const [modules, setModules] = useState<string[]>(INITIAL_MODULES);
  const [roles, setRoles] = useState<string[]>(INITIAL_ROLES);
  const [permissions, setPermissions] = useState<AllPermissions>(buildDefaultPermissions);
  const [activeRole, setActiveRole] = useState(roles[0]);

  const [addRoleOpen, setAddRoleOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");

  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [editRoleName, setEditRoleName] = useState("");

  const [deleteRoleOpen, setDeleteRoleOpen] = useState(false);

  const [addPrivilegeOpen, setAddPrivilegeOpen] = useState(false);
  const [newPrivilegeName, setNewPrivilegeName] = useState("");

  const rolePerms = permissions[activeRole];

  const toggleCell = (mod: string, action: Action) => {
    setPermissions((prev) => ({
      ...prev,
      [activeRole]: {
        ...prev[activeRole],
        [mod]: { ...prev[activeRole][mod], [action]: !prev[activeRole][mod][action] },
      },
    }));
  };

  const toggleRow = (mod: string, value: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [activeRole]: { ...prev[activeRole], [mod]: emptyModulePerms(value) },
    }));
  };

  const toggleColumn = (action: Action, value: boolean) => {
    setPermissions((prev) => {
      const nextRole: RolePermissions = {};
      for (const mod of modules) {
        nextRole[mod] = { ...prev[activeRole][mod], [action]: value };
      }
      return { ...prev, [activeRole]: nextRole };
    });
  };

  const setAll = (value: boolean) => {
    setPermissions((prev) => {
      const nextRole: RolePermissions = {};
      for (const mod of modules) {
        nextRole[mod] = emptyModulePerms(value);
      }
      return { ...prev, [activeRole]: nextRole };
    });
  };

  const isRowFullyEnabled = (mod: string) => ACTIONS.every((a) => rolePerms[mod][a]);
  const isColumnFullyEnabled = (action: Action) => modules.every((mod) => rolePerms[mod][action]);
  const allEnabled = modules.every((mod) => isRowFullyEnabled(mod));

  // --- Add Role ---
  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newRoleName.trim();
    if (!name || roles.includes(name)) return;

    setRoles((prev) => [...prev, name]);
    setPermissions((prev) => ({ ...prev, [name]: buildRolePermissions(modules, true) }));
    setActiveRole(name);
    setNewRoleName("");
    setAddRoleOpen(false);
  };

  // --- Edit Role (rename) ---
  const openEditRole = () => {
    setEditRoleName(activeRole);
    setEditRoleOpen(true);
  };
  const handleEditRole = (e: React.FormEvent) => {
    e.preventDefault();
    const name = editRoleName.trim();
    if (!name || (name !== activeRole && roles.includes(name))) return;

    setRoles((prev) => prev.map((r) => (r === activeRole ? name : r)));
    setPermissions((prev) => {
      const next = { ...prev };
      next[name] = next[activeRole];
      if (name !== activeRole) delete next[activeRole];
      return next;
    });
    setActiveRole(name);
    setEditRoleOpen(false);
  };

  // --- Delete Role ---
  const handleDeleteRole = () => {
    if (roles.length <= 1) return; // always keep at least one role
    const nextRoles = roles.filter((r) => r !== activeRole);
    setRoles(nextRoles);
    setPermissions((prev) => {
      const next = { ...prev };
      delete next[activeRole];
      return next;
    });
    setActiveRole(nextRoles[0]);
    setDeleteRoleOpen(false);
  };

  // --- Add Privilege (new module row) ---
  const handleAddPrivilege = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newPrivilegeName.trim();
    if (!name || modules.includes(name)) return;

    setModules((prev) => [...prev, name]);
    setPermissions((prev) => {
      const next: AllPermissions = {};
      for (const role of roles) {
        next[role] = { ...prev[role], [name]: emptyModulePerms(false) };
      }
      return next;
    });
    setNewPrivilegeName("");
    setAddPrivilegeOpen(false);
  };

  return (
    <div className="bg-white rounded-b-xl border border-slate-200 border-t-0 p-6">
      <h3 className="text-sm font-semibold text-slate-800 mb-1">Access &amp; Roles</h3>
      <p className="text-xs text-slate-400 mb-4">Set exactly what each role can view, create, edit, or delete per module.</p>

      {/* Role tabs + Add Role */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {roles.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setActiveRole(role)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeRole === role ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setAddRoleOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Role
        </button>
      </div>

      {/* Actions on the active role */}
      <div className="flex items-center gap-2 mb-5 pb-5 border-b border-slate-100">
        <span className="text-xs text-slate-400 mr-1">
          Editing: <span className="font-semibold text-slate-600">{activeRole}</span>
        </span>
        <button
          type="button"
          onClick={openEditRole}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit Role
        </button>
        <button
          type="button"
          onClick={() => setAddPrivilegeOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Privilege
        </button>
        <button
          type="button"
          onClick={() => setDeleteRoleOpen(true)}
          disabled={roles.length <= 1}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-rose-600 text-white text-xs font-medium hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5 text-white" />
          Delete Role
        </button>
      </div>

      {/* Enable/disable all */}
      <div className="flex items-center gap-3 mb-4">
        <button
          type="button"
          onClick={() => setAll(true)}
          className="px-3.5 py-1.5 rounded-md border border-slate-300 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Enable all
        </button>
        <button
          type="button"
          onClick={() => setAll(false)}
          className="px-3.5 py-1.5 rounded-md border border-slate-300 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Disable all
        </button>
        <span className="text-xs text-slate-400">All enabled: {allEnabled ? "Yes" : "No"}</span>
      </div>

      {/* Module x Action matrix */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left font-semibold text-slate-700 px-4 py-3 min-w-[160px]">Privilege</th>
              {ACTIONS.map((action) => (
                <th key={action} className="px-4 py-3 text-center font-semibold text-slate-700">
                  <div className="flex flex-col items-center gap-1.5">
                    <span>{ACTION_LABELS[action]}</span>
                    <input
                      type="checkbox"
                      checked={isColumnFullyEnabled(action)}
                      onChange={(e) => toggleColumn(action, e.target.checked)}
                      className="w-4 h-4 accent-indigo-600 cursor-pointer"
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modules.map((mod) => (
              <tr key={mod} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isRowFullyEnabled(mod)}
                      onChange={(e) => toggleRow(mod, e.target.checked)}
                      className="w-4 h-4 accent-indigo-600 cursor-pointer"
                    />
                    <span className="font-medium text-slate-800">{mod}</span>
                  </label>
                </td>
                {ACTIONS.map((action) => (
                  <td key={action} className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={rolePerms[mod][action]}
                      onChange={() => toggleCell(mod, action)}
                      className="w-4 h-4 accent-indigo-600 cursor-pointer"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Role modal */}
      <Modal open={addRoleOpen} onClose={() => setAddRoleOpen(false)} title="Add Role">
        <form onSubmit={handleAddRole} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Role Name</label>
            <input
              type="text"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="e.g. Operations"
              required
              autoFocus
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="text-xs text-slate-400 mt-1">
              The new role starts with View-only access on every privilege.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAddRoleOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
              Add Role
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Role modal */}
      <Modal open={editRoleOpen} onClose={() => setEditRoleOpen(false)} title="Edit Role">
        <form onSubmit={handleEditRole} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Role Name</label>
            <input
              type="text"
              value={editRoleName}
              onChange={(e) => setEditRoleName(e.target.value)}
              required
              autoFocus
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="text-xs text-slate-400 mt-1">Renaming keeps all existing permissions for this role.</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditRoleOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Role confirmation */}
      <Modal open={deleteRoleOpen} onClose={() => setDeleteRoleOpen(false)} title="Delete Role">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete the <span className="font-semibold text-slate-800">{activeRole}</span> role?
            This removes its entire permission set and can&apos;t be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setDeleteRoleOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteRole}
              className="px-5 py-2 rounded-lg bg-rose-600 text-white text-sm font-medium hover:bg-rose-700 transition-colors"
            >
              Delete Role
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Privilege modal */}
      <Modal open={addPrivilegeOpen} onClose={() => setAddPrivilegeOpen(false)} title="Add Privilege">
        <form onSubmit={handleAddPrivilege} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Privilege / Module Name</label>
            <input
              type="text"
              value={newPrivilegeName}
              onChange={(e) => setNewPrivilegeName(e.target.value)}
              placeholder="e.g. Payroll"
              required
              autoFocus
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="text-xs text-slate-400 mt-1">
              Adds a new row to the matrix for every role, starting fully unchecked.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAddPrivilegeOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
              Add Privilege
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}