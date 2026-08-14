import {
  AuthorizationError,
} from "./auth";

import type {
  SystemRole,
  UserTenantContext,
} from "@/lib/types";

/* -------------------------------------------------------------------------- */
/* Role Checks                                                                */
/* -------------------------------------------------------------------------- */

export function isSuperAdmin(
  context: UserTenantContext
): boolean {
  return context.role === "SuperAdmin";
}

export function isCompanyAdmin(
  context: UserTenantContext
): boolean {
  return context.role === "CompanyAdmin";
}

export function isCompanyUser(
  context: UserTenantContext
): boolean {
  return context.role === "User";
}

/* -------------------------------------------------------------------------- */
/* Require Role                                                               */
/* -------------------------------------------------------------------------- */

export function requireRole(
  context: UserTenantContext,
  allowedRoles: SystemRole[]
): void {
  if (!allowedRoles.includes(context.role)) {
    throw new AuthorizationError(
      "You do not have permission to perform this action."
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Require Super Admin                                                       */
/* -------------------------------------------------------------------------- */

export function requireSuperAdmin(
  context: UserTenantContext
): void {
  if (!isSuperAdmin(context)) {
    throw new AuthorizationError(
      "Only Super Admin can perform this action."
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Require Company Admin                                                      */
/* -------------------------------------------------------------------------- */

export function requireCompanyAdmin(
  context: UserTenantContext
): void {
  if (!isCompanyAdmin(context)) {
    throw new AuthorizationError(
      "Only Company Admin can perform this action."
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Require Company Context                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Ensures that the authenticated user belongs to a company.
 *
 * SuperAdmin intentionally fails this check because
 * SuperAdmin is a system-level user.
 */
export function requireCompanyContext(
  context: UserTenantContext
): string {
  if (!context.companyId) {
    throw new AuthorizationError(
      "This action requires a company context."
    );
  }

  return context.companyId;
}

/* -------------------------------------------------------------------------- */
/* Require Same Company                                                       */
/* -------------------------------------------------------------------------- */

/**
 * SuperAdmin can access any company.
 *
 * CompanyAdmin/User can only access their own company.
 */
export function requireCompanyAccess(
  context: UserTenantContext,
  companyId: string
): void {
  if (!companyId?.trim()) {
    throw new AuthorizationError(
      "Company ID is required."
    );
  }

  /* SuperAdmin has global access. */
  if (context.role === "SuperAdmin") {
    return;
  }

  /* Company users must have a tenant. */
  if (!context.companyId) {
    throw new AuthorizationError(
      "You are not associated with a company."
    );
  }

  /* Prevent cross-tenant access. */
  if (context.companyId !== companyId) {
    throw new AuthorizationError(
      "You do not have access to this company."
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Require Company Admin Access                                               */
/* -------------------------------------------------------------------------- */

/**
 * SuperAdmin can administer any company.
 *
 * CompanyAdmin can administer only their own company.
 *
 * Regular User cannot administer companies.
 */
export function requireCompanyManagementAccess(
  context: UserTenantContext,
  companyId: string
): void {
  if (context.role === "SuperAdmin") {
    return;
  }

  if (context.role !== "CompanyAdmin") {
    throw new AuthorizationError(
      "Only Super Admin or Company Admin can manage a company."
    );
  }

  requireCompanyAccess(
    context,
    companyId
  );
}