"use server";

import { createSupabaseServerClient } from "@/lib/db/server";

import {
  companyUserCreateSchema,
  companyUserUpdateSchema,
  type CompanyUserCreateInput,
  type CompanyUserUpdateInput,
} from "../validations/company-user-schema";

import type {
  CompanyUser,
  CompanyUserRole,
  CompanyUserStatus,
} from "@/lib/types";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type CompanyUserRow = {
  id: string;
  auth_user_id: string;
  company_id: string;
  username: string;
  email: string;
  role: "user";
  status: "active" | "inactive" | "suspended";
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type CompanyUserActionResult<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function mapCompanyUser(row: CompanyUserRow): CompanyUser {
  return {
    id: row.id,
    authUserId: row.auth_user_id,
    companyId: row.company_id,
    username: row.username,
    email: row.email,
    role: "User",
    status:
      row.status === "active"
        ? "Active"
        : row.status === "inactive"
          ? "Inactive"
          : "Suspended",
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCompanyUserRole(
  role: CompanyUserRole
): CompanyUserRow["role"] {
  return role.toLowerCase() as CompanyUserRow["role"];
}

function mapCompanyUserStatus(
  status: CompanyUserStatus
): CompanyUserRow["status"] {
  return status.toLowerCase() as CompanyUserRow["status"];
}

/* -------------------------------------------------------------------------- */
/* GET CURRENT USER'S COMPANY ADMIN                                          */
/* -------------------------------------------------------------------------- */

async function getCurrentCompanyAdmin() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false as const,
      error: "Authentication required.",
    };
  }

  const { data: admin, error } = await supabase
    .from("company_admins")
    .select(`
      id,
      company_id,
      status
    `)
    .eq("auth_user_id", user.id)
    .eq("status", "active")
    .single();

  if (error || !admin) {
    console.error(
      "getCurrentCompanyAdmin error:",
      error
    );

    return {
      success: false as const,
      error: "Company admin access required.",
    };
  }

  return {
    success: true as const,
    admin: {
      id: admin.id,
      companyId: admin.company_id,
    },
  };
}

/* -------------------------------------------------------------------------- */
/* GET COMPANY USERS                                                          */
/* -------------------------------------------------------------------------- */

export async function getCompanyUsers(): Promise<
  CompanyUserActionResult<CompanyUser[]>
> {
  try {
    const adminResult = await getCurrentCompanyAdmin();

    if (!adminResult.success) {
      return {
        success: false,
        error: adminResult.error,
      };
    }

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("company_users")
      .select(`
        id,
        auth_user_id,
        company_id,
        username,
        email,
        role,
        status,
        created_by,
        created_at,
        updated_at
      `)
      .eq("company_id", adminResult.admin.companyId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("getCompanyUsers error:", error);

      return {
        success: false,
        error: "Failed to fetch company users.",
      };
    }

    const users = (data as CompanyUserRow[]).map(
      mapCompanyUser
    );

    return {
      success: true,
      data: users,
    };
  } catch (error) {
    console.error(
      "getCompanyUsers unexpected error:",
      error
    );

    return {
      success: false,
      error:
        "Something went wrong while fetching company users.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* GET COMPANY USER BY ID                                                     */
/* -------------------------------------------------------------------------- */

export async function getCompanyUserById(
  id: string
): Promise<CompanyUserActionResult<CompanyUser>> {
  try {
    if (!id) {
      return {
        success: false,
        error: "Company user ID is required.",
      };
    }

    const adminResult = await getCurrentCompanyAdmin();

    if (!adminResult.success) {
      return {
        success: false,
        error: adminResult.error,
      };
    }

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("company_users")
      .select(`
        id,
        auth_user_id,
        company_id,
        username,
        email,
        role,
        status,
        created_by,
        created_at,
        updated_at
      `)
      .eq("id", id)
      .eq("company_id", adminResult.admin.companyId)
      .single();

    if (error) {
      console.error(
        "getCompanyUserById error:",
        error
      );

      return {
        success: false,
        error:
          error.code === "PGRST116"
            ? "Company user not found."
            : "Failed to fetch company user.",
      };
    }

    return {
      success: true,
      data: mapCompanyUser(
        data as CompanyUserRow
      ),
    };
  } catch (error) {
    console.error(
      "getCompanyUserById unexpected error:",
      error
    );

    return {
      success: false,
      error:
        "Something went wrong while fetching the company user.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* CREATE COMPANY USER                                                        */
/* -------------------------------------------------------------------------- */

export async function createCompanyUser(
  input: CompanyUserCreateInput
): Promise<CompanyUserActionResult<CompanyUser>> {
  try {
    const validation = companyUserCreateSchema.safeParse(input);

    if (!validation.success) {
      return {
        success: false,
        error:
          validation.error.issues[0]?.message ??
          "Invalid company user data.",
      };
    }

    const values = validation.data;

    const adminResult = await getCurrentCompanyAdmin();

    if (!adminResult.success) {
      return {
        success: false,
        error: adminResult.error,
      };
    }

    const supabase = await createSupabaseServerClient();

    /*
     * IMPORTANT:
     *
     * The password must NOT be stored in company_users.
     *
     * The authenticated user should be created through
     * Supabase Auth, then the returned auth user ID is
     * stored in company_users.
     *
     * We will finalize this part once the Supabase Auth
     * server/admin client is confirmed.
     */

    const {
      data: authData,
      error: authError,
    } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
    });

    if (authError || !authData.user) {
      console.error(
        "createCompanyUser auth error:",
        authError
      );

      return {
        success: false,
        error:
          authError?.message ??
          "Failed to create authentication account.",
      };
    }

    const { data, error } = await supabase
      .from("company_users")
      .insert({
        auth_user_id: authData.user.id,
        company_id: adminResult.admin.companyId,
        username: values.username,
        email: values.email,
        role: mapCompanyUserRole(values.role),
        status: mapCompanyUserStatus(values.status),
        created_by: adminResult.admin.id,
      })
      .select(`
        id,
        auth_user_id,
        company_id,
        username,
        email,
        role,
        status,
        created_by,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      console.error(
        "createCompanyUser database error:",
        error
      );

      return {
        success: false,
        error: "Failed to create company user.",
      };
    }

    return {
      success: true,
      data: mapCompanyUser(
        data as CompanyUserRow
      ),
    };
  } catch (error) {
    console.error(
      "createCompanyUser unexpected error:",
      error
    );

    return {
      success: false,
      error:
        "Something went wrong while creating the company user.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* UPDATE COMPANY USER                                                        */
/* -------------------------------------------------------------------------- */

export async function updateCompanyUser(
  id: string,
  input: CompanyUserUpdateInput
): Promise<CompanyUserActionResult<CompanyUser>> {
  try {
    if (!id) {
      return {
        success: false,
        error: "Company user ID is required.",
      };
    }

    const validation = companyUserUpdateSchema.safeParse(input);

    if (!validation.success) {
      return {
        success: false,
        error:
          validation.error.issues[0]?.message ??
          "Invalid company user data.",
      };
    }

    const values = validation.data;

    const adminResult = await getCurrentCompanyAdmin();

    if (!adminResult.success) {
      return {
        success: false,
        error: adminResult.error,
      };
    }

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("company_users")
      .update({
        username: values.username,
        email: values.email,
        role: mapCompanyUserRole(values.role),
        status: mapCompanyUserStatus(values.status),
      })
      .eq("id", id)
      .eq("company_id", adminResult.admin.companyId)
      .select(`
        id,
        auth_user_id,
        company_id,
        username,
        email,
        role,
        status,
        created_by,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      console.error(
        "updateCompanyUser error:",
        error
      );

      return {
        success: false,
        error:
          error.code === "PGRST116"
            ? "Company user not found."
            : "Failed to update company user.",
      };
    }

    return {
      success: true,
      data: mapCompanyUser(
        data as CompanyUserRow
      ),
    };
  } catch (error) {
    console.error(
      "updateCompanyUser unexpected error:",
      error
    );

    return {
      success: false,
      error:
        "Something went wrong while updating the company user.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* DELETE COMPANY USER                                                        */
/* -------------------------------------------------------------------------- */

export async function deleteCompanyUser(
  id: string
): Promise<CompanyUserActionResult> {
  try {
    if (!id) {
      return {
        success: false,
        error: "Company user ID is required.",
      };
    }

    const adminResult = await getCurrentCompanyAdmin();

    if (!adminResult.success) {
      return {
        success: false,
        error: adminResult.error,
      };
    }

    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from("company_users")
      .delete()
      .eq("id", id)
      .eq("company_id", adminResult.admin.companyId);

    if (error) {
      console.error(
        "deleteCompanyUser error:",
        error
      );

      return {
        success: false,
        error: "Failed to delete company user.",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "deleteCompanyUser unexpected error:",
      error
    );

    return {
      success: false,
      error:
        "Something went wrong while deleting the company user.",
    };
  }
}