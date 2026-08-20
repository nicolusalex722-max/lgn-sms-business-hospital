import { createSupabaseServerClient } from "@/lib/db/server";

import type {
  AuthenticatedUser,
  UserTenantContext,
} from "@/lib/types";

/* -------------------------------------------------------------------------- */
/* Database Types                                                             */
/* -------------------------------------------------------------------------- */

type CompanyAdminAuthRow = {
  auth_user_id: string;
  company_id: string;
  status: "active" | "inactive" | "suspended";
};

type CompanyUserAuthRow = {
  auth_user_id: string;
  company_id: string;
  status: CompanyUserStatusDb;
};

type CompanyUserStatusDb =
  | "active"
  | "inactive"
  | "suspended";

/* -------------------------------------------------------------------------- */
/* Auth Error                                                                 */
/* -------------------------------------------------------------------------- */

export class AuthenticationError extends Error {
  constructor(message = "Authentication required.") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor(
    message = "You are not authorized to perform this action.",
  ) {
    super(message);
    this.name = "AuthorizationError";
  }
}

/* -------------------------------------------------------------------------- */
/* Get Current User                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Returns the currently authenticated application user.
 *
 * Authentication flow:
 *
 * 1. Read authenticated Supabase user.
 * 2. Check server-controlled app_metadata for SuperAdmin.
 * 3. Resolve CompanyAdmin from company_admins.
 * 4. Resolve CompanyUser from company_users.
 *
 * Important:
 * - Uses the authenticated Supabase session.
 * - Does NOT use service-role credentials.
 * - SuperAdmin does not belong to a single company.
 * - CompanyAdmin and CompanyUser must have a valid company_id.
 */
export async function getCurrentUser(): Promise<
  AuthenticatedUser | null
> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error(
      "getCurrentUser: Supabase auth error:",
      error,
    );

    return null;
  }

  if (!user) {
    return null;
  }

  /* ---------------------------------------------------------------------- */
  /* SuperAdmin                                                             */
  /* ---------------------------------------------------------------------- */

  const metadataRole = user.app_metadata?.role;

  if (metadataRole === "SuperAdmin") {
    return {
      id: user.id,
      email: user.email ?? "",
      role: "SuperAdmin",
      companyId: null,
    };
  }

  /* ---------------------------------------------------------------------- */
  /* Company Admin                                                          */
  /* ---------------------------------------------------------------------- */

  const {
    data: companyAdmin,
    error: companyAdminError,
  } = await supabase
    .from("company_admins")
    .select(
      `
        auth_user_id,
        company_id,
        status
      `,
    )
    .eq("auth_user_id", user.id)
    .maybeSingle<CompanyAdminAuthRow>();

  if (companyAdminError) {
    console.error(
      "getCurrentUser: company_admins lookup failed:",
      companyAdminError,
    );
  }

  if (
    companyAdmin &&
    companyAdmin.status === "active" &&
    companyAdmin.company_id
  ) {
    return {
      id: user.id,
      email: user.email ?? "",
      role: "CompanyAdmin",
      companyId: companyAdmin.company_id,
    };
  }

  /* ---------------------------------------------------------------------- */
  /* Company User                                                           */
  /* ---------------------------------------------------------------------- */

  const {
    data: companyUser,
    error: companyUserError,
  } = await supabase
    .from("company_users")
    .select(
      `
        auth_user_id,
        company_id,
        status
      `,
    )
    .eq("auth_user_id", user.id)
    .maybeSingle<CompanyUserAuthRow>();

  if (companyUserError) {
    console.error(
      "getCurrentUser: company_users lookup failed:",
      companyUserError,
    );
  }

  if (
    companyUser &&
    companyUser.status === "active" &&
    companyUser.company_id
  ) {
    return {
      id: user.id,
      email: user.email ?? "",
      role: "User",
      companyId: companyUser.company_id,
    };
  }

  /* ---------------------------------------------------------------------- */
  /* No Application Identity                                                */
  /* ---------------------------------------------------------------------- */

  /**
   * The Supabase user exists, but there is no active
   * application-level identity associated with the user.
   */
  return null;
}

/* -------------------------------------------------------------------------- */
/* Require Current User                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Returns the currently authenticated application user.
 *
 * Throws AuthenticationError when the user is not authenticated
 * or has no active application identity.
 */
export async function requireCurrentUser(): Promise<
  AuthenticatedUser
> {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthenticationError();
  }

  return user;
}

/* -------------------------------------------------------------------------- */
/* Get Tenant Context                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Returns the company tenant context for company-scoped users.
 *
 * Important:
 *
 * SuperAdmin has companyId === null because a SuperAdmin
 * is not tied to one company.
 *
 * Therefore SuperAdmin does NOT receive a UserTenantContext.
 *
 * CompanyAdmin and CompanyUser must have a real companyId.
 */
export async function getUserTenantContext(): Promise<
  UserTenantContext | null
> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  /**
   * SuperAdmin is a system-level user.
   *
   * They are intentionally excluded from a company tenant
   * context because there is no single companyId to attach.
   */
  if (user.role === "SuperAdmin") {
    return null;
  }

  /**
   * Defensive check.
   *
   * UserTenantContext requires:
   *
   * companyId: string
   *
   * so never create the context when companyId is null.
   */
  if (!user.companyId) {
    return null;
  }

  return {
    userId: user.id,
    role: user.role,
    companyId: user.companyId,
  };
}

/* -------------------------------------------------------------------------- */
/* Require Tenant Context                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Returns a valid company tenant context.
 *
 * Throws when:
 *
 * - the user is not authenticated
 * - the user is a SuperAdmin without a selected company
 * - the company association is missing
 */
export async function requireUserTenantContext(): Promise<
  UserTenantContext
> {
  const context =
    await getUserTenantContext();

  if (!context) {
    throw new AuthorizationError(
      "You are not associated with this company.",
    );
  }

  return context;
}