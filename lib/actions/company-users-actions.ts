"use server";

import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/db/server";

import {
  requireCurrentUser,
  requireUserTenantContext,
} from "@/lib/auth";

import {
  isCompanyAdmin,
  isSuperAdmin,
  requireCompanyAccess,
  requireCompanyManagementAccess,
} from "@/lib/auth/authorization";

import type { AuthenticatedUser } from "@/lib/types";

import {
  companyUserCreateSchema,
  companyUserUpdateSchema,
  type CompanyUserCreateInput,
  type CompanyUserUpdateInput,
} from "@/lib/validations/company-users-schema";

import type {
  CompanyUser,
  CompanyUserRole,
  CompanyUserStatus,
  UserTenantContext,
} from "@/lib/types";

/* -------------------------------------------------------------------------- */
/* Database Types                                                             */
/* -------------------------------------------------------------------------- */

type CompanyUserDbStatus =
  | "active"
  | "inactive"
  | "suspended";

type RoleRow = {
  id: string;
  company_id: string;
  name: string;
  status: "active" | "inactive";
};

type CompanyUserRoleRow = {
  company_user_id: string;
  role_id: string;
  role: RoleRow | null;
};

type EmployeeRow = {
  id: string;

  first_name: string;
  middle_name: string | null;
  last_name: string;

  email: string | null;
  phone: string | null;

  department_id: string | null;
  branch_id: string | null;

  position: string | null;
};

type CompanyUserRow = {
  id: string;

  auth_user_id: string;

  company_id: string;

  username: string;

  email: string;

  status: CompanyUserDbStatus;

  created_by: string | null;

  created_at: string;

  updated_at: string;

  employee_id: string | null;

  display_name: string | null;

  phone: string | null;

  employee: EmployeeRow | null;
};

/* -------------------------------------------------------------------------- */
/* Action Result                                                              */
/* -------------------------------------------------------------------------- */

export type CompanyUserActionResult<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
};

/* -------------------------------------------------------------------------- */
/* Shared Select                                                              */
/* -------------------------------------------------------------------------- */

const COMPANY_USER_SELECT = `
  id,
  auth_user_id,
  company_id,
  username,
  email,
  status,
  created_by,
  created_at,
  updated_at,
  employee_id,
  display_name,
  phone,

  employee:employees (
    id,
    first_name,
    middle_name,
    last_name,
    email,
    phone,
    department_id,
    branch_id,
    position
  )
`;

/* -------------------------------------------------------------------------- */
/* Authorization                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Returns the authenticated application user with a valid
 * company tenant context.
 *
 * This function is intended for company-scoped operations.
 * It guarantees that companyId exists before returning.
 *
 * For SuperAdmin operations, use requireCurrentUser() directly
 * and handle SuperAdmin explicitly.
 */
async function getAuthorizationContext(): Promise<UserTenantContext> {
  return requireUserTenantContext();
}

/**
 * Returns the current user and whether they are a SuperAdmin.
 *
 * This is used for operations that need to support both
 * SuperAdmin (system-level) and CompanyAdmin (company-level).
 */
async function getCurrentUserWithRole(): Promise<{
  user: AuthenticatedUser;
  isSuperAdmin: boolean;
}> {
  const user = await requireCurrentUser();

  return {
    user,
    isSuperAdmin: user.role === "SuperAdmin",
  };
}

/**
 * Ensures that the current user can manage company users.
 *
 * Allowed:
 *
 * - SuperAdmin
 * - CompanyAdmin
 *
 * Denied:
 *
 * - User
 */
function requireCompanyUserManagement(
  context: UserTenantContext,
): void {
  if (
    !isSuperAdmin(context) &&
    !isCompanyAdmin(context)
  ) {
    throw new Error(
      "You are not authorized to manage company users.",
    );
  }
}

/**
 * Ensures that a company ID can be accessed by the
 * current user.
 *
 * SuperAdmin:
 *   Can access any company.
 *
 * CompanyAdmin:
 *   Can access only their own company.
 */
function requireCompanyUserCompanyAccess(
  context: UserTenantContext,
  companyId: string,
): void {
  requireCompanyAccess(
    context,
    companyId,
  );
}

/**
 * Ensures that a company ID can be managed by the
 * current user.
 *
 * SuperAdmin:
 *   Can manage any company.
 *
 * CompanyAdmin:
 *   Can manage only their own company.
 */
function requireCompanyUserCompanyManagement(
  context: UserTenantContext,
  companyId: string,
): void {
  requireCompanyManagementAccess(
    context,
    companyId,
  );
}

/* -------------------------------------------------------------------------- */
/* Status Helpers                                                             */
/* -------------------------------------------------------------------------- */

function mapCompanyUserStatus(
  status: CompanyUserDbStatus,
): CompanyUserStatus {
  switch (status) {
    case "active":
      return "Active";

    case "inactive":
      return "Inactive";

    case "suspended":
      return "Suspended";
  }
}

function mapStatusToDb(
  status: CompanyUserStatus,
): CompanyUserDbStatus {
  switch (status) {
    case "Active":
      return "active";

    case "Inactive":
      return "inactive";

    case "Suspended":
      return "suspended";
  }
}

/* -------------------------------------------------------------------------- */
/* Role Helpers                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Maps the database role name to the application role.
 *
 * Company users currently support only:
 *
 * User
 */
function mapCompanyUserRole(
  roleName: string | null | undefined,
): CompanyUserRole {
  if (
    roleName?.trim().toLowerCase() ===
    "user"
  ) {
    return "User";
  }

  /*
   * Company users currently have only one
   * supported application role.
   */
  return "User";
}

/* -------------------------------------------------------------------------- */
/* Username Helpers                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Creates the base username.
 *
 * Example:
 *
 * John Michael Doe
 *
 * becomes:
 *
 * john.michael.doe
 */
function generateBaseUsername(
  displayName: string,
): string {
  const normalized =
    displayName
      .trim()
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        ".",
      )
      .replace(
        /^\.+|\.+$/g,
        "",
      );

  return (
    normalized ||
    `user.${Date.now()}`
  );
}

/**
 * Generates a username that does not already exist
 * inside the company.
 */
async function generateUniqueUsername(
  supabase: Awaited<
    ReturnType<
      typeof createSupabaseServerClient
    >
  >,
  companyId: string,
  displayName: string,
): Promise<string> {
  const base =
    generateBaseUsername(
      displayName,
    );

  let username = base;
  let counter = 1;

  while (true) {
    const {
      data,
      error,
    } = await supabase
      .from("company_users")
      .select("id")
      .eq(
        "company_id",
        companyId,
      )
      .eq(
        "username",
        username,
      )
      .maybeSingle();

    if (error) {
      console.error(
        "generateUniqueUsername error:",
        error,
      );

      throw new Error(
        "Failed to verify username availability.",
      );
    }

    if (!data) {
      return username;
    }

    counter += 1;

    username =
      `${base}.${counter}`;
  }
}

/* -------------------------------------------------------------------------- */
/* Role Queries                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Gets the role assigned to one company user.
 *
 * Database relationship:
 *
 * company_users
 *       ↓
 * company_user_roles
 *       ↓
 * roles
 */
async function getCompanyUserRole(
  supabase: Awaited<
    ReturnType<
      typeof createSupabaseServerClient
    >
  >,
  companyUserId: string,
): Promise<CompanyUserRole> {
  const {
    data,
    error,
  } = await supabase
    .from("company_user_roles")
    .select(
      `
        company_user_id,
        role_id,
        role:roles (
          id,
          name
        )
      `,
    )
    .eq(
      "company_user_id",
      companyUserId,
    )
    .maybeSingle();

  if (error) {
    console.error(
      "getCompanyUserRole error:",
      error,
    );

    throw new Error(
      "Failed to determine company user role.",
    );
  }

  if (!data) {
    /*
     * Existing records without a role assignment
     * temporarily resolve to the application's
     * current company-user role.
     */
    return "User";
  }

  const role =
    data.role as unknown as RoleRow | null;

  return mapCompanyUserRole(
    role?.name,
  );
}

/**
 * Gets roles for multiple company users.
 *
 * This avoids an N+1 query problem.
 */
async function getCompanyUserRoles(
  supabase: Awaited<
    ReturnType<
      typeof createSupabaseServerClient
    >
  >,
  companyUserIds: string[],
): Promise<
  Map<string, CompanyUserRole>
> {
  const roleMap =
    new Map<
      string,
      CompanyUserRole
    >();

  if (
    companyUserIds.length === 0
  ) {
    return roleMap;
  }

  const {
    data,
    error,
  } = await supabase
    .from("company_user_roles")
    .select(
      `
        company_user_id,
        role_id,
        role:roles (
          id,
          name
        )
      `,
    )
    .in(
      "company_user_id",
      companyUserIds,
    );

  if (error) {
    console.error(
      "getCompanyUserRoles error:",
      error,
    );

    throw new Error(
      "Failed to load company user roles.",
    );
  }

  for (const row of data ?? []) {
    const role =
      row.role as unknown as RoleRow | null;

    roleMap.set(
      row.company_user_id,
      mapCompanyUserRole(
        role?.name,
      ),
    );
  }

  /*
   * Backward compatibility for existing
   * company users without a role assignment.
   */
  for (const companyUserId of companyUserIds) {
    if (
      !roleMap.has(
        companyUserId,
      )
    ) {
      roleMap.set(
        companyUserId,
        "User",
      );
    }
  }

  return roleMap;
}

/* -------------------------------------------------------------------------- */
/* Employee Helpers                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Finds an employee belonging to a specific company.
 *
 * The company ID is always included in the query.
 */
async function getEmployeeForCompany(
  supabase: Awaited<
    ReturnType<
      typeof createSupabaseServerClient
    >
  >,
  employeeId: string,
  companyId: string,
) {
  const {
    data,
    error,
  } = await supabase
    .from("employees")
    .select(
      `
        id,
        company_id,
        first_name,
        middle_name,
        last_name,
        email,
        phone,
        status
      `,
    )
    .eq(
      "id",
      employeeId,
    )
    .eq(
      "company_id",
      companyId,
    )
    .maybeSingle();

  if (error) {
    console.error(
      "getEmployeeForCompany error:",
      error,
    );

    throw new Error(
      "Failed to verify employee.",
    );
  }

  return data;
}

/* -------------------------------------------------------------------------- */
/* Company Admin Helper                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Gets the company_admins record for the current
 * authenticated CompanyAdmin.
 *
 * This value is used only for created_by.
 */
async function getCompanyAdminId(
  supabase: Awaited<
    ReturnType<
      typeof createSupabaseServerClient
    >
  >,
  authUserId: string,
  companyId: string,
): Promise<string | null> {
  const {
    data,
    error,
  } = await supabase
    .from("company_admins")
    .select(
      "id",
    )
    .eq(
      "auth_user_id",
      authUserId,
    )
    .eq(
      "company_id",
      companyId,
    )
    .maybeSingle();

  if (error) {
    console.error(
      "getCompanyAdminId error:",
      error,
    );

    return null;
  }

  return data?.id ?? null;
}

/* -------------------------------------------------------------------------- */
/* Mapping                                                                   */
/* -------------------------------------------------------------------------- */

function mapCompanyUser(
  row: CompanyUserRow,
  role: CompanyUserRole,
): CompanyUser {
  return {
    id: row.id,
    authUserId: row.auth_user_id,
    companyId: row.company_id,

    username: row.username,
    email: row.email,

    role,

    status: mapCompanyUserStatus(row.status),

    createdBy: row.created_by,

    createdAt: row.created_at,
    updatedAt: row.updated_at,

    employeeId: row.employee_id,

    displayName: row.display_name,

    phone: row.phone,

    employee: row.employee
      ? {
          id: row.employee.id,

          firstName: row.employee.first_name,
          middleName: row.employee.middle_name,
          lastName: row.employee.last_name,

          email: row.employee.email,
          phone: row.employee.phone,

          departmentId: row.employee.department_id,
          branchId: row.employee.branch_id,

          position: row.employee.position,
        }
      : null,
  };
}

/* -------------------------------------------------------------------------- */
/* GET ALL COMPANY USERS                                                      */
/* -------------------------------------------------------------------------- */

export async function getCompanyUsers(): Promise<
  CompanyUserActionResult<CompanyUser[]>
> {
  try {
    const { user, isSuperAdmin } =
      await getCurrentUserWithRole();

    if (!isSuperAdmin) {
      const context =
        await getAuthorizationContext();

      requireCompanyUserManagement(
        context,
      );
    }

    const supabase =
      await createSupabaseServerClient();

    let query =
      supabase
        .from("company_users")
        .select(
          COMPANY_USER_SELECT,
        )
        .order(
          "created_at",
          {
            ascending: false,
          },
        );

    /*
     * SuperAdmin:
     *
     * Can see users from all companies.
     *
     * CompanyAdmin:
     *
     * Can see users only from their company.
     */
    if (!isSuperAdmin) {
      const context =
        await getAuthorizationContext();

      query =
        query.eq(
          "company_id",
          context.companyId,
        );
    }

    const {
      data,
      error,
    } = await query;

    if (error) {
      console.error(
        "getCompanyUsers error:",
        error,
      );

      return {
        success: false,
        error:
          "Failed to fetch company users.",
      };
    }

    const rows =
      (data ??
        []) as unknown as CompanyUserRow[];

    const roleMap =
      await getCompanyUserRoles(
        supabase,
        rows.map(
          (row) => row.id,
        ),
      );

    return {
      success: true,
      data: rows.map(
        (row) =>
          mapCompanyUser(
            row,
            roleMap.get(
              row.id,
            ) ?? "User",
          ),
      ),
    };
  } catch (error) {
    console.error(
      "getCompanyUsers unexpected error:",
      error,
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong while fetching company users.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* GET COMPANY USER BY ID                                                     */
/* -------------------------------------------------------------------------- */

export async function getCompanyUserById(
  id: string,
): Promise<
  CompanyUserActionResult<CompanyUser>
> {
  try {
    if (!id?.trim()) {
      return {
        success: false,
        error:
          "Company user ID is required.",
      };
    }

    const { user, isSuperAdmin } =
      await getCurrentUserWithRole();

    if (!isSuperAdmin) {
      const context =
        await getAuthorizationContext();

      requireCompanyUserManagement(
        context,
      );
    }

    const supabase =
      await createSupabaseServerClient();

    const {
      data,
      error,
    } = await supabase
      .from("company_users")
      .select(
        COMPANY_USER_SELECT,
      )
      .eq(
        "id",
        id,
      )
      .maybeSingle();

    if (error) {
      console.error(
        "getCompanyUserById error:",
        error,
      );

      return {
        success: false,
        error:
          "Failed to fetch company user.",
      };
    }

    if (!data) {
      return {
        success: false,
        error:
          "Company user not found.",
      };
    }

    /*
     * Authorization is performed AFTER retrieving
     * the target company's ID.
     *
     * This is important for SuperAdmin/CompanyAdmin
     * tenant isolation.
     */
    if (!isSuperAdmin) {
      const context =
        await getAuthorizationContext();

      requireCompanyUserCompanyAccess(
        context,
        data.company_id,
      );
    }

    const role =
      await getCompanyUserRole(
        supabase,
        data.id,
      );

    return {
      success: true,
      data: mapCompanyUser(
        data as unknown as CompanyUserRow,
        role,
      ),
    };
  } catch (error) {
    console.error(
      "getCompanyUserById unexpected error:",
      error,
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong while fetching the company user.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* CREATE COMPANY USER                                                        */
/* -------------------------------------------------------------------------- */

export async function createCompanyUser(
  input: CompanyUserCreateInput,
): Promise<
  CompanyUserActionResult<CompanyUser>
> {
  let createdAuthUserId:
    | string
    | null = null;

  let createdCompanyUserId:
    | string
    | null = null;

  try {
    /*
     * Company user creation requires a company context.
     * SuperAdmin does not have a company context and
     * must use a different flow to create company users.
     */
    const context =
      await getAuthorizationContext();

    requireCompanyUserManagement(
      context,
    );

    const companyId =
      context.companyId;

    /*
     * Creating the user is a management operation
     * against this specific company.
     */
    requireCompanyUserCompanyManagement(
      context,
      companyId,
    );

    /* ---------------------------------------------------------------------- */
    /* Validation                                                             */
    /* ---------------------------------------------------------------------- */

    const validation =
      companyUserCreateSchema.safeParse(
        input,
      );

    if (!validation.success) {
      return {
        success: false,
        error:
          validation.error
            .issues[0]?.message ??
          "Invalid company user data.",
      };
    }

    const values =
      validation.data;

    /* ---------------------------------------------------------------------- */
    /* Clients                                                                */
    /* ---------------------------------------------------------------------- */

    const supabase =
      await createSupabaseServerClient();

    const supabaseAdmin =
      createSupabaseAdminClient();

    /* ---------------------------------------------------------------------- */
    /* Employee                                                               */
    /* ---------------------------------------------------------------------- */

    const employee =
      await getEmployeeForCompany(
        supabase,
        values.employeeId,
        companyId,
      );

    if (!employee) {
      return {
        success: false,
        error:
          "Employee was not found in your company.",
      };
    }

    if (
      employee.status !==
      "active"
    ) {
      return {
        success: false,
        error:
          "A login account can only be created for an active employee.",
      };
    }

    /* ---------------------------------------------------------------------- */
    /* Existing Employee Account                                              */
    /* ---------------------------------------------------------------------- */

    const {
      data: existingEmployeeUser,
      error:
        existingEmployeeUserError,
    } = await supabase
      .from("company_users")
      .select(
        "id",
      )
      .eq(
        "employee_id",
        values.employeeId,
      )
      .maybeSingle();

    if (
      existingEmployeeUserError
    ) {
      console.error(
        "createCompanyUser existing employee check:",
        existingEmployeeUserError,
      );

      return {
        success: false,
        error:
          "Failed to verify employee login account.",
      };
    }

    if (
      existingEmployeeUser
    ) {
      return {
        success: false,
        error:
          "This employee already has a login account.",
      };
    }

    /* ---------------------------------------------------------------------- */
    /* Existing Company Email                                                 */
    /* ---------------------------------------------------------------------- */

    const {
      data: existingEmail,
      error: existingEmailError,
    } = await supabase
      .from("company_users")
      .select(
        "id",
      )
      .eq(
        "company_id",
        companyId,
      )
      .eq(
        "email",
        values.email,
      )
      .maybeSingle();

    if (existingEmailError) {
      console.error(
        "createCompanyUser email check:",
        existingEmailError,
      );

      return {
        success: false,
        error:
          "Failed to verify email availability.",
      };
    }

    if (existingEmail) {
      return {
        success: false,
        error:
          "A user with this email already exists in the company.",
      };
    }

    /* ---------------------------------------------------------------------- */
    /* Username                                                               */
    /* ---------------------------------------------------------------------- */

    const username =
      await generateUniqueUsername(
        supabase,
        companyId,
        values.displayName,
      );

    /* ---------------------------------------------------------------------- */
    /* Role                                                                   */
    /* ---------------------------------------------------------------------- */

    /*
     * The roleId is supplied by the client and represents
     * an existing role from the company's roles table.
     *
     * We verify it exists and belongs to the same company
     * before assignment.
     */
    const selectedRoleId =
      values.roleId?.trim();

    if (!selectedRoleId) {
      return {
        success: false,
        error:
          "A role is required to create a company user.",
      };
    }

    const {
      data: roleData,
      error: roleError,
    } = await supabase
      .from("roles")
      .select(
        "id, company_id, name, status",
      )
      .eq(
        "id",
        selectedRoleId,
      )
      .eq(
        "company_id",
        companyId,
      )
      .maybeSingle<RoleRow>();

    if (roleError) {
      console.error(
        "createCompanyUser role lookup error:",
        roleError,
      );

      return {
        success: false,
        error:
          "Failed to verify the selected role.",
      };
    }

    const roleRow =
      roleData as unknown as RoleRow | null;

    if (!roleRow || roleRow.status !== "active") {
      return {
        success: false,
        error:
          "The selected role does not exist or is not active in your company.",
      };
    }

    /* ---------------------------------------------------------------------- */
    /* Auth User                                                              */
    /* ---------------------------------------------------------------------- */

    const {
      data: authData,
      error: authError,
    } =
      await supabaseAdmin.auth.admin.createUser(
        {
          email:
            values.email,

          password:
            values.password,

          email_confirm:
            true,

          /*
           * Authorization is NOT based on this
           * metadata.
           *
           * The application's source of truth is:
           *
           * company_users
           *      ↓
           * company_user_roles
           *      ↓
           * roles
           *
           * Keep only useful identity metadata.
           */
          app_metadata: {
            company_id:
              companyId,

            employee_id:
              values.employeeId,
          },
        },
      );

    if (
      authError ||
      !authData.user
    ) {
      console.error(
        "createCompanyUser auth error:",
        authError,
      );

      return {
        success: false,
        error:
          authError?.message ??
          "Failed to create user authentication account.",
      };
    }

    createdAuthUserId =
      authData.user.id;

    /* ---------------------------------------------------------------------- */
    /* Company User                                                           */
    /* ---------------------------------------------------------------------- */

    const createdBy =
      isCompanyAdmin(context)
        ? await getCompanyAdminId(
            supabase,
            context.id,
            companyId,
          )
        : null;

    const {
      data: companyUser,
      error:
        companyUserError,
    } = await supabase
      .from("company_users")
      .insert({
        auth_user_id:
          createdAuthUserId,

        company_id:
          companyId,

        username,

        email:
          values.email,

        display_name:
          values.displayName,

        phone:
          values.phone,

        status:
          "active",

        employee_id:
          values.employeeId,

        created_by:
          createdBy,
      })
      .select(
        COMPANY_USER_SELECT,
      )
      .single();

    if (
      companyUserError ||
      !companyUser
    ) {
      console.error(
        "createCompanyUser company_users error:",
        companyUserError,
      );

      await supabaseAdmin.auth.admin.deleteUser(
        createdAuthUserId,
      );

      createdAuthUserId = null;

      return {
        success: false,
        error:
          "Failed to create company user.",
      };
    }

    createdCompanyUserId =
      companyUser.id;

    /* ---------------------------------------------------------------------- */
    /* Assign Selected Role                                                    */
    /* ---------------------------------------------------------------------- */

    const {
      error: roleAssignmentError,
    } = await supabase
      .from("company_user_roles")
      .insert({
        company_user_id:
          createdCompanyUserId,

        role_id:
          selectedRoleId,
      });

    if (roleAssignmentError) {
      console.error(
        "createCompanyUser role assignment error:",
        roleAssignmentError,
      );

      await supabase
        .from("company_users")
        .delete()
        .eq(
          "id",
          createdCompanyUserId,
        );

      createdCompanyUserId =
        null;

      await supabaseAdmin.auth.admin.deleteUser(
        createdAuthUserId,
      );

      createdAuthUserId =
        null;

      return {
        success: false,
        error:
          "Failed to assign the company user role.",
      };
    }

    /* ---------------------------------------------------------------------- */
    /* Return                                                                 */
    /* ---------------------------------------------------------------------- */

    return {
      success: true,
      data: mapCompanyUser(
        companyUser as unknown as CompanyUserRow,
        "User",
      ),
    };
  } catch (error) {
    console.error(
      "createCompanyUser unexpected error:",
      error,
    );

    /*
     * Best-effort cleanup.
     */
    try {
      const supabase =
        await createSupabaseServerClient();

      const supabaseAdmin =
        createSupabaseAdminClient();

      if (
        createdCompanyUserId
      ) {
        await supabase
          .from("company_user_roles")
          .delete()
          .eq(
            "company_user_id",
            createdCompanyUserId,
          );

        await supabase
          .from("company_users")
          .delete()
          .eq(
            "id",
            createdCompanyUserId,
          );
      }

      if (
        createdAuthUserId
      ) {
        await supabaseAdmin.auth.admin.deleteUser(
          createdAuthUserId,
        );
      }
    } catch (cleanupError) {
      console.error(
        "createCompanyUser cleanup error:",
        cleanupError,
      );
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong while creating the company user.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* UPDATE COMPANY USER                                                        */
/* -------------------------------------------------------------------------- */

export async function updateCompanyUser(
  id: string,
  input: CompanyUserUpdateInput,
): Promise<
  CompanyUserActionResult<CompanyUser>
> {
  try {
    if (!id?.trim()) {
      return {
        success: false,
        error:
          "Company user ID is required.",
      };
    }

    const { user, isSuperAdmin } =
      await getCurrentUserWithRole();

    if (!isSuperAdmin) {
      const context =
        await getAuthorizationContext();

      requireCompanyUserManagement(
        context,
      );
    }

    const validation =
      companyUserUpdateSchema.safeParse(
        input,
      );

    if (!validation.success) {
      return {
        success: false,
        error:
          validation.error
            .issues[0]?.message ??
          "Invalid company user data.",
      };
    }

    const values =
      validation.data;

    const supabase =
      await createSupabaseServerClient();

    /* ---------------------------------------------------------------------- */
    /* Find Existing User                                                     */
    /* ---------------------------------------------------------------------- */

    const {
      data: existingUser,
      error: existingError,
    } = await supabase
      .from("company_users")
      .select(
        `
          id,
          auth_user_id,
          company_id,
          employee_id,
          status
        `,
      )
      .eq(
        "id",
        id,
      )
      .maybeSingle();

    if (existingError) {
      console.error(
        "updateCompanyUser existing user error:",
        existingError,
      );

      return {
        success: false,
        error:
          "Failed to find company user.",
      };
    }

    if (!existingUser) {
      return {
        success: false,
        error:
          "Company user not found.",
      };
    }

    /*
     * Tenant authorization is based on the
     * company's ID stored in the database,
     * never on a client-provided company ID.
     */
    if (!isSuperAdmin) {
      const context =
        await getAuthorizationContext();

      requireCompanyUserCompanyManagement(
        context,
        existingUser.company_id,
      );
    }

    /* ---------------------------------------------------------------------- */
    /* Duplicate Email                                                        */
    /* ---------------------------------------------------------------------- */

    const {
      data: duplicateEmail,
      error: duplicateEmailError,
    } = await supabase
      .from("company_users")
      .select(
        "id",
      )
      .eq(
        "company_id",
        existingUser.company_id,
      )
      .eq(
        "email",
        values.email,
      )
      .neq(
        "id",
        id,
      )
      .maybeSingle();

    if (duplicateEmailError) {
      console.error(
        "updateCompanyUser email check:",
        duplicateEmailError,
      );

      return {
        success: false,
        error:
          "Failed to verify email availability.",
      };
    }

    if (duplicateEmail) {
      return {
        success: false,
        error:
          "Another company user already uses this email.",
      };
    }

    /* ---------------------------------------------------------------------- */
    /* Role Update                                                            */
    /* ---------------------------------------------------------------------- */

    const newRoleId =
      values.roleId?.trim();

    if (newRoleId) {
      /*
       * Verify the new role exists and belongs
       * to the same company.
       */
      const {
        data: newRoleData,
        error: newRoleError,
      } = await supabase
        .from("roles")
        .select(
          "id, company_id, status",
        )
        .eq(
          "id",
          newRoleId,
        )
        .eq(
          "company_id",
          existingUser.company_id,
        )
        .maybeSingle<RoleRow>();

      if (newRoleError) {
        console.error(
          "updateCompanyUser role lookup error:",
          newRoleError,
        );

        return {
          success: false,
          error:
            "Failed to verify the selected role.",
        };
      }

      const newRole =
        newRoleData as unknown as RoleRow | null;

      if (!newRole || newRole.status !== "active") {
        return {
          success: false,
          error:
            "The selected role does not exist or is not active in your company.",
        };
      }

      /*
       * Check if the role assignment already exists.
       */
      const {
        data: existingAssignment,
        error: existingAssignmentError,
      } = await supabase
        .from("company_user_roles")
        .select(
          "company_user_id, role_id",
        )
        .eq(
          "company_user_id",
          id,
        )
        .eq(
          "role_id",
          newRoleId,
        )
        .maybeSingle();

      if (existingAssignmentError) {
        console.error(
          "updateCompanyUser role assignment check error:",
          existingAssignmentError,
        );

        return {
          success: false,
          error:
            "Failed to check existing role assignment.",
        };
      }

      if (!existingAssignment) {
        /*
         * Remove any existing role assignments for this user
         * and assign the new role.
         *
         * Company users currently have a single role,
         * so we remove existing assignments before adding
         * the new one.
         */
        const { error: deleteError } =
          await supabase
            .from("company_user_roles")
            .delete()
            .eq(
              "company_user_id",
              id,
            );

        if (deleteError) {
          console.error(
            "updateCompanyUser role delete error:",
            deleteError,
          );

          return {
            success: false,
            error:
              "Failed to update role assignment.",
          };
        }

        const { error: insertError } =
          await supabase
            .from("company_user_roles")
            .insert({
              company_user_id: id,
              role_id: newRoleId,
            });

        if (insertError) {
          console.error(
            "updateCompanyUser role insert error:",
            insertError,
          );

          return {
            success: false,
            error:
              "Failed to assign the new role.",
          };
        }
      }
    }

    /* ---------------------------------------------------------------------- */
    /* Update                                                                 */
    /* ---------------------------------------------------------------------- */

    const {
      data,
      error,
    } = await supabase
      .from("company_users")
      .update({
        email:
          values.email,

        phone:
          values.phone,

        display_name:
          values.displayName,

        status:
          mapStatusToDb(
            values.status,
          ),
      })
      .eq(
        "id",
        id,
      )
      .eq(
        "company_id",
        existingUser.company_id,
      )
      .select(
        COMPANY_USER_SELECT,
      )
      .maybeSingle();

    if (error) {
      console.error(
        "updateCompanyUser error:",
        error,
      );

      if (
        error.code ===
        "23505"
      ) {
        return {
          success: false,
          error:
            "Another company user already uses this email.",
        };
      }

      return {
        success: false,
        error:
          "Failed to update company user.",
      };
    }

    if (!data) {
      return {
        success: false,
        error:
          "Company user not found.",
      };
    }

    const role =
      await getCompanyUserRole(
        supabase,
        id,
      );

    return {
      success: true,
      data: mapCompanyUser(
        data as unknown as CompanyUserRow,
        role,
      ),
    };
  } catch (error) {
    console.error(
      "updateCompanyUser unexpected error:",
      error,
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong while updating the company user.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* DELETE COMPANY USER                                                        */
/* -------------------------------------------------------------------------- */

export async function deleteCompanyUser(
  id: string,
): Promise<
  CompanyUserActionResult
> {
  try {
    if (!id?.trim()) {
      return {
        success: false,
        error:
          "Company user ID is required.",
      };
    }

    const { user, isSuperAdmin } =
      await getCurrentUserWithRole();

    if (!isSuperAdmin) {
      const context =
        await getAuthorizationContext();

      requireCompanyUserManagement(
        context,
      );
    }

    const supabase =
      await createSupabaseServerClient();

    const supabaseAdmin =
      createSupabaseAdminClient();

    /* ---------------------------------------------------------------------- */
    /* Find User                                                              */
    /* ---------------------------------------------------------------------- */

    const {
      data: companyUser,
      error: companyUserError,
    } = await supabase
      .from("company_users")
      .select(
        `
          id,
          auth_user_id,
          company_id
        `,
      )
      .eq(
        "id",
        id,
      )
      .maybeSingle();

    if (companyUserError) {
      console.error(
        "deleteCompanyUser lookup error:",
        companyUserError,
      );

      return {
        success: false,
        error:
          "Failed to find company user.",
      };
    }

    if (!companyUser) {
      return {
        success: false,
        error:
          "Company user not found.",
      };
    }

    /*
     * Authorization happens using the target
     * company's database value.
     */
    if (!isSuperAdmin) {
      const context =
        await getAuthorizationContext();

      requireCompanyUserCompanyManagement(
        context,
        companyUser.company_id,
      );
    }

    /* ---------------------------------------------------------------------- */
    /* Delete Role Assignments                                                */
    /* ---------------------------------------------------------------------- */

    const {
      error: roleDeleteError,
    } = await supabase
      .from("company_user_roles")
      .delete()
      .eq(
        "company_user_id",
        id,
      );

    if (roleDeleteError) {
      console.error(
        "deleteCompanyUser role error:",
        roleDeleteError,
      );

      return {
        success: false,
        error:
          "Failed to remove company user roles.",
      };
    }

    /* ---------------------------------------------------------------------- */
    /* Delete Company User                                                    */
    /* ---------------------------------------------------------------------- */

    const {
      error: deleteError,
    } = await supabase
      .from("company_users")
      .delete()
      .eq(
        "id",
        id,
      )
      .eq(
        "company_id",
        companyUser.company_id,
      );

    if (deleteError) {
      console.error(
        "deleteCompanyUser database error:",
        deleteError,
      );

      return {
        success: false,
        error:
          "Failed to delete company user.",
      };
    }

    /* ---------------------------------------------------------------------- */
    /* Delete Auth User                                                       */
    /* ---------------------------------------------------------------------- */

    const {
      error: authDeleteError,
    } =
      await supabaseAdmin.auth.admin.deleteUser(
        companyUser.auth_user_id,
      );

    if (authDeleteError) {
      console.error(
        "deleteCompanyUser auth error:",
        authDeleteError,
      );

      return {
        success: false,
        error:
          "Company user was removed, but the authentication account could not be removed.",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "deleteCompanyUser unexpected error:",
      error,
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong while deleting the company user.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* UPDATE COMPANY USER STATUS                                                 */
/* -------------------------------------------------------------------------- */

export async function updateCompanyUserStatus(
  id: string,
  status: CompanyUserStatus,
): Promise<
  CompanyUserActionResult<CompanyUser>
> {
  try {
    if (!id?.trim()) {
      return {
        success: false,
        error:
          "Company user ID is required.",
      };
    }

    const { user, isSuperAdmin } =
      await getCurrentUserWithRole();

    if (!isSuperAdmin) {
      const context =
        await getAuthorizationContext();

      requireCompanyUserManagement(
        context,
      );
    }

    const supabase =
      await createSupabaseServerClient();

    const dbStatus =
      mapStatusToDb(
        status,
      );

    /* ---------------------------------------------------------------------- */
    /* Find Target User                                                       */
    /* ---------------------------------------------------------------------- */

    const {
      data: existingUser,
      error: existingError,
    } = await supabase
      .from("company_users")
      .select(
        `
          id,
          company_id
        `,
      )
      .eq(
        "id",
        id,
      )
      .maybeSingle();

    if (existingError) {
      console.error(
        "updateCompanyUserStatus lookup error:",
        existingError,
      );

      return {
        success: false,
        error:
          "Failed to find company user.",
      };
    }

    if (!existingUser) {
      return {
        success: false,
        error:
          "Company user not found.",
      };
    }

    if (!isSuperAdmin) {
      const context =
        await getAuthorizationContext();

      requireCompanyUserCompanyManagement(
        context,
        existingUser.company_id,
      );
    }

    /* ---------------------------------------------------------------------- */
    /* Update                                                                 */
    /* ---------------------------------------------------------------------- */

    const {
      data,
      error,
    } = await supabase
      .from("company_users")
      .update({
        status:
          dbStatus,
      })
      .eq(
        "id",
        id,
      )
      .eq(
        "company_id",
        existingUser.company_id,
      )
      .select(
        COMPANY_USER_SELECT,
      )
      .maybeSingle();

    if (error) {
      console.error(
        "updateCompanyUserStatus error:",
        error,
      );

      return {
        success: false,
        error:
          "Failed to update company user status.",
      };
    }

    if (!data) {
      return {
        success: false,
        error:
          "Company user not found.",
      };
    }

    const role =
      await getCompanyUserRole(
        supabase,
        id,
      );

    return {
      success: true,
      data: mapCompanyUser(
        data as unknown as CompanyUserRow,
        role,
      ),
    };
  } catch (error) {
    console.error(
      "updateCompanyUserStatus unexpected error:",
      error,
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong while updating the user status.",
    };
  }
}