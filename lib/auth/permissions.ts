import { createSupabaseServerClient } from "@/lib/db/server";
import {
  AuthorizationError,
  requireUserTenantContext,
} from "./auth";

/**
 * Centralized permission keys.
 *
 * IMPORTANT:
 * These values MUST exactly match permissions.permission_key
 * in the database.
 *
 * The database uses:
 *   view
 *   create
 *   edit
 *   delete
 *
 * It does NOT use "update".
 */
export const PERMISSIONS = {
  // Employees
  EMPLOYEES_VIEW: "employees.view",
  EMPLOYEES_CREATE: "employees.create",
  EMPLOYEES_EDIT: "employees.edit",
  EMPLOYEES_DELETE: "employees.delete",

  // Companies
  COMPANIES_VIEW: "companies.view",
  COMPANIES_CREATE: "companies.create",
  COMPANIES_EDIT: "companies.edit",
  COMPANIES_DELETE: "companies.delete",

  // Departments
  DEPARTMENTS_VIEW: "departments.view",
  DEPARTMENTS_CREATE: "departments.create",
  DEPARTMENTS_EDIT: "departments.edit",
  DEPARTMENTS_DELETE: "departments.delete",

  // Branches
  BRANCHES_VIEW: "branches.view",
  BRANCHES_CREATE: "branches.create",
  BRANCHES_EDIT: "branches.edit",
  BRANCHES_DELETE: "branches.delete",

  // Products
  PRODUCTS_VIEW: "products.view",
  PRODUCTS_CREATE: "products.create",
  PRODUCTS_EDIT: "products.edit",
  PRODUCTS_DELETE: "products.delete",

  // Subscription Plans
  SUBSCRIPTION_PLANS_VIEW: "subscription_plans.view",
  SUBSCRIPTION_PLANS_CREATE: "subscription_plans.create",
  SUBSCRIPTION_PLANS_EDIT: "subscription_plans.edit",
  SUBSCRIPTION_PLANS_DELETE: "subscription_plans.delete",

  // Roles
  ROLES_VIEW: "roles.view",
  ROLES_CREATE: "roles.create",
  ROLES_EDIT: "roles.edit",
  ROLES_DELETE: "roles.delete",
} as const;

export type PermissionKey =
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Check whether the current company user has a specific permission.
 *
 * This function is intentionally strict:
 *
 * company_user_roles
 *      ↓
 * roles
 *      ↓
 * role_permissions
 *      ↓
 * permissions
 *
 * The role must:
 * - belong to the current company
 * - be active
 *
 * The permission must:
 * - exist
 * - be assigned to that role
 */

/**
 * Runtime shape of the `hasPermission` query result.
 *
 * NOTE:
 * Supabase's client (without a generated `Database` generic) types every
 * embedded relation as an array. In reality:
 *   - `role:roles!inner` is a to-one relation -> a single object at runtime.
 *   - `permission:permissions` is a to-one relation -> a single object at runtime.
 *   - `role_permissions` is a to-many relation -> an array at runtime.
 *
 * We declare the real runtime shape here and cast the query result to it so
 * the type checker matches what Supabase actually returns.
 */
type RolePermissionQueryRow = {
  role: {
    id: string;
    company_id: string;
    status: string;
    role_permissions: Array<{
      permission: { permission_key: string } | null;
    }>;
  } | null;
};

export async function hasPermission(
  userCompanyUserId: string,
  companyId: string,
  permissionKey: PermissionKey,
): Promise<boolean> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("company_user_roles")
    .select(`
      role:roles!inner (
        id,
        company_id,
        status,
        role_permissions (
          permission:permissions (
            permission_key
          )
        )
      )
    `)
    .eq("company_user_id", userCompanyUserId)
    .eq("roles.company_id", companyId)
    .eq("roles.status", "active");

  if (error) {
    console.error("hasPermission database error:", error);
    return false;
  }

  if (!data || data.length === 0) {
    return false;
  }

  const rows = data as unknown as RolePermissionQueryRow[];

  for (const assignment of rows) {
    const role = assignment.role;

    if (!role) {
      continue;
    }

    for (const rolePermission of role.role_permissions ?? []) {
      const permission = rolePermission.permission;

      if (permission?.permission_key === permissionKey) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Require the current authenticated user to have a permission.
 *
 * Throws AuthorizationError when permission is not granted.
 *
 * Returns the authenticated company-user context after authorization succeeds.
 */
export async function requirePermission(
  permissionKey: PermissionKey,
): Promise<{
  companyUserId: string;
  companyId: string | null;
}> {
  const context = await requireUserTenantContext();

  /*
   * SuperAdmin
   *
   * A SuperAdmin operates at system level and does not need
   * a company-level role assignment.
   */
  if (context.role === "SuperAdmin") {
    return {
      companyUserId: context.userId,
      companyId: context.companyId,
    };
  }

  /*
   * CompanyAdmin
   *
   * Company administrators have full access within their company.
   */
  if (context.role === "CompanyAdmin") {
    if (!context.companyId) {
      throw new AuthorizationError(
        "Company administrator does not have a company context.",
      );
    }

    return {
      companyUserId: context.userId,
      companyId: context.companyId,
    };
  }

  /*
   * Normal company user
   *
   * A company context is mandatory.
   */
  if (!context.companyId) {
    throw new AuthorizationError(
      "This action requires a company context.",
    );
  }

  /*
   * IMPORTANT:
   *
   * We use the authenticated user's ID from the tenant context
   * as the company_user_id.
   *
   * If your requireUserTenantContext() returns an auth.users ID
   * instead of company_user.id, this MUST be adjusted.
   */
  const allowed = await hasPermission(
    context.userId,
    context.companyId,
    permissionKey,
  );

  if (!allowed) {
    throw new AuthorizationError(
      "You do not have permission to perform this action.",
    );
  }

  return {
    companyUserId: context.userId,
    companyId: context.companyId,
  };
}