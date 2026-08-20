"use server";

import { createSupabaseServerClient } from "@/lib/db/server";
import {
  AuthorizationError,
  requireUserTenantContext,
} from "@/lib/auth";

/**
 * User Roles Actions
 *
 * Responsibilities:
 * - Assign roles to company users
 * - Remove roles from company users
 * - Read roles assigned to a company user
 * - Read roles available to a company
 *
 * Security model:
 *
 * CompanyAdmin:
 *   - Can only manage users in their own company.
 *   - Can only assign roles belonging to their own company.
 *
 * SuperAdmin:
 *   - Can manage users/roles across companies.
 *
 * IMPORTANT:
 * This is a "use server" module.
 * Every exported member must be an async function.
 */

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type CompanyUserStatus =
  | "active"
  | "inactive"
  | "suspended";

type RoleStatus =
  | "active"
  | "inactive"
  | "suspended";

type CompanyUserRow = {
  id: string;
  auth_user_id: string;
  company_id: string;
  status: CompanyUserStatus;
};

type RoleRow = {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  status: RoleStatus;
};

type CompanyUserRoleRow = {
  company_user_id: string;
  role_id: string;
};

/* -------------------------------------------------------------------------- */
/* Errors                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Private error class.
 *
 * DO NOT export this class from a "use server" file.
 */
class UserRoleError extends Error {
  constructor(message = "User role error") {
    super(message);
    this.name = "UserRoleError";
  }
}

/* -------------------------------------------------------------------------- */
/* Validation Helpers                                                         */
/* -------------------------------------------------------------------------- */

function requireId(
  value: string,
  fieldName: string,
): string {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    throw new UserRoleError(
      `${fieldName} is required.`,
    );
  }

  return value.trim();
}

/* -------------------------------------------------------------------------- */
/* Authorization Helpers                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Returns the authenticated user's tenant context.
 *
 * CompanyAdmin:
 *   Must have a companyId.
 *
 * SuperAdmin:
 *   May operate without a companyId.
 */
async function requireCompanyContext() {
  const context = await requireUserTenantContext();

  if (!context) {
    throw new AuthorizationError();
  }

  if (
    context.role !== "SuperAdmin" &&
    !context.companyId
  ) {
    throw new AuthorizationError(
      "This action requires a company context.",
    );
  }

  return context;
}

/**
 * Verify that a company user exists and that the current user
 * is allowed to access it.
 */
async function requireAccessibleCompanyUser(
  companyUserId: string,
) {
  const userId = requireId(
    companyUserId,
    "companyUserId",
  );

  const context =
    await requireCompanyContext();

  const supabase =
    await createSupabaseServerClient();

  const {
    data,
    error,
  } = await supabase
    .from("company_users")
    .select(
      "id, auth_user_id, company_id, status",
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error(
      "requireAccessibleCompanyUser error:",
      error,
    );

    throw new UserRoleError(
      "Failed to fetch company user.",
    );
  }

  if (!data) {
    throw new UserRoleError(
      "Company user not found.",
    );
  }

  const companyUser =
    data as CompanyUserRow;

  /**
   * Tenant isolation.
   *
   * This check must happen BEFORE any role operation.
   */
  if (
    context.role !== "SuperAdmin" &&
    companyUser.company_id !==
      context.companyId
  ) {
    throw new AuthorizationError(
      "Company user does not belong to your company.",
    );
  }

  return {
    context,
    companyUser,
    supabase,
  };
}

/**
 * Verify that a role exists and belongs to the
 * correct tenant.
 */
async function requireAccessibleRole(
  roleId: string,
  context: Awaited<
    ReturnType<typeof requireCompanyContext>
  >,
) {
  const id = requireId(
    roleId,
    "roleId",
  );

  const supabase =
    await createSupabaseServerClient();

  const {
    data,
    error,
  } = await supabase
    .from("roles")
    .select(
      "id, company_id, name, description, status",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(
      "requireAccessibleRole error:",
      error,
    );

    throw new UserRoleError(
      "Failed to fetch role.",
    );
  }

  if (!data) {
    throw new UserRoleError(
      "Role not found.",
    );
  }

  const role = data as RoleRow;

  /**
   * CompanyAdmin can only use roles from their company.
   */
  if (
    context.role !== "SuperAdmin" &&
    role.company_id !== context.companyId
  ) {
    throw new AuthorizationError(
      "Role does not belong to your company.",
    );
  }

  return {
    role,
    supabase,
  };
}

/* -------------------------------------------------------------------------- */
/* Assign Role                                                                */
/* -------------------------------------------------------------------------- */

export async function assignRoleToCompanyUser(
  companyUserId: string,
  roleId: string,
): Promise<boolean> {
  const userId = requireId(
    companyUserId,
    "companyUserId",
  );

  const selectedRoleId = requireId(
    roleId,
    "roleId",
  );

  /**
   * First verify the user.
   *
   * This prevents CompanyAdmin A from assigning roles to
   * Company B users.
   */
  const {
    context,
    companyUser,
    supabase,
  } =
    await requireAccessibleCompanyUser(
      userId,
    );

  if (
    companyUser.status !== "active"
  ) {
    throw new UserRoleError(
      "Company user is not active.",
    );
  }

  /**
   * Then verify the role.
   */
  const {
    role,
  } = await requireAccessibleRole(
    selectedRoleId,
    context,
  );

  if (role.status !== "active") {
    throw new UserRoleError(
      "Role is not active.",
    );
  }

  /**
   * Extra protection:
   *
   * Even for SuperAdmin, a role must belong to the
   * same company as the user being assigned to it.
   *
   * Otherwise a SuperAdmin could accidentally assign
   * Company A's role to Company B's user.
   */
  if (
    role.company_id !==
    companyUser.company_id
  ) {
    throw new AuthorizationError(
      "The role and company user must belong to the same company.",
    );
  }

  /**
   * Check whether the role is already assigned.
   *
   * This gives us explicit idempotent behavior instead of
   * depending on a database unique constraint error.
   */
  const {
    data: existingAssignment,
    error: existingError,
  } = await supabase
    .from("company_user_roles")
    .select(
      "company_user_id, role_id",
    )
    .eq(
      "company_user_id",
      userId,
    )
    .eq(
      "role_id",
      selectedRoleId,
    )
    .maybeSingle();

  if (existingError) {
    console.error(
      "assignRoleToCompanyUser existing assignment error:",
      existingError,
    );

    throw new UserRoleError(
      "Failed to check existing role assignment.",
    );
  }

  /**
   * Already assigned = success.
   *
   * This makes the operation idempotent.
   */
  if (existingAssignment) {
    return true;
  }

  const {
    error: insertError,
  } = await supabase
    .from("company_user_roles")
    .insert({
      company_user_id: userId,
      role_id: selectedRoleId,
    });

  if (insertError) {
    console.error(
      "assignRoleToCompanyUser insert error:",
      insertError,
    );

    throw new UserRoleError(
      "Failed to assign role to user.",
    );
  }

  return true;
}

/* -------------------------------------------------------------------------- */
/* Remove Role                                                                */
/* -------------------------------------------------------------------------- */

export async function removeRoleFromCompanyUser(
  companyUserId: string,
  roleId: string,
): Promise<boolean> {
  const userId = requireId(
    companyUserId,
    "companyUserId",
  );

  const selectedRoleId = requireId(
    roleId,
    "roleId",
  );

  /**
   * Verify the user and tenant first.
   */
  const {
    context,
    companyUser,
    supabase,
  } =
    await requireAccessibleCompanyUser(
      userId,
    );

  /**
   * Verify the role and tenant.
   */
  const {
    role,
  } = await requireAccessibleRole(
    selectedRoleId,
    context,
  );

  /**
   * User and role must belong to the same company.
   */
  if (
    role.company_id !==
    companyUser.company_id
  ) {
    throw new AuthorizationError(
      "The role and company user must belong to the same company.",
    );
  }

  const {
    error: deleteError,
  } = await supabase
    .from("company_user_roles")
    .delete()
    .eq(
      "company_user_id",
      userId,
    )
    .eq(
      "role_id",
      selectedRoleId,
    );

  if (deleteError) {
    console.error(
      "removeRoleFromCompanyUser delete error:",
      deleteError,
    );

    throw new UserRoleError(
      "Failed to remove role from user.",
    );
  }

  return true;
}

/* -------------------------------------------------------------------------- */
/* Get User Roles                                                             */
/* -------------------------------------------------------------------------- */

export async function getUserRoles(
  companyUserId: string,
): Promise<RoleRow[]> {
  const userId = requireId(
    companyUserId,
    "companyUserId",
  );

  /**
   * CRITICAL:
   *
   * We verify the company user BEFORE fetching the roles.
   *
   * This prevents:
   *
   * CompanyAdmin A
   *   ↓
   * requests Company B user ID
   *   ↓
   * receives Company B roles
   */
  const {
    context,
    companyUser,
  } =
    await requireAccessibleCompanyUser(
      userId,
    );

  const supabase =
    await createSupabaseServerClient();

  const {
    data,
    error,
  } = await supabase
    .from("company_user_roles")
    .select(`
      company_user_id,
      role:roles(
        id,
        company_id,
        name,
        description,
        status
      )
    `)
    .eq(
      "company_user_id",
      companyUser.id,
    );

  if (error) {
    console.error(
      "getUserRoles error:",
      error,
    );

    throw new UserRoleError(
      "Failed to fetch user roles.",
    );
  }

  /**
   * Supabase nested relationship types can vary depending
   * on generated database types, so normalize the result.
   */
  const rows = (data ?? []) as Array<{
    company_user_id: string;
    role:
      | RoleRow
      | RoleRow[]
      | null;
  }>;

  const roles: RoleRow[] = [];

  for (const row of rows) {
    if (!row.role) {
      continue;
    }

    if (Array.isArray(row.role)) {
      roles.push(...row.role);
    } else {
      roles.push(row.role);
    }
  }

  /**
   * Defensive tenant validation.
   */
  if (
    context.role !== "SuperAdmin"
  ) {
    return roles.filter(
      (role) =>
        role.company_id ===
        companyUser.company_id,
    );
  }

  return roles;
}

/* -------------------------------------------------------------------------- */
/* Get Available Roles                                                        */
/* -------------------------------------------------------------------------- */

export async function getAvailableRoles(
  companyId?: string,
): Promise<RoleRow[]> {
  const context =
    await requireCompanyContext();

  const supabase =
    await createSupabaseServerClient();

  let targetCompanyId: string;

  if (
    context.role === "SuperAdmin"
  ) {
    /**
     * SuperAdmin may explicitly select a company.
     */
    if (
      typeof companyId !== "string" ||
      !companyId.trim()
    ) {
      throw new UserRoleError(
        "companyId is required for SuperAdmin.",
      );
    }

    targetCompanyId =
      companyId.trim();
  } else {
    /**
     * CompanyAdmin MUST use their own company.
     *
     * Never trust a companyId supplied by the browser.
     */
    targetCompanyId =
      context.companyId!;
  }

  const {
    data,
    error,
  } = await supabase
    .from("roles")
    .select(
      "id, company_id, name, description, status",
    )
    .eq(
      "company_id",
      targetCompanyId,
    )
    .eq(
      "status",
      "active",
    )
    .order("name", {
      ascending: true,
    });

  if (error) {
    console.error(
      "getAvailableRoles error:",
      error,
    );

    throw new UserRoleError(
      "Failed to fetch available roles.",
    );
  }

  return (data ?? []) as RoleRow[];
}