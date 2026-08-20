import {
  AuthorizationError,
} from "./auth";

import {
  createSupabaseServerClient,
} from "@/lib/db/server";

import type {
  AuthenticatedUser,
  SystemRole,
  UserTenantContext,
} from "@/lib/types";

/* ========================================================================== */
/* Database Types                                                             */
/* ========================================================================== */

type RoleStatus =
  | "active"
  | "inactive";

type PermissionRow = {
  permission_key: string;
};

type CompanyUserRoleRow = {
  role_id: string;

  role: {
    id: string;
    name: string;
    status: RoleStatus;

    role_permissions: {
      permission: PermissionRow | null;
    }[];
  } | null;
};

/* ========================================================================== */
/* System Roles                                                               */
/* ========================================================================== */

/**
 * These are application/system-level roles.
 *
 * They are NOT the same thing as company-defined RBAC roles.
 *
 * System roles:
 *
 * SuperAdmin
 * CompanyAdmin
 * User
 *
 * Company RBAC roles are stored in:
 *
 * roles
 *   ↓
 * role_permissions
 *   ↓
 * permissions
 */
const SYSTEM_ROLES = {
  SUPER_ADMIN: "SuperAdmin",
  COMPANY_ADMIN: "CompanyAdmin",
  USER: "User",
} as const;

/* ========================================================================== */
/* Role Checks                                                                */
/* ========================================================================== */

/**
 * Checks whether the current authorization context
 * represents a SuperAdmin.
 */
export function isSuperAdmin(
  context: UserTenantContext,
): boolean {
  return (
    context.role ===
    SYSTEM_ROLES.SUPER_ADMIN
  );
}

/**
 * Checks whether the current authorization context
 * represents a CompanyAdmin.
 *
 * This is a legacy/system-level role check.
 *
 * New feature authorization should normally use
 * requirePermission().
 */
export function isCompanyAdmin(
  context: UserTenantContext,
): boolean {
  return (
    context.role ===
    SYSTEM_ROLES.COMPANY_ADMIN
  );
}

/**
 * Checks whether the current authorization context
 * represents a regular User.
 */
export function isCompanyUser(
  context: UserTenantContext,
): boolean {
  return (
    context.role ===
    SYSTEM_ROLES.USER
  );
}

/* ========================================================================== */
/* Require Role                                                               */
/* ========================================================================== */

/**
 * Requires the user to have one of the supplied
 * system/application roles.
 *
 * This is retained for compatibility with existing
 * application code.
 *
 * New modules should generally prefer requirePermission().
 */
export function requireRole(
  context: UserTenantContext,
  allowedRoles: SystemRole[],
): void {
  if (
    !allowedRoles.includes(
      context.role,
    )
  ) {
    throw new AuthorizationError(
      "You do not have permission to perform this action.",
    );
  }
}

/* ========================================================================== */
/* Require SuperAdmin                                                         */
/* ========================================================================== */

/**
 * Only SuperAdmin is allowed.
 *
 * Accepts AuthenticatedUser because SuperAdmin checks
 * only need the role, not the full tenant context.
 */
export function requireSuperAdmin(
  user: AuthenticatedUser,
): void {
  if (user.role !== "SuperAdmin") {
    throw new AuthorizationError(
      "Only Super Admin can perform this action.",
    );
  }
}

/* ========================================================================== */
/* Require CompanyAdmin                                                       */
/* ========================================================================== */

/**
 * Requires the CompanyAdmin system role.
 *
 * IMPORTANT:
 *
 * This is intentionally NOT the primary authorization
 * mechanism for new CRUD features.
 *
 * New features should use:
 *
 * requirePermission(
 *   context,
 *   "departments.create",
 * );
 */
export function requireCompanyAdmin(
  context: UserTenantContext,
): void {
  if (!isCompanyAdmin(context)) {
    throw new AuthorizationError(
      "Only Company Admin can perform this action.",
    );
  }
}

/* ========================================================================== */
/* Require Company Context                                                    */
/* ========================================================================== */

/**
 * Returns the company associated with the current
 * authorization context.
 *
 * A company-specific operation cannot continue
 * without a company context.
 *
 * SuperAdmin:
 *
 * SuperAdmin may have companyId = null because
 * SuperAdmin operates at system level.
 */
export function requireCompanyContext(
  context: UserTenantContext,
): string {
  if (!context.companyId) {
    throw new AuthorizationError(
      "This action requires a company context.",
    );
  }

  return context.companyId;
}

/* ========================================================================== */
/* Require Company Access                                                     */
/* ========================================================================== */

/**
 * Ensures that the current user can access
 * the specified company.
 *
 * Rules:
 *
 * SuperAdmin
 *     ↓
 * Any company
 *
 * CompanyAdmin / User
 *     ↓
 * Own company only
 */
export function requireCompanyAccess(
  context: UserTenantContext,
  companyId: string,
): void {
  if (!companyId?.trim()) {
    throw new AuthorizationError(
      "Company ID is required.",
    );
  }

  /* ------------------------------------------------------------------------ */
  /* SuperAdmin                                                              */
  /* ------------------------------------------------------------------------ */

  if (isSuperAdmin(context)) {
    return;
  }

  /* ------------------------------------------------------------------------ */
  /* Company User                                                             */
  /* ------------------------------------------------------------------------ */

  if (!context.companyId) {
    throw new AuthorizationError(
      "You are not associated with a company.",
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Tenant Isolation                                                         */
  /* ------------------------------------------------------------------------ */

  if (
    context.companyId !==
    companyId
  ) {
    throw new AuthorizationError(
      "You do not have access to this company.",
    );
  }
}

/* ========================================================================== */
/* Require Company Management Access                                         */
/* ========================================================================== */

/**
 * Legacy company-management authorization.
 *
 * Rules:
 *
 * SuperAdmin
 *     ↓
 * Any company
 *
 * CompanyAdmin
 *     ↓
 * Own company only
 *
 * Regular User
 *     ↓
 * Denied
 *
 * New CRUD features should prefer permission-based
 * authorization.
 */
export function requireCompanyManagementAccess(
  context: UserTenantContext,
  companyId: string,
): void {
  /* ------------------------------------------------------------------------ */
  /* SuperAdmin                                                              */
  /* ------------------------------------------------------------------------ */

  if (isSuperAdmin(context)) {
    return;
  }

  /* ------------------------------------------------------------------------ */
  /* CompanyAdmin                                                            */
  /* ------------------------------------------------------------------------ */

  if (!isCompanyAdmin(context)) {
    throw new AuthorizationError(
      "Only Super Admin or Company Admin can manage a company.",
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Tenant Isolation                                                         */
  /* ------------------------------------------------------------------------ */

  requireCompanyAccess(
    context,
    companyId,
  );
}

/* ========================================================================== */
/* Permission Resolution                                                      */
/* ========================================================================== */

/**
 * Resolves all permissions belonging to the current user.
 *
 * Database relationship:
 *
 * company_users
 *      ↓
 * company_user_roles
 *      ↓
 * roles
 *      ↓
 * role_permissions
 *      ↓
 * permissions
 *
 * The permissions are always resolved from the
 * database.
 *
 * We NEVER trust permissions supplied by the client.
 */
async function getUserPermissionKeys(
  context: UserTenantContext,
): Promise<Set<string>> {
  /* ------------------------------------------------------------------------ */
  /* SuperAdmin                                                              */
  /* ------------------------------------------------------------------------ */

  /**
   * SuperAdmin has global access.
   *
   * We do not need to resolve company roles
   * for SuperAdmin.
   */
  if (isSuperAdmin(context)) {
    return new Set(["*"]);
  }

  /* ------------------------------------------------------------------------ */
  /* CompanyAdmin                                                             */
  /* ------------------------------------------------------------------------ */

  /**
   * CompanyAdmin has full access to their company.
   *
   * We do not need to resolve company roles
   * for CompanyAdmin.
   */
  if (isCompanyAdmin(context)) {
    return new Set(["*"]);
  }

  /* ------------------------------------------------------------------------ */
  /* Company Context                                                          */
  /* ------------------------------------------------------------------------ */

  const companyId =
    requireCompanyContext(context);

  /* ------------------------------------------------------------------------ */
  /* Database Client                                                          */
  /* ------------------------------------------------------------------------ */

  const supabase =
    await createSupabaseServerClient();

  /* ------------------------------------------------------------------------ */
  /* Resolve Company User                                                     */
  /* ------------------------------------------------------------------------ */

  /**
   * UserTenantContext.userId is the Supabase
   * auth.users.id.
   *
   * company_users.auth_user_id contains the
   * same value.
   */
  const {
    data: companyUser,
    error: companyUserError,
  } = await supabase
    .from("company_users")
    .select("id")
    .eq(
      "auth_user_id",
      context.userId,
    )
    .eq(
      "company_id",
      companyId,
    )
    .maybeSingle();

  if (companyUserError) {
    console.error(
      "getUserPermissionKeys company user error:",
      companyUserError,
    );

    throw new AuthorizationError(
      "Unable to resolve your company authorization.",
    );
  }

  if (!companyUser) {
    throw new AuthorizationError(
      "You are not associated with this company.",
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Resolve Roles + Permissions                                              */
  /* ------------------------------------------------------------------------ */

  const {
    data: roleRows,
    error: roleError,
  } = await supabase
    .from("company_user_roles")
    .select(`
      role_id,
      roles!inner (
        id,
        name,
        status,
        role_permissions (
          permission:permissions (
            permission_key
          )
        )
      )
    `)
    .eq(
      "company_user_id",
      companyUser.id,
    );

  if (roleError) {
    console.error(
      "getUserPermissionKeys role error:",
      roleError,
    );

    throw new AuthorizationError(
      "Unable to resolve your permissions.",
    );
  }

  const permissions =
    new Set<string>();

  const rows =
    (roleRows ?? []) as unknown as CompanyUserRoleRow[];

  /* ------------------------------------------------------------------------ */
  /* Collect Permissions                                                      */
  /* ------------------------------------------------------------------------ */

  for (const row of rows) {
    const role = row.role;

    if (!role) {
      continue;
    }

    /*
     * Inactive roles must never grant permissions.
     */
    if (
      role.status !== "active"
    ) {
      continue;
    }

    for (
      const rolePermission
      of role.role_permissions ?? []
    ) {
      const permission =
        rolePermission.permission;

      if (!permission) {
        continue;
      }

      const permissionKey =
        permission.permission_key?.trim();

      if (!permissionKey) {
        continue;
      }

      permissions.add(
        permissionKey,
      );
    }
  }

  return permissions;
}

/* ========================================================================== */
/* Has Permission                                                             */
/* ========================================================================== */

/**
 * Checks whether a user has a specific permission.
 *
 * Example:
 *
 * const allowed = await hasPermission(
 *   context,
 *   "departments.create",
 * );
 */
export async function hasPermission(
  context: UserTenantContext,
  permissionKey: string,
): Promise<boolean> {
  const normalizedKey =
    permissionKey?.trim();

  if (!normalizedKey) {
    return false;
  }

  /* ------------------------------------------------------------------------ */
  /* SuperAdmin                                                              */
  /* ------------------------------------------------------------------------ */

  /**
   * SuperAdmin has global access.
   */
  if (isSuperAdmin(context)) {
    return true;
  }

  /* ------------------------------------------------------------------------ */
  /* Resolve Permissions                                                      */
  /* ------------------------------------------------------------------------ */

  const permissions =
    await getUserPermissionKeys(
      context,
    );

  /* ------------------------------------------------------------------------ */
  /* Wildcard                                                                */
  /* ------------------------------------------------------------------------ */

  if (
    permissions.has("*")
  ) {
    return true;
  }

  /* ------------------------------------------------------------------------ */
  /* Exact Permission                                                        */
  /* ------------------------------------------------------------------------ */

  return permissions.has(
    normalizedKey,
  );
}

/* ========================================================================== */
/* Require Permission                                                         */
/* ========================================================================== */

/**
 * Requires a specific permission.
 *
 * This is the PRIMARY authorization function
 * for new CRUD modules.
 *
 * Example:
 *
 * await requirePermission(
 *   context,
 *   "departments.create",
 * );
 */
export async function requirePermission(
  context: UserTenantContext,
  permissionKey: string,
): Promise<void> {
  const normalizedKey =
    permissionKey?.trim();

  if (!normalizedKey) {
    throw new AuthorizationError(
      "Permission key is required.",
    );
  }

  const allowed =
    await hasPermission(
      context,
      normalizedKey,
    );

  if (!allowed) {
    throw new AuthorizationError(
      "You do not have permission to perform this action.",
    );
  }
}

/* ========================================================================== */
/* Require Any Permission                                                    */
/* ========================================================================== */

/**
 * Requires at least ONE of the supplied
 * permissions.
 *
 * Example:
 *
 * await requireAnyPermission(
 *   context,
 *   [
 *     "departments.view",
 *     "departments.manage",
 *   ],
 * );
 */
export async function requireAnyPermission(
  context: UserTenantContext,
  permissionKeys: string[],
): Promise<void> {
  const normalizedKeys =
    permissionKeys
      .map((key) => key.trim())
      .filter(Boolean);

  if (
    normalizedKeys.length === 0
  ) {
    throw new AuthorizationError(
      "At least one permission is required.",
    );
  }

  /* ------------------------------------------------------------------------ */
  /* SuperAdmin                                                              */
  /* ------------------------------------------------------------------------ */

  if (isSuperAdmin(context)) {
    return;
  }

  /* ------------------------------------------------------------------------ */
  /* Resolve Permissions                                                      */
  /* ------------------------------------------------------------------------ */

  const permissions =
    await getUserPermissionKeys(
      context,
    );

  /* ------------------------------------------------------------------------ */
  /* Check Any                                                               */
  /* ------------------------------------------------------------------------ */

  const allowed =
    normalizedKeys.some(
      (permissionKey) =>
        permissions.has(
          permissionKey,
        ),
    );

  if (!allowed) {
    throw new AuthorizationError(
      "You do not have permission to perform this action.",
    );
  }
}

/* ========================================================================== */
/* Require All Permissions                                                    */
/* ========================================================================== */

/**
 * Requires ALL supplied permissions.
 *
 * Example:
 *
 * await requireAllPermissions(
 *   context,
 *   [
 *     "departments.view",
 *     "departments.update",
 *   ],
 * );
 */
export async function requireAllPermissions(
  context: UserTenantContext,
  permissionKeys: string[],
): Promise<void> {
  const normalizedKeys =
    permissionKeys
      .map((key) => key.trim())
      .filter(Boolean);

  if (
    normalizedKeys.length === 0
  ) {
    throw new AuthorizationError(
      "At least one permission is required.",
    );
  }

  /* ------------------------------------------------------------------------ */
  /* SuperAdmin                                                              */
  /* ------------------------------------------------------------------------ */

  if (isSuperAdmin(context)) {
    return;
  }

  /* ------------------------------------------------------------------------ */
  /* Resolve Permissions                                                      */
  /* ------------------------------------------------------------------------ */

  const permissions =
    await getUserPermissionKeys(
      context,
    );

  /* ------------------------------------------------------------------------ */
  /* Find Missing Permissions                                                 */
  /* ------------------------------------------------------------------------ */

  const missingPermissions =
    normalizedKeys.filter(
      (permissionKey) =>
        !permissions.has(
          permissionKey,
        ),
    );

  if (
    missingPermissions.length > 0
  ) {
    throw new AuthorizationError(
      "You do not have permission to perform this action.",
    );
  }
}

/* ========================================================================== */
/* Get Current User Permissions                                               */
/* ========================================================================== */

/**
 * Returns all permission keys available
 * to the authenticated user.
 *
 * Useful for:
 *
 * - Server-side authorization
 * - Conditional UI
 * - Navigation
 * - Debugging RBAC
 *
 * IMPORTANT:
 *
 * UI permission checks are NOT security boundaries.
 *
 * Server actions must still call requirePermission().
 */
export async function getCurrentUserPermissions(
  context: UserTenantContext,
): Promise<string[]> {
  const permissions =
    await getUserPermissionKeys(
      context,
    );

  return Array.from(
    permissions,
  ).sort();
}