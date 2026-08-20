"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getPermissions as getPermissionsAction,
  getRolePermissions as getRolePermissionsAction,
  updateRolePermissions as updateRolePermissionsAction,
} from "@/lib/actions/roles-actions";

import type { Permission } from "@/lib/types";

type PermissionsByModule = Record<string, Permission[]>;

export function useRolePermissions() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionsByModule, setPermissionsByModule] = useState<PermissionsByModule>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const rows = await getPermissionsAction();
      setPermissions(rows as any[]);

      // Group by module
      const groups: PermissionsByModule = {};
      for (const p of rows as any[]) {
        const module = p.module || "General";
        if (!groups[module]) groups[module] = [];
        groups[module].push(p as any);
      }

      setPermissionsByModule(groups);
    } catch (err: any) {
      console.error("useRolePermissions fetchPermissions error:", err);
      setError(err?.message ?? "Failed to fetch permissions.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRolePermissions = useCallback(async (roleId: string) => {
    try {
      setError(null);
      const rows = await getRolePermissionsAction(roleId);
      return rows as any[];
    } catch (err: any) {
      console.error("useRolePermissions fetchRolePermissions error:", err);
      setError(err?.message ?? "Failed to fetch role permissions.");
      return [];
    }
  }, []);

  const saveRolePermissions = useCallback(async (roleId: string, permissionIds: string[]) => {
    try {
      setError(null);
      const res = await updateRolePermissionsAction(roleId, permissionIds);
      return { success: true, data: res };
    } catch (err: any) {
      console.error("useRolePermissions saveRolePermissions error:", err);
      const message = err?.message ?? "Failed to save role permissions.";
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    permissions,
    permissionsByModule,
    loading,
    error,

    fetchPermissions,
    fetchRolePermissions,
    saveRolePermissions,
  };
}
