"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";

import Modal from "@/components/dashboard/Modal";

import { useRoles } from "@/hooks/use-roles";
import { useRolePermissions } from "@/hooks/use-role-permissions";

import type { Permission } from "@/lib/types";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type Role = {
  id: string;
  name: string;
  description?: string | null;
};

type PermissionWithAction = Permission & {
  action?: string | null;
  module?: string | null;
  description?: string | null;
  permission_key: string;
  id: string;
};

type PermissionModule = {
  name: string;
  permissions: PermissionWithAction[];
};

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const ACTION_ORDER = [
  "view",
  "create",
  "edit",
  "delete",
] as const;

type StandardAction = (typeof ACTION_ORDER)[number];

const ACTION_LABELS: Record<StandardAction, string> = {
  view: "View",
  create: "Create",
  edit: "Edit",
  delete: "Delete",
};

const ACTION_PRIORITY: Record<string, number> = {
  view: 0,
  create: 1,
  edit: 2,
  delete: 3,
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatModuleName(module: string): string {
  return module
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatActionName(action: string): string {
  return action
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function CompanyAccessRolesTab() {
  /* ------------------------------------------------------------------------ */
  /* Roles                                                                     */
  /* ------------------------------------------------------------------------ */

  const {
    roles,
    loading: rolesLoading,
    error: rolesError,
    createRole,
    updateRole,
    deleteRole,
  } = useRoles();

  /* ------------------------------------------------------------------------ */
  /* Permissions                                                               */
  /* ------------------------------------------------------------------------ */

  const {
    permissions,
    loading: permissionsLoading,
    error: permissionsError,
    fetchRolePermissions,
    saveRolePermissions,
  } = useRolePermissions();

  /* ------------------------------------------------------------------------ */
  /* Selected role                                                             */
  /* ------------------------------------------------------------------------ */

  const [selectedRoleId, setSelectedRoleId] =
    useState<string | null>(null);

  const [assignedPermissionIds, setAssignedPermissionIds] =
    useState<Set<string>>(new Set());

  const [savedPermissionIds, setSavedPermissionIds] =
    useState<Set<string>>(new Set());

  const [loadingAssigned, setLoadingAssigned] =
    useState(false);

  const [savingPermissions, setSavingPermissions] =
    useState(false);

  const [permissionSuccess, setPermissionSuccess] =
    useState<string | null>(null);

  const [permissionError, setPermissionError] =
    useState<string | null>(null);

  /* ------------------------------------------------------------------------ */
  /* Expanded modules                                                          */
  /* ------------------------------------------------------------------------ */

  const [expandedModules, setExpandedModules] =
    useState<Set<string>>(new Set());

  /* ------------------------------------------------------------------------ */
  /* Add role                                                                  */
  /* ------------------------------------------------------------------------ */

  const [addRoleOpen, setAddRoleOpen] =
    useState(false);

  const [newRoleName, setNewRoleName] =
    useState("");

  const [newRoleDescription, setNewRoleDescription] =
    useState("");

  const [creatingRole, setCreatingRole] =
    useState(false);

  /* ------------------------------------------------------------------------ */
  /* Edit role                                                                 */
  /* ------------------------------------------------------------------------ */

  const [editRoleOpen, setEditRoleOpen] =
    useState(false);

  const [editRoleId, setEditRoleId] =
    useState<string | null>(null);

  const [editRoleName, setEditRoleName] =
    useState("");

  const [editRoleDescription, setEditRoleDescription] =
    useState("");

  const [updatingRole, setUpdatingRole] =
    useState(false);

  /* ------------------------------------------------------------------------ */
  /* Delete role                                                               */
  /* ------------------------------------------------------------------------ */

  const [deleteRoleOpen, setDeleteRoleOpen] =
    useState(false);

  const [deleteRoleId, setDeleteRoleId] =
    useState<string | null>(null);

  const [deletingRole, setDeletingRole] =
    useState(false);

  /* ------------------------------------------------------------------------ */
  /* Selected role                                                             */
  /* ------------------------------------------------------------------------ */

  const selectedRole = useMemo<Role | null>(() => {
    if (!selectedRoleId) {
      return null;
    }

    const role = roles.find(
      (item) => item.id === selectedRoleId,
    );

    if (!role) {
      return null;
    }

    return role as Role;
  }, [roles, selectedRoleId]);

  /* ------------------------------------------------------------------------ */
  /* Permission modules                                                        */
  /* ------------------------------------------------------------------------ */

  const permissionModules = useMemo<PermissionModule[]>(() => {
    const groups = new Map<
      string,
      PermissionWithAction[]
    >();

    for (const permission of permissions) {
      const item = permission as PermissionWithAction;

      const moduleName =
        item.module?.trim() || "General";

      const existing =
        groups.get(moduleName) ?? [];

      existing.push(item);

      groups.set(moduleName, existing);
    }

    return Array.from(groups.entries())
      .map(([name, modulePermissions]) => ({
        name,
        permissions: [...modulePermissions].sort(
          (a, b) => {
            const actionA =
              (a.action ?? "").toLowerCase();

            const actionB =
              (b.action ?? "").toLowerCase();

            const priorityA =
              ACTION_PRIORITY[actionA] ?? 99;

            const priorityB =
              ACTION_PRIORITY[actionB] ?? 99;

            if (priorityA !== priorityB) {
              return priorityA - priorityB;
            }

            return a.permission_key.localeCompare(
              b.permission_key,
            );
          },
        ),
      }))
      .sort((a, b) =>
        a.name.localeCompare(b.name),
      );
  }, [permissions]);

  /* ------------------------------------------------------------------------ */
  /* Default module expansion                                                  */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (permissionModules.length === 0) {
      return;
    }

    setExpandedModules((current) => {
      if (current.size > 0) {
        return current;
      }

      return new Set(
        permissionModules.map(
          (module) => module.name,
        ),
      );
    });
  }, [permissionModules]);

  /* ------------------------------------------------------------------------ */
  /* Select first role                                                         */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (roles.length === 0) {
      setSelectedRoleId(null);
      return;
    }

    if (
      !selectedRoleId ||
      !roles.some(
        (role) => role.id === selectedRoleId,
      )
    ) {
      setSelectedRoleId(roles[0].id);
    }
  }, [roles, selectedRoleId]);

  /* ------------------------------------------------------------------------ */
  /* Load assigned permissions                                                 */
  /* ------------------------------------------------------------------------ */

  const loadAssignedPermissions =
    useCallback(
      async (roleId: string) => {
        setLoadingAssigned(true);
        setPermissionError(null);
        setPermissionSuccess(null);

        try {
          const rows =
            await fetchRolePermissions(roleId);

          const ids = new Set<string>(
            rows.map(
              (permission) => permission.id,
            ),
          );

          setAssignedPermissionIds(
            new Set(ids),
          );

          setSavedPermissionIds(
            new Set(ids),
          );
        } catch (error: unknown) {
          console.error(
            "CompanyAccessRolesTab load permissions error:",
            error,
          );

          setAssignedPermissionIds(
            new Set(),
          );

          setSavedPermissionIds(
            new Set(),
          );

          setPermissionError(
            error instanceof Error
              ? error.message
              : "Failed to load role permissions.",
          );
        } finally {
          setLoadingAssigned(false);
        }
      },
      [fetchRolePermissions],
    );

  /* ------------------------------------------------------------------------ */
  /* Reload permissions when role changes                                     */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!selectedRoleId) {
      setAssignedPermissionIds(
        new Set(),
      );

      setSavedPermissionIds(
        new Set(),
      );

      return;
    }

    let mounted = true;

    const load = async () => {
      if (!mounted) {
        return;
      }

      await loadAssignedPermissions(
        selectedRoleId,
      );
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [
    selectedRoleId,
    loadAssignedPermissions,
  ]);

  /* ------------------------------------------------------------------------ */
  /* Permission state                                                          */
  /* ------------------------------------------------------------------------ */

  const hasUnsavedChanges = useMemo(() => {
    if (
      assignedPermissionIds.size !==
      savedPermissionIds.size
    ) {
      return true;
    }

    for (const id of assignedPermissionIds) {
      if (!savedPermissionIds.has(id)) {
        return true;
      }
    }

    return false;
  }, [
    assignedPermissionIds,
    savedPermissionIds,
  ]);

  /* ------------------------------------------------------------------------ */
  /* Permission helpers                                                        */
  /* ------------------------------------------------------------------------ */

  const togglePermission = useCallback(
    (permissionId: string) => {
      setPermissionSuccess(null);
      setPermissionError(null);

      setAssignedPermissionIds((current) => {
        const next = new Set(current);

        if (next.has(permissionId)) {
          next.delete(permissionId);
        } else {
          next.add(permissionId);
        }

        return next;
      });
    },
    [],
  );

  const isPermissionAssigned = useCallback(
    (permissionId: string) => {
      return assignedPermissionIds.has(
        permissionId,
      );
    },
    [assignedPermissionIds],
  );

  /* ------------------------------------------------------------------------ */
  /* Module helpers                                                            */
  /* ------------------------------------------------------------------------ */

  const getModulePermissionIds = useCallback(
    (module: PermissionModule): string[] => {
      return module.permissions.map(
        (permission) => permission.id,
      );
    },
    [],
  );

  const isModuleFullySelected =
    useCallback(
      (module: PermissionModule) => {
        if (module.permissions.length === 0) {
          return false;
        }

        return module.permissions.every(
          (permission) =>
            assignedPermissionIds.has(
              permission.id,
            ),
        );
      },
      [assignedPermissionIds],
    );

  const isModulePartiallySelected =
    useCallback(
      (module: PermissionModule) => {
        const selectedCount =
          module.permissions.filter(
            (permission) =>
              assignedPermissionIds.has(
                permission.id,
              ),
          ).length;

        return (
          selectedCount > 0 &&
          selectedCount <
            module.permissions.length
        );
      },
      [assignedPermissionIds],
    );

  const toggleModule = useCallback(
    (module: PermissionModule) => {
      setPermissionSuccess(null);
      setPermissionError(null);

      const ids =
        getModulePermissionIds(module);

      setAssignedPermissionIds((current) => {
        const next = new Set(current);

        const allSelected = ids.every(
          (id) => next.has(id),
        );

        if (allSelected) {
          for (const id of ids) {
            next.delete(id);
          }
        } else {
          for (const id of ids) {
            next.add(id);
          }
        }

        return next;
      });
    },
    [getModulePermissionIds],
  );

  const toggleModuleExpanded =
    useCallback((moduleName: string) => {
      setExpandedModules((current) => {
        const next = new Set(current);

        if (next.has(moduleName)) {
          next.delete(moduleName);
        } else {
          next.add(moduleName);
        }

        return next;
      });
    }, []);

  /* ------------------------------------------------------------------------ */
  /* Save permissions                                                          */
  /* ------------------------------------------------------------------------ */

  const handleSavePermissions =
    useCallback(async () => {
      if (!selectedRoleId) {
        setPermissionError(
          "Please select a role first.",
        );
        return;
      }

      setSavingPermissions(true);
      setPermissionError(null);
      setPermissionSuccess(null);

      try {
        const permissionIds =
          Array.from(
            assignedPermissionIds,
          );

        const result =
          await saveRolePermissions(
            selectedRoleId,
            permissionIds,
          );

        if (!result.success) {
          setPermissionError(
            result.error ??
              "Failed to save permissions.",
          );

          return;
        }

        setSavedPermissionIds(
          new Set(permissionIds),
        );

        setPermissionSuccess(
          "Permissions saved successfully.",
        );
      } catch (error: unknown) {
        console.error(
          "CompanyAccessRolesTab save permissions error:",
          error,
        );

        setPermissionError(
          error instanceof Error
            ? error.message
            : "Failed to save permissions.",
        );
      } finally {
        setSavingPermissions(false);
      }
    }, [
      selectedRoleId,
      assignedPermissionIds,
      saveRolePermissions,
    ]);

  /* ------------------------------------------------------------------------ */
  /* Reset permissions                                                         */
  /* ------------------------------------------------------------------------ */

  const handleResetPermissions =
    useCallback(async () => {
      if (!selectedRoleId) {
        return;
      }

      setPermissionError(null);
      setPermissionSuccess(null);

      await loadAssignedPermissions(
        selectedRoleId,
      );
    }, [
      selectedRoleId,
      loadAssignedPermissions,
    ]);

  /* ------------------------------------------------------------------------ */
  /* Add role                                                                  */
  /* ------------------------------------------------------------------------ */

  const resetAddRoleForm = () => {
    setNewRoleName("");
    setNewRoleDescription("");
  };

  const handleCreateRole = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const name =
      newRoleName.trim();

    if (!name) {
      return;
    }

    setCreatingRole(true);

    try {
      const result =
        await createRole(
          name,
          newRoleDescription.trim() ||
            null,
        );

      if (!result.success) {
        return;
      }

      setAddRoleOpen(false);
      resetAddRoleForm();

      if (result.data?.id) {
        setSelectedRoleId(
          result.data.id,
        );
      }
    } finally {
      setCreatingRole(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Edit role                                                                 */
  /* ------------------------------------------------------------------------ */

  const openEditRole = (roleId: string) => {
    const role = roles.find(
      (item) => item.id === roleId,
    );

    if (!role) {
      return;
    }

    setEditRoleId(role.id);
    setEditRoleName(
      String(role.name ?? ""),
    );
    setEditRoleDescription(
      String(
        role.description ?? "",
      ),
    );

    setEditRoleOpen(true);
  };

  const handleUpdateRole = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!editRoleId) {
      return;
    }

    const name =
      editRoleName.trim();

    if (!name) {
      return;
    }

    setUpdatingRole(true);

    try {
      const result =
        await updateRole(
          editRoleId,
          {
            name,
            description:
              editRoleDescription.trim() ||
              null,
          },
        );

      if (!result.success) {
        return;
      }

      setEditRoleOpen(false);
      setEditRoleId(null);
    } finally {
      setUpdatingRole(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Delete role                                                               */
  /* ------------------------------------------------------------------------ */

  const openDeleteRole = (
    roleId: string,
  ) => {
    setDeleteRoleId(roleId);
    setDeleteRoleOpen(true);
  };

  const handleDeleteRole = async () => {
    if (!deleteRoleId) {
      return;
    }

    setDeletingRole(true);

    try {
      const deletedRoleId =
        deleteRoleId;

      const result =
        await deleteRole(
          deletedRoleId,
        );

      if (!result.success) {
        return;
      }

      setDeleteRoleOpen(false);
      setDeleteRoleId(null);

      if (
        selectedRoleId ===
        deletedRoleId
      ) {
        const remainingRoles =
          roles.filter(
            (role) =>
              role.id !==
              deletedRoleId,
          );

        setSelectedRoleId(
          remainingRoles.length > 0
            ? remainingRoles[0].id
            : null,
        );
      }
    } finally {
      setDeletingRole(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Loading state                                                             */
  /* ------------------------------------------------------------------------ */

  const loading =
    rolesLoading ||
    permissionsLoading ||
    loadingAssigned;

  /* ------------------------------------------------------------------------ */
  /* Error state                                                               */
  /* ------------------------------------------------------------------------ */

  const globalError =
    rolesError ??
    permissionsError ??
    permissionError;

  /* ------------------------------------------------------------------------ */
  /* Render                                                                    */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="bg-white rounded-b-xl border border-slate-200 border-t-0">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                              */}
      {/* ------------------------------------------------------------------ */}

      <div className="p-6 border-b border-slate-100">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
                <ShieldCheck className="h-5 w-5 text-indigo-600" />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-800">
                  Access &amp; Roles
                </h3>

                <p className="text-xs text-slate-400">
                  Configure exactly what each role
                  can access and perform.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setAddRoleOpen(true)
            }
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add Role
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Global error                                                        */}
      {/* ------------------------------------------------------------------ */}

      {globalError && (
        <div className="mx-6 mt-5 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <X className="mt-0.5 h-4 w-4 shrink-0" />

          <div>
            <p className="font-medium">
              Something went wrong
            </p>

            <p className="mt-0.5 text-xs">
              {globalError}
            </p>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Success                                                             */}
      {/* ------------------------------------------------------------------ */}

      {permissionSuccess && (
        <div className="mx-6 mt-5 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <Check className="h-4 w-4 shrink-0" />

          <span>
            {permissionSuccess}
          </span>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Role selector                                                       */}
      {/* ------------------------------------------------------------------ */}

      <div className="p-6">
        <div className="mb-5">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            Roles
          </p>

          {rolesLoading ? (
            <div className="flex items-center gap-2 py-3 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading roles...
            </div>
          ) : roles.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <p className="text-sm font-medium text-slate-600">
                No roles found
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Create a role to configure permissions.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-100 p-1.5">
              {roles.map((role) => {
                const selected =
                  selectedRoleId ===
                  role.id;

                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() =>
                      setSelectedRoleId(
                        role.id,
                      )
                    }
                    className={[
                      "rounded-lg px-4 py-2 text-sm font-medium transition",
                      selected
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700",
                    ].join(" ")}
                  >
                    {role.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* -------------------------------------------------------------- */}
        {/* Role actions                                                     */}
        {/* -------------------------------------------------------------- */}

        {selectedRole && (
          <div className="mb-6 flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-slate-400">
                Editing role
              </p>

              <p className="text-sm font-semibold text-slate-700">
                {selectedRole.name}
              </p>

              {selectedRole.description && (
                <p className="mt-0.5 text-xs text-slate-400">
                  {selectedRole.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  openEditRole(
                    selectedRole.id,
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit Role
              </button>

              <button
                type="button"
                onClick={() =>
                  openDeleteRole(
                    selectedRole.id,
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-rose-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Role
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Permission area                                                   */}
        {/* ---------------------------------------------------------------- */}

        {loading ? (
          <div className="flex min-h-48 items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-sm text-slate-500">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              <span>
                Loading roles and permissions...
              </span>
            </div>
          </div>
        ) : roles.length === 0 ? null : permissions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <ShieldCheck className="mx-auto h-8 w-8 text-slate-300" />

            <p className="mt-3 text-sm font-medium text-slate-600">
              No permissions available.
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Seed the permissions table before
              assigning permissions to roles.
            </p>
          </div>
        ) : selectedRoleId ? (
          <>
            {/* ------------------------------------------------------------ */}
            {/* Permission summary                                            */}
            {/* ------------------------------------------------------------ */}

            <div className="mb-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Permission configuration
                </p>

                <p className="mt-1 text-sm text-slate-700">
                  <span className="font-semibold text-indigo-600">
                    {
                      assignedPermissionIds.size
                    }
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold">
                    {permissions.length}
                  </span>{" "}
                  permissions selected
                </p>
              </div>

              <div className="flex items-center gap-2">
                {hasUnsavedChanges && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                    Unsaved changes
                  </span>
                )}

                {!hasUnsavedChanges && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    <Check className="h-3 w-3" />
                    Saved
                  </span>
                )}
              </div>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* Permission modules                                            */}
            {/* ------------------------------------------------------------ */}

            <div className="space-y-3">
              {permissionModules.map(
                (module) => {
                  const expanded =
                    expandedModules.has(
                      module.name,
                    );

                  const fullySelected =
                    isModuleFullySelected(
                      module,
                    );

                  const partiallySelected =
                    isModulePartiallySelected(
                      module,
                    );

                  const selectedCount =
                    module.permissions.filter(
                      (permission) =>
                        assignedPermissionIds.has(
                          permission.id,
                        ),
                    ).length;

                  return (
                    <div
                      key={module.name}
                      className="overflow-hidden rounded-xl border border-slate-200"
                    >
                      {/* Module header */}

                      <div className="flex items-center justify-between gap-3 bg-slate-50 px-4 py-3">
                        <button
                          type="button"
                          onClick={() =>
                            toggleModuleExpanded(
                              module.name,
                            )
                          }
                          className="flex min-w-0 flex-1 items-center gap-2 text-left"
                        >
                          {expanded ? (
                            <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                          )}

                          <span className="truncate text-sm font-semibold text-slate-700">
                            {formatModuleName(
                              module.name,
                            )}
                          </span>

                          <span className="rounded-full bg-white px-2 py-0.5 text-[11px] text-slate-400">
                            {selectedCount}/
                            {
                              module
                                .permissions
                                .length
                            }
                          </span>
                        </button>

                        <label className="flex shrink-0 cursor-pointer items-center gap-2">
                          <span className="hidden text-xs text-slate-400 sm:inline">
                            Select all
                          </span>

                          <input
                            type="checkbox"
                            checked={
                              fullySelected
                            }
                            ref={(element) => {
                              if (
                                element
                              ) {
                                element.indeterminate =
                                  partiallySelected;
                              }
                            }}
                            onChange={() =>
                              toggleModule(
                                module,
                              )
                            }
                            className="h-4 w-4 cursor-pointer rounded accent-indigo-600"
                          />
                        </label>
                      </div>

                      {/* Module permissions */}

                      {expanded && (
                        <div className="border-t border-slate-200">
                          <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2 lg:grid-cols-4">
                            {module.permissions.map(
                              (
                                permission,
                              ) => {
                                const checked =
                                  isPermissionAssigned(
                                    permission.id,
                                  );

                                const action =
                                  (
                                    permission.action ??
                                    ""
                                  ).toLowerCase();

                                const isStandardAction =
                                  ACTION_ORDER.includes(
                                    action as StandardAction,
                                  );

                                return (
                                  <label
                                    key={
                                      permission.id
                                    }
                                    className={[
                                      "group flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition",
                                      checked
                                        ? "border-indigo-200 bg-indigo-50"
                                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                                    ].join(
                                      " ",
                                    )}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={
                                        checked
                                      }
                                      onChange={() =>
                                        togglePermission(
                                          permission.id,
                                        )
                                      }
                                      className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded accent-indigo-600"
                                    />

                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span
                                          className={[
                                            "text-sm font-medium",
                                            checked
                                              ? "text-indigo-700"
                                              : "text-slate-700",
                                          ].join(
                                            " ",
                                          )}
                                        >
                                          {isStandardAction
                                            ? ACTION_LABELS[
                                                action as StandardAction
                                              ]
                                            : formatActionName(
                                                action ||
                                                  "Permission",
                                              )}
                                        </span>
                                      </div>

                                      <p className="mt-0.5 break-all text-[11px] text-slate-400">
                                        {
                                          permission.permission_key
                                        }
                                      </p>

                                      {permission.description && (
                                        <p className="mt-1 text-xs leading-4 text-slate-400">
                                          {
                                            permission.description
                                          }
                                        </p>
                                      )}
                                    </div>
                                  </label>
                                );
                              },
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                },
              )}
            </div>

            {/* ------------------------------------------------------------ */}
            {/* Save / Reset                                                  */}
            {/* ------------------------------------------------------------ */}

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-slate-400">
                Changes are not applied until you
                click{" "}
                <span className="font-medium text-slate-600">
                  Save Permissions
                </span>
                .
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={
                    handleResetPermissions
                  }
                  disabled={
                    !selectedRoleId ||
                    loadingAssigned ||
                    savingPermissions
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw
                    className={[
                      "h-4 w-4",
                      loadingAssigned
                        ? "animate-spin"
                        : "",
                    ].join(" ")}
                  />
                  Reset
                </button>

                <button
                  type="button"
                  onClick={
                    handleSavePermissions
                  }
                  disabled={
                    !selectedRoleId ||
                    savingPermissions ||
                    loadingAssigned ||
                    !hasUnsavedChanges
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingPermissions ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Permissions
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <ShieldCheck className="mx-auto h-8 w-8 text-slate-300" />

            <p className="mt-3 text-sm font-medium text-slate-600">
              Select a role
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Choose a role above to configure
              its permissions.
            </p>
          </div>
        )}
      </div>

      {/* ================================================================== */}
      {/* ADD ROLE MODAL                                                      */}
      {/* ================================================================== */}

      <Modal
        open={addRoleOpen}
        onClose={() => {
          if (!creatingRole) {
            setAddRoleOpen(false);
            resetAddRoleForm();
          }
        }}
        title="Add Role"
      >
        <form
          onSubmit={handleCreateRole}
          className="flex flex-col gap-5"
        >
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              Role Name
            </label>

            <input
              value={newRoleName}
              onChange={(event) =>
                setNewRoleName(
                  event.target.value,
                )
              }
              placeholder="e.g. Accountant"
              required
              disabled={creatingRole}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              Description
            </label>

            <textarea
              value={newRoleDescription}
              onChange={(event) =>
                setNewRoleDescription(
                  event.target.value,
                )
              }
              placeholder="Describe what this role is responsible for..."
              rows={3}
              disabled={creatingRole}
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => {
                setAddRoleOpen(false);
                resetAddRoleForm();
              }}
              disabled={creatingRole}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                creatingRole ||
                !newRoleName.trim()
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {creatingRole && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              {creatingRole
                ? "Creating..."
                : "Add Role"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ================================================================== */}
      {/* EDIT ROLE MODAL                                                     */}
      {/* ================================================================== */}

      <Modal
        open={editRoleOpen}
        onClose={() => {
          if (!updatingRole) {
            setEditRoleOpen(false);
          }
        }}
        title="Edit Role"
      >
        <form
          onSubmit={handleUpdateRole}
          className="flex flex-col gap-5"
        >
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              Role Name
            </label>

            <input
              value={editRoleName}
              onChange={(event) =>
                setEditRoleName(
                  event.target.value,
                )
              }
              required
              disabled={updatingRole}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              Description
            </label>

            <textarea
              value={editRoleDescription}
              onChange={(event) =>
                setEditRoleDescription(
                  event.target.value,
                )
              }
              rows={3}
              disabled={updatingRole}
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() =>
                setEditRoleOpen(false)
              }
              disabled={updatingRole}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                updatingRole ||
                !editRoleName.trim()
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {updatingRole && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              {updatingRole
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ================================================================== */}
      {/* DELETE ROLE MODAL                                                   */}
      {/* ================================================================== */}

      <Modal
        open={deleteRoleOpen}
        onClose={() => {
          if (!deletingRole) {
            setDeleteRoleOpen(false);
          }
        }}
        title="Delete Role"
      >
        <div className="flex flex-col gap-5">
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
            <div className="flex gap-3">
              <Trash2 className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />

              <div>
                <p className="text-sm font-semibold text-rose-800">
                  Delete this role?
                </p>

                <p className="mt-1 text-xs leading-5 text-rose-700">
                  This will permanently remove the
                  role and its assigned permissions.
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() =>
                setDeleteRoleOpen(false)
              }
              disabled={deletingRole}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDeleteRole}
              disabled={deletingRole}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700 disabled:opacity-50"
            >
              {deletingRole && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              {deletingRole
                ? "Deleting..."
                : "Delete Role"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}