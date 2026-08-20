"use server";

import { createSupabaseServerClient } from "@/lib/db/server";
import { requireUserTenantContext, AuthorizationError } from "@/lib/auth";

/**
 * Actions for assigning/removing roles to/from company users.
 */

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type CompanyUserRow = {
  id: string;
  auth_user_id: string;
  company_id: string;
  status: "active" | "inactive" | "suspended";
};

type RoleRow = {
  id: string;
  company_id: string;
  status: "active" | "inactive" | "suspended" | string;
};

/* -------------------------------------------------------------------------- */
/* Errors                                                                     */
/* -------------------------------------------------------------------------- */

export class UserRoleError extends Error {
  constructor(message = "UserRole error") {
    super(message);
    this.name = "UserRoleError";
  }
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

async function requireCompanyContext() {
  const context = await requireUserTenantContext();

  if (!context) throw new AuthorizationError();
  if (context.role === "SuperAdmin") return context; // SuperAdmin allowed
  if (!context.companyId) throw new AuthorizationError("This action requires a company context.");

  return context;
}

/* -------------------------------------------------------------------------- */
/* Assign Role                                                                 */
/* -------------------------------------------------------------------------- */

export async function assignRoleToCompanyUser(companyUserId: string, roleId: string) {
  if (!companyUserId?.trim() || !roleId?.trim()) throw new UserRoleError("companyUserId and roleId are required.");

  const context = await requireCompanyContext();
  const supabase = await createSupabaseServerClient();

  // Fetch company_user and verify tenant ownership
  const { data: cu, error: cuError } = await supabase
    .from("company_users")
    .select("id, auth_user_id, company_id, status")
    .eq("id", companyUserId)
    .maybeSingle();

  if (cuError) {
    console.error("assignRoleToCompanyUser company_users lookup error:", cuError);
    throw new UserRoleError("Failed to fetch company user.");
  }

  if (!cu) throw new UserRoleError("Company user not found.");

  if (cu.status !== "active") throw new UserRoleError("Company user is not active.");

  // Verify role
  const { data: role, error: roleError } = await supabase
    .from("roles")
    .select("id, company_id, status")
    .eq("id", roleId)
    .maybeSingle();

  if (roleError) {
    console.error("assignRoleToCompanyUser roles lookup error:", roleError);
    throw new UserRoleError("Failed to fetch role.");
  }

  if (!role) throw new UserRoleError("Role not found.");

  // Tenant checks: if not SuperAdmin must match company
  if (context.role !== "SuperAdmin") {
    if (cu.company_id !== context.companyId) {
      throw new AuthorizationError("Company user does not belong to your company.");
    }
    if (role.company_id !== context.companyId) {
      throw new AuthorizationError("Role does not belong to your company.");
    }
  }

  if (role.status !== "active") {
    throw new UserRoleError("Role is not active.");
  }

  // Insert into company_user_roles (idempotent)
  const { error: insertError } = await supabase
    .from("company_user_roles")
    .insert({ company_user_id: companyUserId, role_id: roleId })
    .select();

  if (insertError) {
    // If unique constraint violation occurs, it's already assigned — treat as ok
    // Supabase returns details in error.details — but we safely report error for now
    console.error("assignRoleToCompanyUser insert error:", insertError);

    // Try to detect conflict (PGRST116 is not standard for insert conflict) — to be safe, return error
    throw new UserRoleError("Failed to assign role to user.");
  }

  return true;
}

/* -------------------------------------------------------------------------- */
/* Remove Role                                                                */
/* -------------------------------------------------------------------------- */

export async function removeRoleFromCompanyUser(companyUserId: string, roleId: string) {
  if (!companyUserId?.trim() || !roleId?.trim()) throw new UserRoleError("companyUserId and roleId are required.");

  const context = await requireCompanyContext();
  const supabase = await createSupabaseServerClient();

  // Fetch company_user
  const { data: cu, error: cuError } = await supabase
    .from("company_users")
    .select("id, company_id, status")
    .eq("id", companyUserId)
    .maybeSingle();

  if (cuError) {
    console.error("removeRoleFromCompanyUser company_users lookup error:", cuError);
    throw new UserRoleError("Failed to fetch company user.");
  }

  if (!cu) throw new UserRoleError("Company user not found.");

  // Fetch role
  const { data: role, error: roleError } = await supabase
    .from("roles")
    .select("id, company_id, status")
    .eq("id", roleId)
    .maybeSingle();

  if (roleError) {
    console.error("removeRoleFromCompanyUser roles lookup error:", roleError);
    throw new UserRoleError("Failed to fetch role.");
  }

  if (!role) throw new UserRoleError("Role not found.");

  // Tenant checks
  if (context.role !== "SuperAdmin") {
    if (cu.company_id !== context.companyId) {
      throw new AuthorizationError("Company user does not belong to your company.");
    }
    if (role.company_id !== context.companyId) {
      throw new AuthorizationError("Role does not belong to your company.");
    }
  }

  const { error: deleteError } = await supabase
    .from("company_user_roles")
    .delete()
    .eq("company_user_id", companyUserId)
    .eq("role_id", roleId);

  if (deleteError) {
    console.error("removeRoleFromCompanyUser delete error:", deleteError);
    throw new UserRoleError("Failed to remove role from user.");
  }

  return true;
}

/* -------------------------------------------------------------------------- */
/* Get user roles                                                              */
/* -------------------------------------------------------------------------- */

export async function getUserRoles(companyUserId: string) {
  if (!companyUserId?.trim()) throw new UserRoleError("companyUserId is required.");

  const context = await requireCompanyContext();
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("company_user_roles")
    .select("role:roles(id, company_id, name, description, status)")
    .eq("company_user_id", companyUserId);

  if (error) {
    console.error("getUserRoles error:", error);
    throw new UserRoleError("Failed to fetch user roles.");
  }

  // Filter roles by tenant when necessary
  const rows = (data ?? []).map((r: any) => r.role) as RoleRow[];
  if (context.role !== "SuperAdmin") {
    return rows.filter((r) => r.company_id === context.companyId);
  }

  return rows;
}

/* -------------------------------------------------------------------------- */
/* Get available roles for current company                                     */
/* -------------------------------------------------------------------------- */

export async function getAvailableRoles(companyId?: string) {
  const context = await requireCompanyContext();
  const supabase = await createSupabaseServerClient();

  let query = supabase.from("roles").select("id, company_id, name, description, status").order("name");

  if (context.role !== "SuperAdmin") {
    query = query.eq("company_id", context.companyId!);
  } else if (companyId) {
    query = query.eq("company_id", companyId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getAvailableRoles error:", error);
    throw new UserRoleError("Failed to fetch roles.");
  }

  return (data ?? []) as RoleRow[];
}
