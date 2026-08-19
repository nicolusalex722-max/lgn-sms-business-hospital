"use server";

import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/db/server";

import {
  requireCurrentUser,
  requireSuperAdmin,
} from "@/lib/auth";

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
} from "@/lib/types";

/* -------------------------------------------------------------------------- */
/* Database Types                                                             */
/* -------------------------------------------------------------------------- */

type CompanyUserDbRole =
  | "user";

type CompanyUserDbStatus =
  | "active"
  | "inactive"
  | "suspended";

type EmployeeRow = {
  id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
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
  role: CompanyUserDbRole;
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
/* Select                                                                     */
/* -------------------------------------------------------------------------- */

const COMPANY_USER_SELECT = `
  id,
  auth_user_id,
  company_id,
  username,
  email,
  role,
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
 * Returns the currently authenticated application user.
 *
 * CompanyAdmin:
 *   Can manage users belonging to their own company.
 *
 * SuperAdmin:
 *   Can manage users across the platform.
 *
 * Normal User:
 *   Cannot manage company users.
 */
async function requireCompanyUserManagementAccess() {
  const currentUser =
    await requireCurrentUser();

  if (
    currentUser.role !== "SuperAdmin" &&
    currentUser.role !== "CompanyAdmin"
  ) {
    throw new Error(
      "You are not authorized to manage company users.",
    );
  }

  if (
    currentUser.role === "CompanyAdmin" &&
    !currentUser.companyId
  ) {
    throw new Error(
      "Company administrator is not associated with a company.",
    );
  }

  return currentUser;
}

/* -------------------------------------------------------------------------- */
/* Mapping Helpers                                                            */
/* -------------------------------------------------------------------------- */

function mapCompanyUserRole(
  role: CompanyUserDbRole,
): CompanyUserRole {
  switch (role) {
    case "user":
      return "User";
  }
}

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

/* -------------------------------------------------------------------------- */
/* Username Generator                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Generates an application username.
 *
 * Example:
 *
 * John Michael Doe
 *     ↓
 * john.doe
 *
 * If that username already exists, the caller can add
 * a numeric suffix.
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

/* -------------------------------------------------------------------------- */
/* Generate Unique Username                                                   */
/* -------------------------------------------------------------------------- */

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
/* Map Company User                                                           */
/* -------------------------------------------------------------------------- */

function mapCompanyUser(
  row: CompanyUserRow,
): CompanyUser {
  return {
    id: row.id,

    authUserId:
      row.auth_user_id,

    companyId:
      row.company_id,

    username:
      row.username,

    email:
      row.email,

    role:
      mapCompanyUserRole(
        row.role,
      ),

    status:
      mapCompanyUserStatus(
        row.status,
      ),

    createdBy:
      row.created_by,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,

    employeeId:
      row.employee_id,

    displayName:
      row.display_name,

    phone:
      row.phone,

    employee:
      row.employee
        ? {
            id:
              row.employee.id,

            firstName:
              row.employee.first_name,

            middleName:
              row.employee.middle_name,

            lastName:
              row.employee.last_name,

            email:
              row.employee.email,

            phone:
              row.employee.phone,

            departmentId:
              row.employee
                .department_id,

            branchId:
              row.employee.branch_id,

            position:
              row.employee.position,
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
    const currentUser =
      await requireCompanyUserManagementAccess();

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
     * CompanyAdmin is tenant-scoped.
     *
     * SuperAdmin can see all users.
     */
    if (
      currentUser.role ===
        "CompanyAdmin"
    ) {
      query = query.eq(
        "company_id",
        currentUser.companyId!,
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

    return {
      success: true,
      data:
        rows.map(
          mapCompanyUser,
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
/* GET USER BY ID                                                              */
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

    const currentUser =
      await requireCompanyUserManagementAccess();

    const supabase =
      await createSupabaseServerClient();

    let query =
      supabase
        .from("company_users")
        .select(
          COMPANY_USER_SELECT,
        )
        .eq("id", id);

    if (
      currentUser.role ===
      "CompanyAdmin"
    ) {
      query = query.eq(
        "company_id",
        currentUser.companyId!,
      );
    }

    const {
      data,
      error,
    } =
      await query.single();

    if (error) {
      console.error(
        "getCompanyUserById error:",
        error,
      );

      return {
        success: false,
        error:
          error.code ===
          "PGRST116"
            ? "Company user not found."
            : "Failed to fetch company user.",
      };
    }

    return {
      success: true,
      data: mapCompanyUser(
        data as unknown as CompanyUserRow,
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
    /* ---------------------------------------------------------------------- */
    /* Authorization                                                          */
    /* ---------------------------------------------------------------------- */

    const currentUser =
      await requireCompanyUserManagementAccess();

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
    /* Determine Company                                                      */
    /* ---------------------------------------------------------------------- */

    let companyId =
      currentUser.companyId;

    /*
     * SuperAdmin must provide a company through
     * a future platform-level workflow.
     *
     * Since this action is primarily intended for
     * CompanyAdmin, do not allow a SuperAdmin to
     * accidentally create an orphaned user.
     */
    if (!companyId) {
      return {
        success: false,
        error:
          "A company is required to create a company user.",
      };
    }

    /* ---------------------------------------------------------------------- */
    /* Verify Employee                                                        */
    /* ---------------------------------------------------------------------- */

    const {
      data: employee,
      error: employeeError,
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
        values.employeeId,
      )
      .eq(
        "company_id",
        companyId,
      )
      .single();

    if (
      employeeError ||
      !employee
    ) {
      return {
        success: false,
        error:
          "Employee was not found in your company.",
      };
    }

    /* ---------------------------------------------------------------------- */
    /* Employee Status                                                        */
    /* ---------------------------------------------------------------------- */

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
    /* Check Existing Employee Account                                        */
    /* ---------------------------------------------------------------------- */

    const {
      data: existingEmployeeUser,
      error:
        existingEmployeeUserError,
    } = await supabase
      .from("company_users")
      .select("id")
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
    /* Check Company Email                                                    */
    /* ---------------------------------------------------------------------- */

    const {
      data: existingEmail,
    } = await supabase
      .from("company_users")
      .select("id")
      .eq(
        "company_id",
        companyId,
      )
      .eq(
        "email",
        values.email,
      )
      .maybeSingle();

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
    /* CREATE AUTH USER                                                       */
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

          app_metadata: {
            role: "User",
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
    /* CREATE COMPANY USER                                                    */
    /* ---------------------------------------------------------------------- */

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

        role: "user",

        status: "active",

        employee_id:
          values.employeeId,

        created_by:
          currentUser.role ===
          "CompanyAdmin"
            ? await getCompanyAdminId(
                supabase,
                currentUser.id,
                companyId,
              )
            : null,
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

      /*
       * Roll back Auth account.
       */
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

    return {
      success: true,
      data: mapCompanyUser(
        companyUser as unknown as CompanyUserRow,
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
      if (
        createdAuthUserId
      ) {
        const supabaseAdmin =
          createSupabaseAdminClient();

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
/* GET COMPANY ADMIN ID                                                       */
/* -------------------------------------------------------------------------- */

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
    .select("id")
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

    const currentUser =
      await requireCompanyUserManagementAccess();

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
    /* Get Existing User                                                      */
    /* ---------------------------------------------------------------------- */

    let existingQuery =
      supabase
        .from("company_users")
        .select(
          `
            id,
            auth_user_id,
            company_id,
            employee_id
          `,
        )
        .eq("id", id);

    if (
      currentUser.role ===
      "CompanyAdmin"
    ) {
      existingQuery =
        existingQuery.eq(
          "company_id",
          currentUser.companyId!,
        );
    }

    const {
      data: existingUser,
      error: existingError,
    } =
      await existingQuery.single();

    if (
      existingError ||
      !existingUser
    ) {
      return {
        success: false,
        error:
          "Company user not found.",
      };
    }

    /* ---------------------------------------------------------------------- */
    /* Check Email                                                            */
    /* ---------------------------------------------------------------------- */

    const {
      data: duplicateEmail,
    } = await supabase
      .from("company_users")
      .select("id")
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

    if (duplicateEmail) {
      return {
        success: false,
        error:
          "Another company user already uses this email.",
      };
    }

    /* ---------------------------------------------------------------------- */
    /* Update Database                                                        */
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

        role: "user",

        status:
          values.status ===
          "Active"
            ? "active"
            : values.status ===
                "Inactive"
              ? "inactive"
              : "suspended",
      })
      .eq("id", id)
      .select(
        COMPANY_USER_SELECT,
      )
      .single();

    if (error) {
      console.error(
        "updateCompanyUser error:",
        error,
      );

      return {
        success: false,
        error:
          "Failed to update company user.",
      };
    }

    return {
      success: true,
      data: mapCompanyUser(
        data as unknown as CompanyUserRow,
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

    const currentUser =
      await requireCompanyUserManagementAccess();

    const supabase =
      await createSupabaseServerClient();

    const supabaseAdmin =
      createSupabaseAdminClient();

    /* ---------------------------------------------------------------------- */
    /* Find User                                                              */
    /* ---------------------------------------------------------------------- */

    let query =
      supabase
        .from("company_users")
        .select(
          "id, auth_user_id, company_id",
        )
        .eq("id", id);

    if (
      currentUser.role ===
      "CompanyAdmin"
    ) {
      query = query.eq(
        "company_id",
        currentUser.companyId!,
      );
    }

    const {
      data: companyUser,
      error:
        companyUserError,
    } = await query.single();

    if (
      companyUserError ||
      !companyUser
    ) {
      return {
        success: false,
        error:
          "Company user not found.",
      };
    }

    /* ---------------------------------------------------------------------- */
    /* Delete company_users                                                   */
    /* ---------------------------------------------------------------------- */

    const {
      error: deleteError,
    } = await supabase
      .from("company_users")
      .delete()
      .eq("id", id);

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

      /*
       * The database record has already been removed.
       * We report the Auth issue so it can be handled.
       */
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
/* UPDATE USER STATUS                                                         */
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

    const currentUser =
      await requireCompanyUserManagementAccess();

    const supabase =
      await createSupabaseServerClient();

    const dbStatus =
      status === "Active"
        ? "active"
        : status === "Inactive"
          ? "inactive"
          : "suspended";

    let query =
      supabase
        .from("company_users")
        .update({
          status: dbStatus,
        })
        .eq("id", id);

    if (
      currentUser.role ===
      "CompanyAdmin"
    ) {
      query = query.eq(
        "company_id",
        currentUser.companyId!,
      );
    }

    const {
      data,
      error,
    } = await query
      .select(
        COMPANY_USER_SELECT,
      )
      .single();

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

    return {
      success: true,
      data: mapCompanyUser(
        data as unknown as CompanyUserRow,
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