"use server";

import { createSupabaseServerClient } from "@/lib/db/server";

import { requireUserTenantContext } from "@/lib/auth";

import {
  requireCompanyContext,
  requirePermission,
} from "@/lib/auth/authorization";

import {
  employeeCreateSchema,
  employeeUpdateSchema,
  type EmployeeCreateInput,
  type EmployeeUpdateInput,
} from "@/lib/validations/employees-schema";

import type {
  Employee,
  EmployeeStatus,
  UserTenantContext,
} from "@/lib/types";

/* ========================================================================== */
/* Database Types                                                             */
/* ========================================================================== */

type EmployeeDbStatus =
  | "active"
  | "inactive"
  | "suspended";

type EmployeeRow = {
  id: string;
  company_id: string;
  employee_number: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string | null;
  phone: string | null;
  department_id: string | null;
  branch_id: string | null;
  position: string;
  salary: number | null;
  birthdate: string | null;
  next_of_kin_name: string | null;
  next_of_kin_phone: string | null;
  guarantor_name: string | null;
  guarantor_phone: string | null;
  status: EmployeeDbStatus;
  created_at: string;
  updated_at: string;
};

/* ========================================================================== */
/* Action Result                                                              */
/* ========================================================================== */

export type EmployeeActionResult<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
};

/* ========================================================================== */
/* Shared Select                                                              */
/* ========================================================================== */

const EMPLOYEE_SELECT = `
  id,
  company_id,
  employee_number,
  first_name,
  middle_name,
  last_name,
  email,
  phone,
  department_id,
  branch_id,
  position,
  salary,
  birthdate,
  next_of_kin_name,
  next_of_kin_phone,
  guarantor_name,
  guarantor_phone,
  status,
  created_at,
  updated_at
`;

/* ========================================================================== */
/* Authorization Context                                                      */
/* ========================================================================== */

/**
 * Resolves the authorization context required by employee actions.
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
async function requireEmployeeContext(): Promise<{
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

function mapEmployeeStatus(
  status: EmployeeDbStatus,
): EmployeeStatus {
  switch (status) {
    case "active":
      return "Active";

    case "inactive":
      return "Inactive";

    case "suspended":
      return "Suspended";
  }
}

/* ========================================================================== */
/* Map Database Row → Application Employee                                    */
/* ========================================================================== */

function mapEmployee(
  row: EmployeeRow,
): Employee {
  return {
    id: row.id,

    companyId:
      row.company_id,

    employeeNumber:
      row.employee_number,

    firstName:
      row.first_name,

    middleName:
      row.middle_name,

    lastName:
      row.last_name,

    email:
      row.email,

    phone:
      row.phone,

    departmentId:
      row.department_id,

    branchId:
      row.branch_id,

    position:
      row.position,

    salary:
      row.salary,

    birthdate:
      row.birthdate,

    nextOfKinName:
      row.next_of_kin_name,

    nextOfKinPhone:
      row.next_of_kin_phone,

    guarantorName:
      row.guarantor_name,

    guarantorPhone:
      row.guarantor_phone,

    status:
      mapEmployeeStatus(
        row.status,
      ),

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  };
}

/* ========================================================================== */
/* GET ALL EMPLOYEES                                                          */
/* ========================================================================== */

/**
 * Returns employees belonging only to the authenticated user's company.
 *
 * Required permission:
 *
 * employees.view
 *
 * Tenant isolation:
 *
 * authenticated user
 *       ↓
 * company context
 *       ↓
 * .eq("company_id", companyId)
 */
export async function getEmployees(): Promise<
  EmployeeActionResult<Employee[]>
> {
  try {
    /* ---------------------------------------------------------------------- */
    /* Authentication + Company Context                                      */
    /* ---------------------------------------------------------------------- */

    const {
      context,
      companyId,
    } =
      await requireEmployeeContext();

    /* ---------------------------------------------------------------------- */
    /* Authorization                                                          */
    /* ---------------------------------------------------------------------- */

    await requirePermission(
      context,
      "employees.view",
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
      .from("employees")
      .select(EMPLOYEE_SELECT)
      .eq("company_id", companyId)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "getEmployees error:",
        error,
      );

      return {
        success: false,
        error:
          "Failed to fetch employees.",
      };
    }

    const rows =
      (data ?? []) as unknown as EmployeeRow[];

    return {
      success: true,
      data: rows.map(mapEmployee),
    };
  } catch (error) {
    console.error(
      "getEmployees unexpected error:",
      error,
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong while fetching employees.",
    };
  }
}

/* ========================================================================== */
/* GET EMPLOYEE BY ID                                                         */
/* ========================================================================== */

/**
 * Fetches a single employee belonging to the authenticated user's company.
 *
 * Required permission:
 *
 * employees.view
 *
 * IMPORTANT:
 *
 * The employee ID alone is NOT sufficient.
 *
 * The query also checks company_id.
 *
 * This prevents cross-company access.
 */
export async function getEmployeeById(
  id: string,
): Promise<
  EmployeeActionResult<Employee>
> {
  try {
    /* ---------------------------------------------------------------------- */
    /* Validate ID                                                            */
    /* ---------------------------------------------------------------------- */

    if (!id?.trim()) {
      return {
        success: false,
        error:
          "Employee ID is required.",
      };
    }

    /* ---------------------------------------------------------------------- */
    /* Authentication + Company Context                                      */
    /* ---------------------------------------------------------------------- */

    const {
      context,
      companyId,
    } =
      await requireEmployeeContext();

    /* ---------------------------------------------------------------------- */
    /* Authorization                                                          */
    /* ---------------------------------------------------------------------- */

    await requirePermission(
      context,
      "employees.view",
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
      .from("employees")
      .select(EMPLOYEE_SELECT)
      .eq("id", id)
      .eq("company_id", companyId)
      .maybeSingle();

    if (error) {
      console.error(
        "getEmployeeById error:",
        error,
      );

      return {
        success: false,
        error:
          "Failed to fetch employee.",
      };
    }

    if (!data) {
      return {
        success: false,
        error:
          "Employee not found.",
      };
    }

    return {
      success: true,
      data: mapEmployee(
        data as unknown as EmployeeRow,
      ),
    };
  } catch (error) {
    console.error(
      "getEmployeeById unexpected error:",
      error,
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong while fetching the employee.",
    };
  }
}

/* ========================================================================== */
/* CREATE EMPLOYEE                                                            */
/* ========================================================================== */

/**
 * Creates an employee for the authenticated user's company.
 *
 * Required permission:
 *
 * employees.create
 *
 * IMPORTANT:
 *
 * company_id is NEVER accepted from the client.
 */
export async function createEmployee(
  input: EmployeeCreateInput,
): Promise<
  EmployeeActionResult<Employee>
> {
  try {
    /* ---------------------------------------------------------------------- */
    /* Authentication + Company Context                                      */
    /* ---------------------------------------------------------------------- */

    const {
      context,
      companyId,
    } =
      await requireEmployeeContext();

    /* ---------------------------------------------------------------------- */
    /* Authorization                                                          */
    /* ---------------------------------------------------------------------- */

    await requirePermission(
      context,
      "employees.create",
    );

    /* ---------------------------------------------------------------------- */
    /* Validation                                                             */
    /* ---------------------------------------------------------------------- */

    const validation =
      employeeCreateSchema.safeParse(
        input,
      );

    if (!validation.success) {
      return {
        success: false,
        error:
          validation.error.issues[0]
            ?.message ??
          "Invalid employee data.",
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
      .from("employees")
      .insert({
        company_id: companyId,

        employee_number:
          values.employeeNumber,

        first_name:
          values.firstName,

        middle_name:
          values.middleName || null,

        last_name:
          values.lastName,

        email:
          values.email || null,

        phone:
          values.phone || null,

        department_id:
          values.departmentId || null,

        branch_id:
          values.branchId || null,

        position:
          values.position,

        salary:
          values.salary ?? null,

        birthdate:
          values.birthdate || null,

        next_of_kin_name:
          values.nextOfKinName || null,

        next_of_kin_phone:
          values.nextOfKinPhone || null,

        guarantor_name:
          values.guarantorName || null,

        guarantor_phone:
          values.guarantorPhone || null,

        status: "active",
      })
      .select(EMPLOYEE_SELECT)
      .single();

    if (error) {
      console.error(
        "createEmployee error:",
        error,
      );

      /* -------------------------------------------------------------------- */
      /* PostgreSQL Unique Violation                                          */
      /* -------------------------------------------------------------------- */

      if (error.code === "23505") {
        return {
          success: false,
          error:
            "An employee with this employee number already exists in your company.",
        };
      }

      /* -------------------------------------------------------------------- */
      /* Foreign Key Violation                                                */
      /* -------------------------------------------------------------------- */

      if (error.code === "23503") {
        return {
          success: false,
          error:
            "The selected department or branch does not exist.",
        };
      }

      return {
        success: false,
        error:
          "Failed to create employee.",
      };
    }

    return {
      success: true,
      data: mapEmployee(
        data as unknown as EmployeeRow,
      ),
    };
  } catch (error) {
    console.error(
      "createEmployee unexpected error:",
      error,
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong while creating the employee.",
    };
  }
}

/* ========================================================================== */
/* UPDATE EMPLOYEE                                                            */
/* ========================================================================== */

/**
 * Updates an employee belonging only to the authenticated user's company.
 *
 * Required permission:
 *
 * employees.update
 *
 * company_id cannot be changed through this action.
 */
export async function updateEmployee(
  id: string,
  input: EmployeeUpdateInput,
): Promise<
  EmployeeActionResult<Employee>
> {
  try {
    /* ---------------------------------------------------------------------- */
    /* Validate ID                                                            */
    /* ---------------------------------------------------------------------- */

    if (!id?.trim()) {
      return {
        success: false,
        error:
          "Employee ID is required.",
      };
    }

    /* ---------------------------------------------------------------------- */
    /* Authentication + Company Context                                      */
    /* ---------------------------------------------------------------------- */

    const {
      context,
      companyId,
    } =
      await requireEmployeeContext();

    /* ---------------------------------------------------------------------- */
    /* Authorization                                                          */
    /* ---------------------------------------------------------------------- */

    await requirePermission(
      context,
      "employees.update",
    );

    /* ---------------------------------------------------------------------- */
    /* Validation                                                             */
    /* ---------------------------------------------------------------------- */

    const validation =
      employeeUpdateSchema.safeParse(
        input,
      );

    if (!validation.success) {
      return {
        success: false,
        error:
          validation.error.issues[0]
            ?.message ??
          "Invalid employee data.",
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
      .from("employees")
      .update({
        employee_number:
          values.employeeNumber,

        first_name:
          values.firstName,

        middle_name:
          values.middleName || null,

        last_name:
          values.lastName,

        email:
          values.email || null,

        phone:
          values.phone || null,

        department_id:
          values.departmentId || null,

        branch_id:
          values.branchId || null,

        position:
          values.position,

        salary:
          values.salary ?? null,

        birthdate:
          values.birthdate || null,

        next_of_kin_name:
          values.nextOfKinName || null,

        next_of_kin_phone:
          values.nextOfKinPhone || null,

        guarantor_name:
          values.guarantorName || null,

        guarantor_phone:
          values.guarantorPhone || null,

        status:
          values.status === "Active"
            ? "active"
            : values.status === "Inactive"
              ? "inactive"
              : "suspended",
      })
      .eq("id", id)
      .eq("company_id", companyId)
      .select(EMPLOYEE_SELECT)
      .maybeSingle();

    if (error) {
      console.error(
        "updateEmployee error:",
        error,
      );

      /* -------------------------------------------------------------------- */
      /* PostgreSQL Unique Violation                                          */
      /* -------------------------------------------------------------------- */

      if (error.code === "23505") {
        return {
          success: false,
          error:
            "An employee with this employee number already exists in your company.",
        };
      }

      /* -------------------------------------------------------------------- */
      /* Foreign Key Violation                                                */
      /* -------------------------------------------------------------------- */

      if (error.code === "23503") {
        return {
          success: false,
          error:
            "The selected department or branch does not exist.",
        };
      }

      return {
        success: false,
        error:
          "Failed to update employee.",
      };
    }

    if (!data) {
      return {
        success: false,
        error:
          "Employee not found.",
      };
    }

    return {
      success: true,
      data: mapEmployee(
        data as unknown as EmployeeRow,
      ),
    };
  } catch (error) {
    console.error(
      "updateEmployee unexpected error:",
      error,
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong while updating the employee.",
    };
  }
}

/* ========================================================================== */
/* DELETE EMPLOYEE                                                            */
/* ========================================================================== */

/**
 * Deletes an employee belonging only to the authenticated user's company.
 *
 * Required permission:
 *
 * employees.delete
 */
export async function deleteEmployee(
  id: string,
): Promise<EmployeeActionResult> {
  try {
    /* ---------------------------------------------------------------------- */
    /* Validate ID                                                            */
    /* ---------------------------------------------------------------------- */

    if (!id?.trim()) {
      return {
        success: false,
        error:
          "Employee ID is required.",
      };
    }

    /* ---------------------------------------------------------------------- */
    /* Authentication + Company Context                                      */
    /* ---------------------------------------------------------------------- */

    const {
      context,
      companyId,
    } =
      await requireEmployeeContext();

    /* ---------------------------------------------------------------------- */
    /* Authorization                                                          */
    /* ---------------------------------------------------------------------- */

    await requirePermission(
      context,
      "employees.delete",
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
      .from("employees")
      .delete()
      .eq("id", id)
      .eq("company_id", companyId)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error(
        "deleteEmployee error:",
        error,
      );

      return {
        success: false,
        error:
          "Failed to delete employee.",
      };
    }

    if (!data) {
      return {
        success: false,
        error:
          "Employee not found.",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "deleteEmployee unexpected error:",
      error,
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong while deleting the employee.",
    };
  }
}

/* ========================================================================== */
/* TOGGLE EMPLOYEE STATUS                                                     */
/* ========================================================================== */

/**
 * Toggles an employee between active and inactive.
 *
 * IMPORTANT:
 *
 * Because employees can also have the "suspended" state,
 * this function only toggles:
 *
 * active → inactive
 * inactive → active
 *
 * A suspended employee remains suspended.
 *
 * Required permission:
 *
 * employees.update
 */
export async function toggleEmployeeStatus(
  id: string,
): Promise<
  EmployeeActionResult<Employee>
> {
  try {
    /* ---------------------------------------------------------------------- */
    /* Validate ID                                                            */
    /* ---------------------------------------------------------------------- */

    if (!id?.trim()) {
      return {
        success: false,
        error:
          "Employee ID is required.",
      };
    }

    /* ---------------------------------------------------------------------- */
    /* Authentication + Company Context                                      */
    /* ---------------------------------------------------------------------- */

    const {
      context,
      companyId,
    } =
      await requireEmployeeContext();

    /* ---------------------------------------------------------------------- */
    /* Authorization                                                          */
    /* ---------------------------------------------------------------------- */

    await requirePermission(
      context,
      "employees.update",
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
      data: employee,
      error: fetchError,
    } = await supabase
      .from("employees")
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
        "toggleEmployeeStatus fetch error:",
        fetchError,
      );

      return {
        success: false,
        error:
          "Failed to fetch employee.",
      };
    }

    if (!employee) {
      return {
        success: false,
        error:
          "Employee not found.",
      };
    }

    /* ---------------------------------------------------------------------- */
    /* Suspended Employee                                                     */
    /* ---------------------------------------------------------------------- */

    /**
     * Do not automatically change a suspended employee.
     *
     * Suspension is a deliberate state and should be
     * handled explicitly through updateEmployee().
     */
    if (
      employee.status ===
      "suspended"
    ) {
      return {
        success: false,
        error:
          "Suspended employees must be updated explicitly.",
      };
    }

    /* ---------------------------------------------------------------------- */
    /* Calculate Next Status                                                  */
    /* ---------------------------------------------------------------------- */

    const nextStatus =
      employee.status === "active"
        ? "inactive"
        : "active";

    /* ---------------------------------------------------------------------- */
    /* Update Status                                                          */
    /* ---------------------------------------------------------------------- */

    const {
      data,
      error,
    } = await supabase
      .from("employees")
      .update({
        status: nextStatus,
      })
      .eq("id", id)
      .eq("company_id", companyId)
      .select(EMPLOYEE_SELECT)
      .single();

    if (error) {
      console.error(
        "toggleEmployeeStatus update error:",
        error,
      );

      return {
        success: false,
        error:
          "Failed to update employee status.",
      };
    }

    return {
      success: true,
      data: mapEmployee(
        data as unknown as EmployeeRow,
      ),
    };
  } catch (error) {
    console.error(
      "toggleEmployeeStatus unexpected error:",
      error,
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong while changing the employee status.",
    };
  }
}