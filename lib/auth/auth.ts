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
  constructor(message = "You are not authorized to perform this action.") {
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
 * Important:
 * - Uses the authenticated Supabase session.
 * - Does NOT use service-role credentials.
 * - SuperAdmin is identified from server-controlled app_metadata.
 * - Company tenant information is resolved from database records.
 */
export async function getCurrentUser(): Promise<
  AuthenticatedUser | null
> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  console.log("========== AUTH DEBUG ==========");
  console.log("Auth error:", error);
  console.log("Auth user exists:", !!user);
  console.log("Auth user id:", user?.id);
  console.log("Auth user email:", user?.email);
  console.log("App metadata:", user?.app_metadata);
  console.log("User metadata:", user?.user_metadata);
  console.log("================================");

  if (error || !user) {
    return null;
  }

  /* ---------------------------------------------------------------------- */
  /* Super Admin                                                            */
  /* ---------------------------------------------------------------------- */

  const metadataRole =
    user.app_metadata?.role;

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

  const { data: companyAdmin } =
    await supabase
      .from("company_admins")
      .select(
        `
          auth_user_id,
          company_id,
          status
        `
      )
      .eq("auth_user_id", user.id)
      .maybeSingle<CompanyAdminAuthRow>();

  if (
    companyAdmin &&
    companyAdmin.status === "active"
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

  const { data: companyUser } =
    await supabase
      .from("company_users")
      .select(
        `
          auth_user_id,
          company_id,
          status
        `
      )
      .eq("auth_user_id", user.id)
      .maybeSingle<CompanyUserAuthRow>();

  if (
    companyUser &&
    companyUser.status === "active"
  ) {
    return {
      id: user.id,
      email: user.email ?? "",
      // Keep SystemRole as 'User' for compatibility. Note: we no longer
      // read a `role` column from company_users — the RBAC is database-driven
      // via company_user_roles -> roles -> role_permissions -> permissions.
      role: "User",
      companyId: companyUser.company_id,
    };
  }

  /*
   * Authenticated Supabase user exists,
   * but there is no active application identity.
   */
  return null;
}

/* -------------------------------------------------------------------------- */
/* Require Current User                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Same as getCurrentUser(), but throws when unauthenticated.
 *
 * Use this inside protected server actions/pages.
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
 * Returns the minimum information required for authorization.
 */
export async function getUserTenantContext(): Promise<
  UserTenantContext | null
> {
  const user = await getCurrentUser();

  if (!user) {
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

export async function requireUserTenantContext(): Promise<
  UserTenantContext
> {
  const context =
    await getUserTenantContext();

  if (!context) {
    throw new AuthenticationError();
  }

  return context;
}
