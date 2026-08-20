"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getUserRoles as getUserRolesAction,
  assignRoleToCompanyUser as assignRoleToCompanyUserAction,
  removeRoleFromCompanyUser as removeRoleFromCompanyUserAction,
  getAvailableRoles as getAvailableRolesAction,
} from "@/lib/actions/user-roles-actions";

type RoleRow = {
  id: string;
  company_id?: string;
  name?: string;
  description?: string | null;
  status?: string;
};

export function useUserRoles() {
  const [userRoles, setUserRoles] = useState<RoleRow[]>([]);
  const [availableRoles, setAvailableRoles] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserRoles = useCallback(async (companyUserId: string) => {
    try {
      setLoading(true);
      setError(null);
      const rows = await getUserRolesAction(companyUserId);
      setUserRoles((rows as any) ?? []);
      return rows as any[];
    } catch (err: any) {
      console.error("useUserRoles fetchUserRoles error:", err);
      const message = err?.message ?? "Failed to fetch user roles.";
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAvailableRoles = useCallback(async (companyId?: string) => {
    try {
      setLoading(true);
      setError(null);
      const rows = await getAvailableRolesAction(companyId);
      setAvailableRoles((rows as any) ?? []);
      return rows as any[];
    } catch (err: any) {
      console.error("useUserRoles fetchAvailableRoles error:", err);
      const message = err?.message ?? "Failed to fetch available roles.";
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const assignRole = useCallback(async (companyUserId: string, roleId: string) => {
    if (!companyUserId?.trim() || !roleId?.trim()) {
      const msg = "companyUserId and roleId are required.";
      setError(msg);
      return { success: false, error: msg };
    }

    try {
      setLoading(true);
      setError(null);
      await assignRoleToCompanyUserAction(companyUserId, roleId);

      // Refresh assigned roles for the user
      await fetchUserRoles(companyUserId);

      return { success: true };
    } catch (err: any) {
      console.error("useUserRoles assignRole error:", err);
      const message = err?.message ?? "Failed to assign role.";
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [fetchUserRoles]);

  const removeRole = useCallback(async (companyUserId: string, roleId: string) => {
    if (!companyUserId?.trim() || !roleId?.trim()) {
      const msg = "companyUserId and roleId are required.";
      setError(msg);
      return { success: false, error: msg };
    }

    try {
      setLoading(true);
      setError(null);
      await removeRoleFromCompanyUserAction(companyUserId, roleId);

      // Refresh assigned roles
      await fetchUserRoles(companyUserId);

      return { success: true };
    } catch (err: any) {
      console.error("useUserRoles removeRole error:", err);
      const message = err?.message ?? "Failed to remove role.";
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [fetchUserRoles]);

  // convenience: initial available roles fetch
  useEffect(() => {
    fetchAvailableRoles();
  }, [fetchAvailableRoles]);

  return {
    userRoles,
    availableRoles,
    loading,
    error,

    fetchUserRoles,
    fetchAvailableRoles,
    assignRole,
    removeRole,
  };
}
