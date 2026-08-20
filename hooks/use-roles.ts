"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getRolesForCompany as getRolesForCompanyAction,
  getRoleById as getRoleByIdAction,
  createRole as createRoleAction,
  updateRole as updateRoleAction,
  deleteRole as deleteRoleAction,
} from "@/lib/actions/roles-actions";

import type { Role } from "@/lib/types";

export function useRoles(companyId?: string) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const rows = await getRolesForCompanyAction(companyId);
      setRoles(rows as unknown as Role[]);
    } catch (err: any) {
      console.error("useRoles fetchRoles error:", err);
      setError(err?.message ?? "Failed to fetch roles.");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const fetchRole = useCallback(async (id: string) => {
    try {
      setError(null);
      const row = await getRoleByIdAction(id);
      return row as any;
    } catch (err: any) {
      console.error("useRoles fetchRole error:", err);
      setError(err?.message ?? "Failed to fetch role.");
      return null;
    }
  }, []);

  const createRole = useCallback(async (name: string, description: string | null) => {
    try {
      setError(null);
      const row = await createRoleAction(name, description, companyId);
      setRoles((current) => [row as any, ...current]);
      return { success: true, data: row };
    } catch (err: any) {
      console.error("useRoles createRole error:", err);
      const message = err?.message ?? "Failed to create role.";
      setError(message);
      return { success: false, error: message };
    }
  }, [companyId]);

  const updateRole = useCallback(async (id: string, updates: any) => {
    try {
      setError(null);
      const row = await updateRoleAction(id, updates);
      setRoles((current) => current.map((r) => (r.id === id ? (row as any) : r)));
      return { success: true, data: row };
    } catch (err: any) {
      console.error("useRoles updateRole error:", err);
      const message = err?.message ?? "Failed to update role.";
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const deleteRole = useCallback(async (id: string) => {
    try {
      setError(null);
      await deleteRoleAction(id);
      setRoles((current) => current.filter((r) => r.id !== id));
      return { success: true };
    } catch (err: any) {
      console.error("useRoles deleteRole error:", err);
      const message = err?.message ?? "Failed to delete role.";
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return {
    roles,
    loading,
    error,

    fetchRoles,
    fetchRole,

    createRole,
    updateRole,
    deleteRole,
  };
}
