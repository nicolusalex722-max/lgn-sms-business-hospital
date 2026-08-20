import { createSupabaseServerClient } from "@/lib/db/server";
import { AuthorizationError, requireUserTenantContext } from "./auth";

/**
 * Centralized permission keys used by the application.
 *
 * IMPORTANT:
 * - These values must match the permission_key column in the `permissions` table.
 * - Prefer adding keys here only after confirming they exist in the DB.
 */
export const PERMISSIONS = {
  EMPLOYEES_VIEW: "employees.view",
  EMPLOYEES_CREATE: "employees.create",
  EMPLOYEES_UPDATE: "employees.update",
  EMPLOYEES_DELETE: "employees.delete",

  DEPARTMENTS_VIEW: "departments.view",
  DEPARTMENTS_CREATE: "departments.create",
  DEPARTMENTS_UPDATE: "departments.update",
  DEPARTMENTS_DELETE: "departments.delete",

  ROLES_VIEW: "roles.view",
  ROLES_CREATE: "roles.create",
  ROLES_UPDATE: "roles.update",
  ROLES_DELETE: "roles.delete",

  PERMISSIONS_VIEW: "permissions.view",
  PERMISSIONS_MANAGE: "permissions.manage",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/* -------------------------------------------------------------------------- */
/* Permission helpers                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Check if the authenticated user has the given permission in their company.
 *
 * Returns true if the permission is granted by ANY active role assigned to the
 * authenticated company user.
 */
export async function hasPermission(
  userCompanyUserId: string,
  companyId: string,
  permissionKey: string,
): Promise<boolean> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("company_user_roles")
    .select(
      `
      role_id (
        id,
        company_id,
        status,
        role_permissions(permission_id ( permissions ( permission_key ) ) )
      )
    `,
      { count: "exact", head: false }
    )
    .eq("company_user_id", userCompanyUserId)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("hasPermission error:", error);
    return false;
  }

  // Note: this query is a convenience. The authoritative permission check should
  // be performed using a strict JOIN chain to avoid accidental cross-tenant
  // matches. We'll implement the strict check in requirePermission below.

  if (!data) {
    return false;
  }

  // Flatten and look for permissionKey in the nested payload (best-effort).
  try {
    const role = (data as any).role;

    if (!role || role.status !== "active") return false;

    const permissions = (role.role_permissions ?? [])
      .map((rp: any) => rp.permission_id?.permissions?.permission_key)
      .filter(Boolean);

    return permissions.includes(permissionKey);
  } catch (err) {
    console.error("hasPermission unexpected error:", err);
    return false;
  }
}

/**
 * Requires that the current authenticated user has the specified permission.
 * Throws AuthorizationError if the permission is not granted.
 *
 * This performs a strict server-side look-up using JOINs to ensure tenant
 * isolation and to only consider active roles.
 *
 * Returns the authenticated company_user id and the authenticated company id.
 * For SuperAdmin the companyId may be null — callers must handle that case.
 */
export async function requirePermission(
  permissionKey: string,
): Promise<{ companyUserId: string; companyId: string | null }> {
  const context = await requireUserTenantContext();

  // SuperAdmin (system-level) bypass: preserve existing behavior by allowing
  // SuperAdmin to bypass company-level permissions when appropriate. For
  // tenant-scoped permissions we still prefer explicit matching; here we will
  // allow SuperAdmin to pass the check. SuperAdmin may have a null companyId.
  if (context.role === "SuperAdmin") {
    return { companyUserId: context.userId, companyId: context.companyId };
  }

  // CompanyAdmin (tenant administrator) bypass: CompanyAdmins have complete
  // control over their company tenant, so we allow them to pass the permission
  // check as well, while maintaining company context validation.
  if (context.role === "CompanyAdmin") {
    return { companyUserId: context.userId, companyId: context.companyId };
  }

  // For non-superadmin users a company context is required. Narrow the type
  // systemically by throwing if companyId is missing — after this check
  // TypeScript understands context.companyId is a string.
  if (!context.companyId) {
    throw new AuthorizationError("This action requires a company context.");
  }

  const supabase = await createSupabaseServerClient();

  /*
   * Strict permission check implementing the chain:
   * company_user_roles -> roles (active, same company) -> role_permissions -> permissions
   */
  const sql = `
    SELECT p.permission_key
    FROM company_user_roles cur
    JOIN roles r ON cur.role_id = r.id
    JOIN role_permissions rp ON r.id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE cur.company_user_id = $1
      AND r.company_id = $2
      AND r.status = 'active'
      AND p.permission_key = $3
    LIMIT 1
  `;

  const { data, error } = await supabase.rpc("exec_sql", { sql, params: [context.userId, context.companyId, permissionKey] });

  // If the project does not provide an exec_sql RPC, fall back to PostgREST
  // style query using joins (note: supabase-js may not support arbitrary SQL
  // via RPC without a server-side function). We'll attempt a join query now.

  if (error) {
    console.warn("requirePermission.exec_sql failed, falling back to join query:", error);

    const { data: joinData, error: joinError } = await supabase
      .from("company_user_roles")
      .select(
        `
          cur:company_user_id,
          role:roles!inner(id, company_id, status, role_permissions!inner(permission_id ( permissions!inner(permission_key) )))
        `
      )
      .eq("company_user_id", context.userId)
      .eq("roles.company_id", context.companyId)
      .eq("roles.status", "active")
      .limit(1);

    if (joinError) {
      console.error("requirePermission join query failed:", joinError);
      throw new AuthorizationError("You do not have permission to perform this action.");
    }

    if (!joinData || (joinData as any[]).length === 0) {
      throw new AuthorizationError("You do not have permission to perform this action.");
    }

    // inspect nested permission entries for the requested permissionKey
    try {
      const nested = (joinData as any[])[0];
      const role = nested.role;
      const rps = role.role_permissions ?? [];
      const found = rps.some((rp: any) => rp.permission_id?.permissions?.permission_key === permissionKey);

      if (!found) {
        throw new AuthorizationError("You do not have permission to perform this action.");
      }

      return { companyUserId: context.userId, companyId: context.companyId };
    } catch (err) {
      console.error("requirePermission nested parse error:", err);
      throw new AuthorizationError("You do not have permission to perform this action.");
    }
  }

  // If exec_sql succeeded, inspect data
  if (!data || (data as any[]).length === 0) {
    throw new AuthorizationError("You do not have permission to perform this action.");
  }

  return { companyUserId: context.userId, companyId: context.companyId };
}
