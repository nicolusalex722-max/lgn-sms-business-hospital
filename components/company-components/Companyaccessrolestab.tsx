"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Modal from "@/components/dashboard/Modal";

import { useRoles } from "@/hooks/use-roles";
import { useRolePermissions } from "@/hooks/use-role-permissions";

const ACTIONS = ["view", "create", "edit", "delete"] as const;
type Action = (typeof ACTIONS)[number];

const ACTION_LABELS: Record<Action, string> = {
  view: "View",
  create: "Create",
  edit: "Edit",
  delete: "Delete",
};

type PermissionItem = {
  id: string;
  permission_key: string;
  module?: string | null;
  action?: string | null;
  description?: string | null;
};

export default function CompanyAccessRolesTab() {
  const { roles, loading: rolesLoading, error: rolesError, createRole, updateRole, deleteRole, fetchRole } = useRoles();
  const {
    permissionsByModule,
    loading: permsLoading,
    error: permsError,
    fetchRolePermissions,
    saveRolePermissions,
  } = useRolePermissions();

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [assignedPermissionIds, setAssignedPermissionIds] = useState<Set<string>>(new Set());
  const [loadingAssigned, setLoadingAssigned] = useState(false);
  const [savingPermissions, setSavingPermissions] = useState(false);

  // modals / form state
  const [addRoleOpen, setAddRoleOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState<string | null>(null);

  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [editRoleId, setEditRoleId] = useState<string | null>(null);
  const [editRoleName, setEditRoleName] = useState("");
  const [editRoleDescription, setEditRoleDescription] = useState<string | null>(null);

  const [deleteRoleOpen, setDeleteRoleOpen] = useState(false);
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);

  // select default role when roles load
  useEffect(() => {
    if (!selectedRoleId && roles.length > 0) {
      setSelectedRoleId(roles[0].id);
    }
  }, [roles, selectedRoleId]);

  // load assigned permissions when selectedRoleId changes
  useEffect(() => {
    if (!selectedRoleId) {
      setAssignedPermissionIds(new Set());
      return;
    }

    let mounted = true;
    (async () => {
      setLoadingAssigned(true);
      try {
        const rows = await fetchRolePermissions(selectedRoleId);
        if (!mounted) return;
        const ids = new Set<string>((rows ?? []).map((r: any) => r.id));
        setAssignedPermissionIds(ids);
      } catch (err) {
        console.error("load role permissions error", err);
        setAssignedPermissionIds(new Set());
      } finally {
        if (mounted) setLoadingAssigned(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [selectedRoleId, fetchRolePermissions]);

  const togglePermission = (id: string) => {
    setAssignedPermissionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSavePermissions = async () => {
    if (!selectedRoleId) return;
    setSavingPermissions(true);
    try {
      const permissionIds = Array.from(assignedPermissionIds);
      const res = await saveRolePermissions(selectedRoleId, permissionIds);
      if (!res.success) {
        console.error("save role permissions failed", res.error);
      } else {
        // success
      }
    } catch (err) {
      console.error("save permissions error", err);
    } finally {
      setSavingPermissions(false);
    }
  };

  const openEdit = (roleId: string) => {
    const r = roles.find((x) => x.id === roleId);
    if (!r) return;
    setEditRoleId(roleId);
    setEditRoleName((r as any).name ?? "");
    setEditRoleDescription((r as any).description ?? null);
    setEditRoleOpen(true);
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    const res = await createRole(newRoleName.trim(), newRoleDescription ?? null);
    if (res.success === false) {
      console.error("createRole failed", res.error);
    } else {
      setAddRoleOpen(false);
      setNewRoleName("");
      setNewRoleDescription(null);
      setSelectedRoleId(res.data?.id ?? null);
    }
  };

  const handleEditRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRoleId) return;
    const res = await updateRole(editRoleId, { name: editRoleName.trim(), description: editRoleDescription });
    if (res.success === false) {
      console.error("updateRole failed", res.error);
    } else {
      setEditRoleOpen(false);
    }
  };

  const confirmDelete = (roleId: string) => {
    setDeleteRoleId(roleId);
    setDeleteRoleOpen(true);
  };

  const handleDeleteRole = async () => {
    if (!deleteRoleId) return;
    const res = await deleteRole(deleteRoleId);
    if (res.success === false) {
      console.error("deleteRole failed", res.error);
    } else {
      setDeleteRoleOpen(false);
      if (selectedRoleId === deleteRoleId) {
        const remaining = roles.filter((r) => r.id !== deleteRoleId);
        setSelectedRoleId(remaining.length > 0 ? remaining[0].id : null);
      }
    }
  };

  const loading = rolesLoading || permsLoading || loadingAssigned;

  const moduleKeys = Object.keys(permissionsByModule || {}).sort();

  return (
    <div className="bg-white rounded-b-xl border border-slate-200 border-t-0 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 mb-1">Access &amp; Roles</h3>
          <p className="text-xs text-slate-400">Set exactly what each role can view, create, edit, or delete per module.</p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setAddRoleOpen(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 text-white text-sm">
            <Plus className="w-4 h-4" /> Add Role
          </button>
        </div>
      </div>

      {/* Role tabs */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 flex-wrap">
          {roles.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedRoleId(r.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedRoleId === r.id ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              {(r as any).name}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mb-5 pb-5 border-b border-slate-100">
        <span className="text-xs text-slate-400 mr-1">
          Editing: <span className="font-semibold text-slate-600">{roles.find((x) => x.id === selectedRoleId)?.name ?? "—"}</span>
        </span>

        <button disabled={!selectedRoleId} onClick={() => selectedRoleId && openEdit(selectedRoleId)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600 text-white text-xs">
          <Pencil className="w-3.5 h-3.5" /> Edit Role
        </button>

        <button disabled={!selectedRoleId} onClick={() => selectedRoleId && confirmDelete(selectedRoleId)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-rose-600 text-white text-xs">
          <Trash2 className="w-3.5 h-3.5" /> Delete Role
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm text-slate-500">Loading roles and permissions…</div>
      ) : roles.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-500">No roles found. Add one to get started.</div>
      ) : moduleKeys.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-500">No permissions available.</div>
      ) : (
        <>
          <div className="space-y-6">
            {moduleKeys.map((module) => (
              <div key={module} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-700">{module}</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(permissionsByModule as any)[module].map((p: PermissionItem) => {
                    const checked = assignedPermissionIds.has(p.id);
                    return (
                      <label key={p.id} className="flex items-center gap-3 p-2 border rounded hover:bg-slate-50 cursor-pointer">
                        <input type="checkbox" checked={checked} onChange={() => togglePermission(p.id)} className="w-4 h-4 accent-indigo-600" />
                        <div>
                          <div className="text-sm font-medium text-slate-800">{p.permission_key}</div>
                          {p.description && <div className="text-xs text-slate-400">{p.description}</div>}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => { if (selectedRoleId) fetchRolePermissions(selectedRoleId).then((rows) => setAssignedPermissionIds(new Set((rows ?? []).map((r: any) => r.id)))); }} className="px-4 py-2 border rounded text-sm">Reset</button>

            <button onClick={handleSavePermissions} disabled={!selectedRoleId || savingPermissions} className="px-4 py-2 bg-indigo-600 text-white rounded text-sm">
              {savingPermissions ? "Saving..." : "Save Permissions"}
            </button>
          </div>
        </>
      )}

      {/* Add Role Modal */}
      <Modal open={addRoleOpen} onClose={() => setAddRoleOpen(false)} title="Add Role">
        <form onSubmit={handleCreateRole} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500">Role Name</label>
            <input value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} required className="px-3 py-2 rounded-lg border" />
            <label className="text-xs font-medium text-slate-500 mt-2">Description (optional)</label>
            <input value={newRoleDescription ?? ""} onChange={(e) => setNewRoleDescription(e.target.value || null)} className="px-3 py-2 rounded-lg border" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setAddRoleOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Add Role</button>
          </div>
        </form>
      </Modal>

      {/* Edit Role Modal */}
      <Modal open={editRoleOpen} onClose={() => setEditRoleOpen(false)} title="Edit Role">
        <form onSubmit={handleEditRole} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-slate-500">Role Name</label>
            <input value={editRoleName} onChange={(e) => setEditRoleName(e.target.value)} required className="px-3 py-2 rounded-lg border" />
            <label className="text-xs font-medium text-slate-500 mt-2">Description (optional)</label>
            <input value={editRoleDescription ?? ""} onChange={(e) => setEditRoleDescription(e.target.value || null)} className="px-3 py-2 rounded-lg border" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setEditRoleOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Save Changes</button>
          </div>
        </form>
      </Modal>

      {/* Delete Role Confirm */}
      <Modal open={deleteRoleOpen} onClose={() => setDeleteRoleOpen(false)} title="Delete Role">
        <div className="flex flex-col gap-4">
          <p>Are you sure you want to delete this role? This removes its permissions and cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <button onClick={() => setDeleteRoleOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
            <button onClick={handleDeleteRole} className="px-4 py-2 bg-rose-600 text-white rounded">Delete Role</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
