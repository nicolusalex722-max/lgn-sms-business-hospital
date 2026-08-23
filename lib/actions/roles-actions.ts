"use server";

import { createSupabaseServerClient } from "@/lib/db/server";
import {
  AuthenticationError,
  AuthorizationError,
  requireUserTenantContext,
} from "@/lib/auth";

import type {
  Role,
  Permission,
  RolePermission,
  RoleStatus,
} from "@/lib/types";

/**
 * Roles actions
 *
 * Responsibilities:
 * - Company-scoped role management
 * - Role permission management
 * - Tenant isolation for CompanyAdmin
 * - Cross-company management for SuperAdmin
 *
 * IMPORTANT:
 * This file is a Server Action module.
 * Therefore every exported member must be an async function.
 */

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */
type RoleUpdateInput = {
  name?: string;
  description?: string | null;
  status?: RoleStatus;
};

/* -------------------------------------------------------------------------- */
/* Errors                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Private error class.
 *
 * DO NOT export this class from a "use server" file.
 */
class RoleError extends Error {
  constructor(message = "Role error") {
    super(message);
    this.name = "RoleError";
  }
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const ROLE_SELECT = `
  id,
  company_id,
  name,
  description,
  status,
  created_by,
  created_at,
  updated_at
`;

const PERMISSION_SELECT = `
  id,
  permission_key,
  module,
  action,
  description
`;

/* -------------------------------------------------------------------------- */
/* Validation Helpers                                                         */
/* -------------------------------------------------------------------------- */

function requireNonEmptyString(
  value: string,
  fieldName: string,
): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new RoleError(`${fieldName} is required.`);
  }

  return value.trim();
}

function normalizeNullableString(
  value: string | null | undefined,
): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

function validateRoleStatus(status: RoleStatus | undefined): void {
  if (
    status !== undefined &&
    status !== "active" &&
    status !== "inactive"
  ) {
    throw new RoleError("Invalid role status.");
  }
}

/* -------------------------------------------------------------------------- */
/* Authorization Helpers                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Returns the current tenant context.
 *
 * CompanyAdmin:
 *   - Must have a companyId.
 *   - All operations are restricted to that company.
 *
 * SuperAdmin:
 *   - May operate without a companyId.
 *   - For company-specific mutations, a companyId must be supplied.
 */
async function requireCompanyContextOrSuperAdmin() {
  const context = await requireUserTenantContext();

  if (!context) {
    throw new AuthorizationError();
  }

  if (
    context.role !== "SuperAdmin" &&
    !context.companyId
  ) {
    throw new AuthorizationError(
      "Your account is not associated with a company.",
    );
  }

  return context;
}

/**
 * Resolves the company that a role operation should target.
 */
async function resolveTargetCompanyId(
  companyId?: string,
): Promise<{
  context: Awaited<ReturnType<typeof requireCompanyContextOrSuperAdmin>>;
  companyId: string;
}> {
  const context = await requireCompanyContextOrSuperAdmin();

  if (context.role === "SuperAdmin") {
    const targetCompanyId = requireNonEmptyString(
      companyId ?? "",
      "companyId",
    );

    return {
      context,
      companyId: targetCompanyId,
    };
  }

  return {
    context,
    companyId: context.companyId!,
  };
}

/**
 * Ensures that a role belongs to the current user's company.
 *
 * SuperAdmin is allowed to access any role.
 */
function assertRoleAccess(
  context: Awaited<
    ReturnType<typeof requireCompanyContextOrSuperAdmin>
  >,
  role: Role,
): void {
  if (context.role === "SuperAdmin") {
    return;
  }

  if (role.company_id !== context.companyId) {
    throw new AuthorizationError(
      "You do not have permission to access this role.",
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Database Helpers                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Fetches a role by ID while enforcing tenant isolation.
 *
 * This is intentionally private.
 * Server Actions should not call another exported Server Action internally.
 */
async function findRoleById(
  id: string,
): Promise<{
  context: Awaited<
    ReturnType<typeof requireCompanyContextOrSuperAdmin>
  >;
  role: Role | null;
}> {
  const roleId = requireNonEmptyString(id, "Role id");

  const context = await requireCompanyContextOrSuperAdmin();
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("roles")
    .select(ROLE_SELECT)
    .eq("id", roleId)
    .limit(1);

  /**
   * CompanyAdmin can only see roles belonging to their company.
   */
  if (context.role !== "SuperAdmin") {
    query = query.eq("company_id", context.companyId!);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error("findRoleById error:", error);
    throw new RoleError("Failed to fetch role.");
  }

  return {
    context,
    role: data as Role | null,
  };
}

/**
 * Checks whether a role exists and is accessible.
 */
async function requireRoleById(
  id: string,
): Promise<{
  context: Awaited<
    ReturnType<typeof requireCompanyContextOrSuperAdmin>
  >;
  role: Role;
}> {
  const result = await findRoleById(id);

  if (!result.role) {
    throw new RoleError("Role not found.");
  }

  assertRoleAccess(result.context, result.role);

  return {
    context: result.context,
    role: result.role,
  };
}

/* -------------------------------------------------------------------------- */
/* Get Roles                                                                  */
/* -------------------------------------------------------------------------- */

export async function getRolesForCompany(
  companyId?: string,
): Promise<Role[]> {
  const {
    context,
    companyId: targetCompanyId,
  } = await resolveTargetCompanyId(companyId);

  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("roles")
    .select(ROLE_SELECT)
    .order("created_at", {
      ascending: false,
    });

  /**
   * Always scope the query.
   *
   * CompanyAdmin:
   *   targetCompanyId = their own company.
   *
   * SuperAdmin:
   *   targetCompanyId = explicitly requested company.
   */
  query = query.eq("company_id", targetCompanyId);

  const { data, error } = await query;

  if (error) {
    console.error("getRolesForCompany error:", error);

    throw new RoleError(
      "Failed to fetch roles.",
    );
  }

  /**
   * Defensive check.
   *
   * The query is already tenant-scoped, but this makes the intention
   * explicit and protects against accidental future query changes.
   */
  if (
    context.role !== "SuperAdmin" &&
    targetCompanyId !== context.companyId
  ) {
    throw new AuthorizationError(
      "You do not have permission to access these roles.",
    );
  }

  return (data ?? []) as Role[];
}

/* -------------------------------------------------------------------------- */
/* Get Single Role                                                            */
/* -------------------------------------------------------------------------- */

export async function getRoleById(
  id: string,
): Promise<Role | null> {
  const { role } = await findRoleById(id);

  return role;
}

/* -------------------------------------------------------------------------- */
/* Create Role                                                                */
/* -------------------------------------------------------------------------- */

export async function createRole(
  name: string,
  description: string | null,
  companyId?: string,
): Promise<Role> {
  const roleName = requireNonEmptyString(
    name,
    "Role name",
  );

  const {
    companyId: targetCompanyId,
  } = await resolveTargetCompanyId(companyId);

  const normalizedDescription =
    normalizeNullableString(description);

  const supabase = await createSupabaseServerClient();

  /**
   * Prevent duplicate role names inside the same company.
   *
   * We do this explicitly so the user gets a meaningful error instead
   * of a generic database error.
   */
  const { data: existingRole, error: existingRoleError } =
    await supabase
      .from("roles")
      .select("id")
      .eq("company_id", targetCompanyId)
      .ilike("name", roleName)
      .limit(1)
      .maybeSingle();

  if (existingRoleError) {
    console.error(
      "createRole duplicate check error:",
      existingRoleError,
    );

    throw new RoleError(
      "Failed to validate role name.",
    );
  }

  if (existingRole) {
    throw new RoleError(
      "A role with this name already exists in this company.",
    );
  }

  const { data, error } = await supabase
    .from("roles")
    .insert({
      name: roleName,
      description: normalizedDescription ?? null,
      company_id: targetCompanyId,
      status: "active",
    })
    .select(ROLE_SELECT)
    .single();

  if (error) {
    console.error("createRole error:", error);

    throw new RoleError(
      "Failed to create role.",
    );
  }

  return data as Role;
}

/* -------------------------------------------------------------------------- */
/* Update Role                                                                */
/* -------------------------------------------------------------------------- */

export async function updateRole(
  id: string,
  updates: RoleUpdateInput,
): Promise<Role> {
  const { role } = await requireRoleById(id);

  if (!updates || typeof updates !== "object") {
    throw new RoleError(
      "Role updates are required.",
    );
  }

  validateRoleStatus(updates.status);

  const updateData: Partial<Role> = {};

  if (updates.name !== undefined) {
    const roleName = requireNonEmptyString(
      updates.name,
      "Role name",
    );

    updateData.name = roleName;
  }

  if (updates.description !== undefined) {
    updateData.description =
      normalizeNullableString(
        updates.description,
      ) ?? null;
  }

  if (updates.status !== undefined) {
    updateData.status = updates.status;
  }

  /**
   * Nothing to update.
   */
  if (Object.keys(updateData).length === 0) {
    return role;
  }

  const supabase = await createSupabaseServerClient();

  /**
   * If the name is changing, make sure the new name is not already
   * used by another role in the same company.
   */
  if (
    updateData.name !== undefined &&
    updateData.name !== role.name
  ) {
    const { data: existingRole, error: existingRoleError } =
      await supabase
        .from("roles")
        .select("id")
        .eq("company_id", role.company_id)
        .neq("id", role.id)
        .ilike("name", updateData.name)
        .limit(1)
        .maybeSingle();

    if (existingRoleError) {
      console.error(
        "updateRole duplicate check error:",
        existingRoleError,
      );

      throw new RoleError(
        "Failed to validate role name.",
      );
    }

    if (existingRole) {
      throw new RoleError(
        "A role with this name already exists in this company.",
      );
    }
  }

  const { data, error } = await supabase
    .from("roles")
    .update(updateData)
    .eq("id", role.id)
    .eq("company_id", role.company_id)
    .select(ROLE_SELECT)
    .single();

  if (error) {
    console.error("updateRole error:", error);

    throw new RoleError(
      "Failed to update role.",
    );
  }

  return data as Role;
}

/* -------------------------------------------------------------------------- */
/* Delete Role                                                                */
/* -------------------------------------------------------------------------- */

export async function deleteRole(
  id: string,
): Promise<boolean> {
  const { role } = await requireRoleById(id);

  const supabase = await createSupabaseServerClient();

  /**
   * First delete role permissions.
   *
   * If your database has ON DELETE CASCADE on role_permissions.role_id,
   * this is harmlessly redundant but still explicit.
   */
  const {
    error: permissionsDeleteError,
  } = await supabase
    .from("role_permissions")
    .delete()
    .eq("role_id", role.id);

  if (permissionsDeleteError) {
    console.error(
      "deleteRole permissions error:",
      permissionsDeleteError,
    );

    throw new RoleError(
      "Failed to remove role permissions.",
    );
  }

  /**
   * Delete only the role that belongs to its company.
   */
  const { error } = await supabase
    .from("roles")
    .delete()
    .eq("id", role.id)
    .eq("company_id", role.company_id);

  if (error) {
    console.error(
      "deleteRole error:",
      error,
    );

    throw new RoleError(
      "Failed to delete role.",
    );
  }

  return true;
}

/* -------------------------------------------------------------------------- */
/* Get Permissions                                                            */
/* -------------------------------------------------------------------------- */

export async function getPermissions(): Promise<
  Permission[]
> {
  /**
   * Permissions are GLOBAL system definitions, not company-scoped data.
   *
   * They must be readable by any authenticated user (CompanyAdmin,
   * CompanyUser, and SuperAdmin alike). We therefore intentionally do NOT
   * call requireCompanyContextOrSuperAdmin() here.
   *
   * That helper throws for SuperAdmin (getUserTenantContext returns null)
   * and for any user that lacks a company_admins/company_users row, which
   * previously caused getPermissions() to throw and the UI to silently
   * display "No permissions available." even though 28 records existed.
   *
   * We only verify that the request is authenticated.
   */
  const supabase = await createSupabaseServerClient();

  const {
    data: authData,
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    throw new AuthenticationError();
  }

  const {
    data,
    error,
  } = await supabase
    .from("permissions")
    .select(PERMISSION_SELECT)
    .order("permission_key", {
      ascending: true,
    });

  if (error) {
    console.error(
      "getPermissions error:",
      error,
    );

    throw new RoleError(
      "Failed to fetch permissions.",
    );
  }

  return (data ?? []) as Permission[];
}

/* -------------------------------------------------------------------------- */
/* Get Role Permissions                                                       */
/* -------------------------------------------------------------------------- */

export async function getRolePermissions(
  roleId: string,
): Promise<Permission[]> {
  /**
   * requireRoleById performs tenant isolation.
   */
  await requireRoleById(roleId);

  const supabase = await createSupabaseServerClient();

  const {
    data,
    error,
  } = await supabase
    .from("role_permissions")
    .select(`
      permission_id (
        id,
        permission_key,
        module,
        action,
        description
      )
    `)
    .eq("role_id", roleId);

  if (error) {
    console.error(
      "getRolePermissions error:",
      error,
    );

    throw new RoleError(
      "Failed to fetch role permissions.",
    );
  }

  /**
   * Supabase nested relationship results are not always inferred
   * correctly by TypeScript, so we normalize them explicitly.
   */
  const permissions: Permission[] = [];

  for (const row of (data ?? []) as Array<{
    permission_id:
      | Permission
      | Permission[]
      | null;
  }>) {
    if (!row.permission_id) {
      continue;
    }

    if (Array.isArray(row.permission_id)) {
      permissions.push(
        ...row.permission_id,
      );
    } else {
      permissions.push(
        row.permission_id,
      );
    }
  }

  return permissions;
}

/* -------------------------------------------------------------------------- */
/* Update Role Permissions                                                    */
/* -------------------------------------------------------------------------- */

export async function updateRolePermissions(
  roleId: string,
  permissionIds: string[],
): Promise<RolePermission[]> {
  /**
   * Verify the role first.
   *
   * This is critical:
   *
   * CompanyAdmin A must NEVER be able to update permissions belonging
   * to a role from Company B.
   */
  await requireRoleById(roleId);

  if (!Array.isArray(permissionIds)) {
    throw new RoleError(
      "permissionIds must be an array.",
    );
  }

  /**
   * Remove duplicates and invalid values.
   */
  const normalizedPermissionIds = [
    ...new Set(
      permissionIds
        .filter(
          (permissionId): permissionId is string =>
            typeof permissionId === "string",
        )
        .map((permissionId) =>
          permissionId.trim(),
        )
        .filter(Boolean),
    ),
  ];

  const supabase = await createSupabaseServerClient();

  /**
   * If no permissions were supplied, clear the existing permissions.
   */
  const {
    error: deleteError,
  } = await supabase
    .from("role_permissions")
    .delete()
    .eq("role_id", roleId);

  if (deleteError) {
    console.error(
      "updateRolePermissions delete error:",
      deleteError,
    );

    throw new RoleError(
      "Failed to remove existing role permissions.",
    );
  }

  if (
    normalizedPermissionIds.length === 0
  ) {
    return [];
  }

  /**
   * Verify that all requested permissions actually exist.
   */
  const {
    data: validPermissions,
    error: permissionValidationError,
  } = await supabase
    .from("permissions")
    .select("id")
    .in(
      "id",
      normalizedPermissionIds,
    );

  if (permissionValidationError) {
    console.error(
      "updateRolePermissions permission validation error:",
      permissionValidationError,
    );

    throw new RoleError(
      "Failed to validate permissions.",
    );
  }

  const validPermissionIds = new Set(
    (validPermissions ?? []).map(
      (permission) => permission.id,
    ),
  );

  const invalidPermissionIds =
    normalizedPermissionIds.filter(
      (permissionId) =>
        !validPermissionIds.has(
          permissionId,
        ),
    );

  if (
    invalidPermissionIds.length > 0
  ) {
    throw new RoleError(
      "One or more selected permissions do not exist.",
    );
  }

  const inserts = normalizedPermissionIds.map(
    (permissionId) => ({
      role_id: roleId,
      permission_id: permissionId,
    }),
  );

  const {
    data,
    error: insertError,
  } = await supabase
    .from("role_permissions")
    .insert(inserts)
    .select("role_id, permission_id");

  if (insertError) {
    console.error(
      "updateRolePermissions insert error:",
      insertError,
    );

    throw new RoleError(
      "Failed to update role permissions.",
    );
  }

  return (data ??
    []) as RolePermission[];
}
