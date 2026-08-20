"use server";

import { createSupabaseServerClient } from "@/lib/db/server";
import { AuthorizationError, requireUserTenantContext } from "@/lib/auth";
import type { PermissionKey } from "@/lib/auth/permissions";

/**
 * Roles actions: manage company-scoped roles and their permissions.
 */

type RoleRow = {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
};

type PermissionRow = {
  id: string;
  permission_key: string;
  module: string;
  action: string;
  description: string | null;
};

/* -------------------------------------------------------------------------- */
/* Errors                                                                      */
/* -------------------------------------------------------------------------- */

export class RoleError extends Error {
  constructor(message = "Role error") {
    super(message);
    this.name = "RoleError";
  }
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

async function requireCompanyContextOrSuperAdmin() {
  const context = await requireUserTenantContext();

  if (!context) throw new AuthorizationError();

  // allow SuperAdmin (companyId may be null) or users with companyId
  return context;
}

/* -------------------------------------------------------------------------- */
/* Get Roles                                                                   */
/* -------------------------------------------------------------------------- */

export async function getRolesForCompany(companyId?: string) {
  const context = await requireCompanyContextOrSuperAdmin();

  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("roles")
    .select(`id, company_id, name, description, status, created_at, updated_at`)
    .order("created_at", { ascending: false });

  if (context.role !== "SuperAdmin") {
    // ensure tenant isolation
    const cid = context.companyId!;
    query = query.eq("company_id", cid);
  } else if (companyId) {
    query = query.eq("company_id", companyId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getRolesForCompany error:", error);
    throw new RoleError("Failed to fetch roles.");
  }

  return (data ?? []) as RoleRow[];
}

export async function getRoleById(id: string) {
  if (!id?.trim()) throw new RoleError("Role id is required.");

  const context = await requireCompanyContextOrSuperAdmin();
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("roles")
    .select(`id, company_id, name, description, status, created_at, updated_at`)
    .eq("id", id)
    .limit(1);

  if (context.role !== "SuperAdmin") {
    query = query.eq("company_id", context.companyId!);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error("getRoleById error:", error);
    throw new RoleError("Failed to fetch role.");
  }

  return data as RoleRow | null;
}

/* -------------------------------------------------------------------------- */
/* Create Role                                                                 */
/* -------------------------------------------------------------------------- */

export async function createRole(
  name: string,
  description: string | null,
  companyId?: string,
) {
  if (!name?.trim()) throw new RoleError("Role name is required.");

  const context = await requireCompanyContextOrSuperAdmin();

  // For non-superadmin, companyId must be their company
  let targetCompanyId: string | null = null;

  if (context.role === "SuperAdmin") {
    if (!companyId) throw new RoleError("companyId is required when called by SuperAdmin.");
    targetCompanyId = companyId;
  } else {
    targetCompanyId = context.companyId!;
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("roles")
    .insert({ name: name.trim(), description, company_id: targetCompanyId, status: "active" })
    .select()
    .single();

  if (error) {
    console.error("createRole error:", error);
    throw new RoleError("Failed to create role.");
  }

  return data as RoleRow;
}

/* -------------------------------------------------------------------------- */
/* Update Role                                                                 */
/* -------------------------------------------------------------------------- */

export async function updateRole(id: string, updates: { name?: string; description?: string | null; status?: "active" | "inactive" }) {
  if (!id?.trim()) throw new RoleError("Role id is required.");

  const context = await requireCompanyContextOrSuperAdmin();
  const supabase = await createSupabaseServerClient();

  // Verify role ownership
  const role = await getRoleById(id);
  if (!role) throw new RoleError("Role not found.");

  if (context.role !== "SuperAdmin" && role.company_id !== context.companyId) {
    throw new AuthorizationError("You do not have permission to modify this role.");
  }

  const { data, error } = await supabase
    .from("roles")
    .update({ name: updates.name?.trim() ?? role.name, description: updates.description ?? role.description, status: updates.status ?? role.status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("updateRole error:", error);
    throw new RoleError("Failed to update role.");
  }

  return data as RoleRow;
}

/* -------------------------------------------------------------------------- */
/* Delete Role                                                                 */
/* -------------------------------------------------------------------------- */

export async function deleteRole(id: string) {
  if (!id?.trim()) throw new RoleError("Role id is required.");

  const context = await requireCompanyContextOrSuperAdmin();

  const role = await getRoleById(id);
  if (!role) throw new RoleError("Role not found.");

  if (context.role !== "SuperAdmin" && role.company_id !== context.companyId) {
    throw new AuthorizationError("You do not have permission to delete this role.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("roles").delete().eq("id", id);

  if (error) {
    console.error("deleteRole error:", error);
    throw new RoleError("Failed to delete role.");
  }

  return true;
}

/* -------------------------------------------------------------------------- */
/* Role permissions management                                                 */
/* -------------------------------------------------------------------------- */

export async function getPermissions() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("permissions").select("id, permission_key, module, action, description").order("permission_key");

  if (error) {
    console.error("getPermissions error:", error);
    throw new RoleError("Failed to fetch permissions.");
  }

  return (data ?? []) as PermissionRow[];
}

export async function getRolePermissions(roleId: string) {
  if (!roleId?.trim()) throw new RoleError("Role id is required.");

  const role = await getRoleById(roleId);
  if (!role) throw new RoleError("Role not found.");

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("role_permissions")
    .select("permission_id ( id, permission_key, module, action, description )")
    .eq("role_id", roleId);

  if (error) {
    console.error("getRolePermissions error:", error);
    throw new RoleError("Failed to fetch role permissions.");
  }

  const perms = (data ?? []).map((r: any) => r.permission_id) as PermissionRow[];
  return perms;
}

export async function updateRolePermissions(roleId: string, permissionIds: string[]) {
  if (!roleId?.trim()) throw new RoleError("Role id is required.");

  const context = await requireCompanyContextOrSuperAdmin();
  const role = await getRoleById(roleId);
  if (!role) throw new RoleError("Role not found.");

  if (context.role !== "SuperAdmin" && role.company_id !== context.companyId) {
    throw new AuthorizationError("You do not have permission to modify this role.");
  }

  const supabase = await createSupabaseServerClient();

  // Replace role permissions atomically: delete existing and insert new set.
  const { error: deleteError } = await supabase.from("role_permissions").delete().eq("role_id", roleId);
  if (deleteError) {
    console.error("updateRolePermissions delete error:", deleteError);
    throw new RoleError("Failed to update role permissions.");
  }

  if (!permissionIds || permissionIds.length === 0) return [];

  const inserts = permissionIds.map((pid) => ({ role_id: roleId, permission_id: pid }));

  const { data, error: insertError } = await supabase.from("role_permissions").insert(inserts).select();

  if (insertError) {
    console.error("updateRolePermissions insert error:", insertError);
    throw new RoleError("Failed to update role permissions.");
  }

  return data;
}
