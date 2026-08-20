"use server";

import { createSupabaseServerClient } from "@/lib/db/server";

import { requireUserTenantContext } from "@/lib/auth";

import {
  requireCompanyContext,
  requirePermission,
} from "@/lib/auth/authorization";

import {
  departmentCreateSchema,
  departmentUpdateSchema,
  type DepartmentCreateInput,
  type DepartmentUpdateInput,
} from "@/lib/validations/department-schema";

import type {
  Department,
  DepartmentStatus,
  UserTenantContext,
} from "@/lib/types";

/* ========================================================================== */
/* Database Types                                                             */
/* ========================================================================== */

type DepartmentDbStatus =
  | "active"
  | "inactive";

type DepartmentRow = {
  id: string;
  company_id: string;
  department_name: string;
  department_code: string;
  status: DepartmentDbStatus;
  description: string | null;
  created_at: string;
  updated_at: string;
};

/* ========================================================================== */
/* Action Result                                                              */
/* ========================================================================== */

export type DepartmentActionResult<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
};

/* ========================================================================== */
/* Shared Select                                                              */
/* ========================================================================== */

const DEPARTMENT_SELECT = `
  id,
  company_id,
  department_name,
  department_code,
  status,
  description,
  created_at,
  updated_at
`;

/* ========================================================================== */
/* Authorization Context                                                      */
/* ========================================================================== */

/**
 * Resolves the authorization context required by department actions.
 *
 * Flow:
 *
 * authenticated Supabase user
 *          ↓
 * UserTenantContext
 *          ↓
 * company context
 *
 * IMPORTANT:
 *
 * companyId is NEVER accepted from the client.
 *
 * The company is always resolved from the authenticated user's
 * authorization context.
 */
async function requireDepartmentContext(): Promise<{
  context: UserTenantContext;
  companyId: string;
}> {
  const context =
    await requireUserTenantContext();

  const companyId =
    requireCompanyContext(context);

  return {
    context,
    companyId,
  };
}

/* ========================================================================== */
/* Mapping Helpers                                                            */
/* ========================================================================== */

function mapDepartmentStatus(
  status: DepartmentDbStatus,
): DepartmentStatus {
  switch (status) {
    case "active":
      return "Active";

    case "inactive":
      return "Inactive";
  }
}

/* ========================================================================== */
/* Map Database Row → Application Department                                  */
/* ========================================================================== */

function mapDepartment(
  row: DepartmentRow,
): Department {
  return {
    id: row.id,

    companyId:
      row.company_id,

    departmentName:
      row.department_name,

    departmentCode:
      row.department_code,

    status:
      mapDepartmentStatus(
        row.status,
      ),

    description:
      row.description,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  };
}

/* ========================================================================== */
/* GET ALL DEPARTMENTS                                                        */
/* ========================================================================== */

/**
 * Returns departments belonging to the authenticated user's company.
 *
 * Required permission:
 *
 * departments.view
 *
 * Tenant isolation:
 *
 * authenticated user
 *       ↓
 * company context
 *       ↓
 * .eq("company_id", companyId)
 */
export async function getDepartments(): Promise<
  DepartmentActionResult<Department[]>
> {
  try {
    /* ---------------------------------------------------------------------- */
    /* Authentication + Company Context                                      */
    /* ---------------------------------------------------------------------- */

    const {
      context,
      companyId,
    } =
      await requireDepartmentContext();

    /* ---------------------------------------------------------------------- */
    /* Authorization                                                          */
    /* ---------------------------------------------------------------------- */

    await requirePermission(
      context,
      "departments.view",
    );

    /* ---------------------------------------------------------------------- */
    /* Database                                                               */
    /* ---------------------------------------------------------------------- */

    const supabase =
      await createSupabaseServerClient();

    const {
      data,
      error,
    } = await supabase
      .from("departments")
      .select(DEPARTMENT_SELECT)
      .eq("company_id", companyId)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "getDepartments error:",
        error,
      );

      return {
        success: false,
        error:
          "Failed to fetch departments.",
      };
    }

    const rows =
      (data ?? []) as unknown as DepartmentRow[];

    return {
      success: true,
      data: rows.map(mapDepartment),
    };
  } catch (error) {
    console.error(
      "getDepartments unexpected error:",
      error,
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong while fetching departments.",
    };
  }
}

/* ========================================================================== */
/* GET DEPARTMENT BY ID                                                       */
/* ========================================================================== */

/**
 * Fetches a single department belonging to the authenticated user's company.
 *
 * Required permission:
 *
 * departments.view
 *
 * IMPORTANT:
 *
 * The department ID alone is NOT sufficient.
 *
 * The query also checks company_id.
 *
 * This prevents cross-company access.
 */
export async function getDepartmentById(
  id: string,
): Promise<
  DepartmentActionResult<Department>
> {
  try {
    /* ---------------------------------------------------------------------- */
    /* Validate ID                                                            */
    /* ---------------------------------------------------------------------- */

    if (!id?.trim()) {
      return {
        success: false,
        error:
          "Department ID is required.",
      };
    }

    /* ---------------------------------------------------------------------- */
    /* Authentication + Company Context                                      */
    /* ---------------------------------------------------------------------- */

    const {
      context,
      companyId,
    } =
      await requireDepartmentContext();

    /* ---------------------------------------------------------------------- */
    /* Authorization                                                          */
    /* ---------------------------------------------------------------------- */

    await requirePermission(
      context,
      "departments.view",
    );

    /* ---------------------------------------------------------------------- */
    /* Database                                                               */
    /* ---------------------------------------------------------------------- */

    const supabase =
      await createSupabaseServerClient();

    const {
      data,
      error,
    } = await supabase
      .from("departments")
      .select(DEPARTMENT_SELECT)
      .eq("id", id)
      .eq("company_id", companyId)
      .maybeSingle();

    if (error) {
      console.error(
        "getDepartmentById error:",
        error,
      );

      return {
        success: false,
        error:
          "Failed to fetch department.",
      };
    }

    if (!data) {
      return {
        success: false,
        error:
          "Department not found.",
      };
    }

    return {
      success: true,
      data: mapDepartment(
        data as unknown as DepartmentRow,
      ),
    };
  } catch (error) {
    console.error(
      "getDepartmentById unexpected error:",
      error,
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong while fetching the department.",
    };
  }
}

/* ========================================================================== */
/* CREATE DEPARTMENT                                                          */
/* ========================================================================== */

/**
 * Creates a department for the authenticated user's company.
 *
 * Required permission:
 *
 * departments.create
 *
 * IMPORTANT:
 *
 * company_id is NEVER accepted from the client.
 */
export async function createDepartment(
  input: DepartmentCreateInput,
): Promise<
  DepartmentActionResult<Department>
> {
  try {
    /* ---------------------------------------------------------------------- */
    /* Authentication + Company Context                                      */
    /* ---------------------------------------------------------------------- */

    const {
      context,
      companyId,
    } =
      await requireDepartmentContext();

    /* ---------------------------------------------------------------------- */
    /* Authorization                                                          */
    /* ---------------------------------------------------------------------- */

    await requirePermission(
      context,
      "departments.create",
    );

    /* ---------------------------------------------------------------------- */
    /* Validation                                                             */
    /* ---------------------------------------------------------------------- */

    const validation =
      departmentCreateSchema.safeParse(
        input,
      );

    if (!validation.success) {
      return {
        success: false,
        error:
          validation.error.issues[0]
            ?.message ??
          "Invalid department data.",
      };
    }

    const values =
      validation.data;

    /* ---------------------------------------------------------------------- */
    /* Database                                                               */
    /* ---------------------------------------------------------------------- */

    const supabase =
      await createSupabaseServerClient();

    const {
      data,
      error,
    } = await supabase
      .from("departments")
      .insert({
        company_id: companyId,

        department_name:
          values.departmentName,

        department_code:
          values.departmentCode,

        description:
          values.description || null,

        status: "active",
      })
      .select(DEPARTMENT_SELECT)
      .single();

    if (error) {
      console.error(
        "createDepartment error:",
        error,
      );

      /* -------------------------------------------------------------------- */
      /* PostgreSQL Unique Violation                                          */
      /* -------------------------------------------------------------------- */

      if (error.code === "23505") {
        return {
          success: false,
          error:
            "A department with this code already exists in your company.",
        };
      }

      return {
        success: false,
        error:
          "Failed to create department.",
      };
    }

    return {
      success: true,
      data: mapDepartment(
        data as unknown as DepartmentRow,
      ),
    };
  } catch (error) {
    console.error(
      "createDepartment unexpected error:",
      error,
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong while creating the department.",
    };
  }
}

/* ========================================================================== */
/* UPDATE DEPARTMENT                                                          */
/* ========================================================================== */

/**
 * Updates a department belonging only to the authenticated user's company.
 *
 * Required permission:
 *
 * departments.update
 *
 * company_id cannot be changed through this action.
 */
export async function updateDepartment(
  id: string,
  input: DepartmentUpdateInput,
): Promise<
  DepartmentActionResult<Department>
> {
  try {
    /* ---------------------------------------------------------------------- */
    /* Validate ID                                                            */
    /* ---------------------------------------------------------------------- */

    if (!id?.trim()) {
      return {
        success: false,
        error:
          "Department ID is required.",
      };
    }

    /* ---------------------------------------------------------------------- */
    /* Authentication + Company Context                                      */
    /* ---------------------------------------------------------------------- */

    const {
      context,
      companyId,
    } =
      await requireDepartmentContext();

    /* ---------------------------------------------------------------------- */
    /* Authorization                                                          */
    /* ---------------------------------------------------------------------- */

    await requirePermission(
      context,
      "departments.update",
    );

    /* ---------------------------------------------------------------------- */
    /* Validation                                                             */
    /* ---------------------------------------------------------------------- */

    const validation =
      departmentUpdateSchema.safeParse(
        input,
      );

    if (!validation.success) {
      return {
        success: false,
        error:
          validation.error.issues[0]
            ?.message ??
          "Invalid department data.",
      };
    }

    const values =
      validation.data;

    /* ---------------------------------------------------------------------- */
    /* Database                                                               */
    /* ---------------------------------------------------------------------- */

    const supabase =
      await createSupabaseServerClient();

    const {
      data,
      error,
    } = await supabase
      .from("departments")
      .update({
        department_name:
          values.departmentName,

        department_code:
          values.departmentCode,

        description:
          values.description || null,

        status:
          values.status === "Active"
            ? "active"
            : "inactive",
      })
      .eq("id", id)
      .eq("company_id", companyId)
      .select(DEPARTMENT_SELECT)
      .maybeSingle();

    if (error) {
      console.error(
        "updateDepartment error:",
        error,
      );

      /* -------------------------------------------------------------------- */
      /* PostgreSQL Unique Violation                                          */
      /* -------------------------------------------------------------------- */

      if (error.code === "23505") {
        return {
          success: false,
          error:
            "A department with this code already exists in your company.",
        };
      }

      return {
        success: false,
        error:
          "Failed to update department.",
      };
    }

    if (!data) {
      return {
        success: false,
        error:
          "Department not found.",
      };
    }

    return {
      success: true,
      data: mapDepartment(
        data as unknown as DepartmentRow,
      ),
    };
  } catch (error) {
    console.error(
      "updateDepartment unexpected error:",
      error,
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong while updating the department.",
    };
  }
}

/* ========================================================================== */
/* DELETE DEPARTMENT                                                          */
/* ========================================================================== */

/**
 * Deletes a department belonging only to the authenticated user's company.
 *
 * Required permission:
 *
 * departments.delete
 */
export async function deleteDepartment(
  id: string,
): Promise<DepartmentActionResult> {
  try {
    /* ---------------------------------------------------------------------- */
    /* Validate ID                                                            */
    /* ---------------------------------------------------------------------- */

    if (!id?.trim()) {
      return {
        success: false,
        error:
          "Department ID is required.",
      };
    }

    /* ---------------------------------------------------------------------- */
    /* Authentication + Company Context                                      */
    /* ---------------------------------------------------------------------- */

    const {
      context,
      companyId,
    } =
      await requireDepartmentContext();

    /* ---------------------------------------------------------------------- */
    /* Authorization                                                          */
    /* ---------------------------------------------------------------------- */

    await requirePermission(
      context,
      "departments.delete",
    );

    /* ---------------------------------------------------------------------- */
    /* Database                                                               */
    /* ---------------------------------------------------------------------- */

    const supabase =
      await createSupabaseServerClient();

    const {
      data,
      error,
    } = await supabase
      .from("departments")
      .delete()
      .eq("id", id)
      .eq("company_id", companyId)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error(
        "deleteDepartment error:",
        error,
      );

      return {
        success: false,
        error:
          "Failed to delete department.",
      };
    }

    if (!data) {
      return {
        success: false,
        error:
          "Department not found.",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "deleteDepartment unexpected error:",
      error,
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong while deleting the department.",
    };
  }
}

/* ========================================================================== */
/* TOGGLE DEPARTMENT STATUS                                                   */
/* ========================================================================== */

/**
 * Toggles a department between active and inactive.
 *
 * Required permission:
 *
 * departments.update
 *
 * The department must belong to the authenticated user's company.
 */
export async function toggleDepartmentStatus(
  id: string,
): Promise<
  DepartmentActionResult<Department>
> {
  try {
    /* ---------------------------------------------------------------------- */
    /* Validate ID                                                            */
    /* ---------------------------------------------------------------------- */

    if (!id?.trim()) {
      return {
        success: false,
        error:
          "Department ID is required.",
      };
    }

    /* ---------------------------------------------------------------------- */
    /* Authentication + Company Context                                      */
    /* ---------------------------------------------------------------------- */

    const {
      context,
      companyId,
    } =
      await requireDepartmentContext();

    /* ---------------------------------------------------------------------- */
    /* Authorization                                                          */
    /* ---------------------------------------------------------------------- */

    await requirePermission(
      context,
      "departments.update",
    );

    /* ---------------------------------------------------------------------- */
    /* Database                                                               */
    /* ---------------------------------------------------------------------- */

    const supabase =
      await createSupabaseServerClient();

    /* ---------------------------------------------------------------------- */
    /* Fetch Current Status                                                   */
    /* ---------------------------------------------------------------------- */

    const {
      data: department,
      error: fetchError,
    } = await supabase
      .from("departments")
      .select(`
        id,
        company_id,
        status
      `)
      .eq("id", id)
      .eq("company_id", companyId)
      .maybeSingle();

    if (fetchError) {
      console.error(
        "toggleDepartmentStatus fetch error:",
        fetchError,
      );

      return {
        success: false,
        error:
          "Failed to fetch department.",
      };
    }

    if (!department) {
      return {
        success: false,
        error:
          "Department not found.",
      };
    }

    /* ---------------------------------------------------------------------- */
    /* Calculate Next Status                                                  */
    /* ---------------------------------------------------------------------- */

    const nextStatus =
      department.status === "active"
        ? "inactive"
        : "active";

    /* ---------------------------------------------------------------------- */
    /* Update Status                                                          */
    /* ---------------------------------------------------------------------- */

    const {
      data,
      error,
    } = await supabase
      .from("departments")
      .update({
        status: nextStatus,
      })
      .eq("id", id)
      .eq("company_id", companyId)
      .select(DEPARTMENT_SELECT)
      .single();

    if (error) {
      console.error(
        "toggleDepartmentStatus update error:",
        error,
      );

      return {
        success: false,
        error:
          "Failed to update department status.",
      };
    }

    return {
      success: true,
      data: mapDepartment(
        data as unknown as DepartmentRow,
      ),
    };
  } catch (error) {
    console.error(
      "toggleDepartmentStatus unexpected error:",
      error,
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong while changing the department status.",
    };
  }
}