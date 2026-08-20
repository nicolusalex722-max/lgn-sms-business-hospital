"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getPermissions,
  getRolePermissions,
  updateRolePermissions,
} from "@/lib/actions/roles-actions";

import type { Permission } from "@/lib/types";

type PermissionsByModule = Record<string, Permission[]>;

export function useRolePermissions() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionsByModule, setPermissionsByModule] =
    useState<PermissionsByModule>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const rows = await getPermissions();

      setPermissions(rows);

      const groups: PermissionsByModule = {};

      for (const permission of rows) {
        const module = permission.module || "General";

        if (!groups[module]) {
          groups[module] = [];
        }

        groups[module].push(permission);
      }

      setPermissionsByModule(groups);
    } catch (err: unknown) {
      console.error(
        "useRolePermissions fetchPermissions error:",
        err,
      );

      const message =
        err instanceof Error
          ? err.message
          : "Failed to fetch permissions.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRolePermissions = useCallback(
    async (roleId: string) => {
      try {
        setError(null);

        return await getRolePermissions(roleId);
      } catch (err: unknown) {
        console.error(
          "useRolePermissions fetchRolePermissions error:",
          err,
        );

        const message =
          err instanceof Error
            ? err.message
            : "Failed to fetch role permissions.";

        setError(message);

        return [];
      }
    },
    [],
  );

  const saveRolePermissions = useCallback(
    async (
      roleId: string,
      permissionIds: string[],
    ) => {
      try {
        setError(null);

        const data = await updateRolePermissions(
          roleId,
          permissionIds,
        );

        return {
          success: true,
          data,
        };
      } catch (err: unknown) {
        console.error(
          "useRolePermissions saveRolePermissions error:",
          err,
        );

        const message =
          err instanceof Error
            ? err.message
            : "Failed to save role permissions.";

        setError(message);

        return {
          success: false,
          error: message,
        };
      }
    },
    [],
  );

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