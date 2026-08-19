"use server";

import {
  createSupabaseServerClient,
} from "@/lib/db/server";

import {
  requireCurrentUser,
} from "@/lib/auth";

import {
  employeeCreateSchema,
  employeeUpdateSchema,
  type EmployeeCreateInput,
  type EmployeeUpdateInput,
} from "@/lib/validations/employees-schema";

import type {
  Employee,
  EmployeeStatus,
} from "@/lib/types";

/* -------------------------------------------------------------------------- */
/* Database Types                                                             */
/* -------------------------------------------------------------------------- */

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

  salary: number | string | null;

  birthdate: string | null;

  next_of_kin_name: string | null;
  next_of_kin_phone: string | null;

  guarantor_name: string | null;
  guarantor_phone: string | null;

  status: EmployeeDbStatus;

  created_at: string;
  updated_at: string;
};

/* -------------------------------------------------------------------------- */
/* Action Result                                                              */
/* -------------------------------------------------------------------------- */

export type EmployeeActionResult<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
};

/* -------------------------------------------------------------------------- */
/* Shared Select                                                              */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Authorization                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Employees belong to a company.
 *
 * CompanyAdmin can manage employees belonging
 * only to their own company.
 *
 * SuperAdmin is not allowed through this helper
 * because employee management is tenant-level.
 */
async function requireEmployeeManagementAccess() {
  const currentUser =
    await requireCurrentUser();

  if (
    currentUser.role !== "CompanyAdmin"
  ) {
    throw new Error(
      "You are not authorized to manage employees.",
    );
  }

  if (!currentUser.companyId) {
    throw new Error(
      "Your account is not associated with a company.",
    );
  }

  return currentUser;
}

/* -------------------------------------------------------------------------- */
/* Mapping Helpers                                                            */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Map Employee                                                              */
/* -------------------------------------------------------------------------- */

function mapEmployee(
  row: EmployeeRow,
): Employee {
  return {
    id: row.id,

    companyId: row.company_id,

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
      row.salary === null
        ? null
        : Number(row.salary),

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
      mapEmployeeStatus(row.status),

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  };
}

/* -------------------------------------------------------------------------- */
/* GET ALL EMPLOYEES                                                          */
/* -------------------------------------------------------------------------- */

export async function getEmployees(): Promise<
  EmployeeActionResult<Employee[]>
> {
  try {
    const currentUser =
      await requireEmployeeManagementAccess();

    const supabase =
      await createSupabaseServerClient();

    const {
      data,
      error,
    } = await supabase
      .from("employees")
      .select(EMPLOYEE_SELECT)
      .eq(
        "company_id",
        currentUser.companyId,
      )
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
        "Something went wrong while fetching employees.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* GET EMPLOYEE BY ID                                                         */
/* -------------------------------------------------------------------------- */

export async function getEmployeeById(
  id: string,
): Promise<EmployeeActionResult<Employee>> {
  try {
    if (!id?.trim()) {
      return {
        success: false,
        error:
          "Employee ID is required.",
      };
    }

    const currentUser =
      await requireEmployeeManagementAccess();

    const supabase =
      await createSupabaseServerClient();

    const {
      data,
      error,
    } = await supabase
      .from("employees")
      .select(EMPLOYEE_SELECT)
      .eq("id", id)
      .eq(
        "company_id",
        currentUser.companyId,
      )
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
        "Something went wrong while fetching the employee.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* CREATE EMPLOYEE                                                            */
/* -------------------------------------------------------------------------- */

export async function createEmployee(
  input: EmployeeCreateInput,
): Promise<EmployeeActionResult<Employee>> {
  try {
    const currentUser =
      await requireEmployeeManagementAccess();

    const validation =
      employeeCreateSchema.safeParse(input);

    if (!validation.success) {
      return {
        success: false,
        error:
          validation.error.issues[0]?.message ??
          "Invalid employee data.",
      };
    }

    const values =
      validation.data;

    const supabase =
      await createSupabaseServerClient();

    const {
      data,
      error,
    } = await supabase
      .from("employees")
      .insert({
        company_id:
          currentUser.companyId,

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
          "active",
      })
      .select(EMPLOYEE_SELECT)
      .single();

    if (error) {
      console.error(
        "createEmployee error:",
        error,
      );

      if (error.code === "23505") {
        return {
          success: false,
          error:
            "An employee with this employee number already exists.",
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
        "Something went wrong while creating the employee.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* UPDATE EMPLOYEE                                                            */
/* -------------------------------------------------------------------------- */

export async function updateEmployee(
  id: string,
  input: EmployeeUpdateInput,
): Promise<EmployeeActionResult<Employee>> {
  try {
    if (!id?.trim()) {
      return {
        success: false,
        error:
          "Employee ID is required.",
      };
    }

    const currentUser =
      await requireEmployeeManagementAccess();

    const validation =
      employeeUpdateSchema.safeParse(input);

    if (!validation.success) {
      return {
        success: false,
        error:
          validation.error.issues[0]?.message ??
          "Invalid employee data.",
      };
    }

    const values =
      validation.data;

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
      .eq(
        "company_id",
        currentUser.companyId,
      )
      .select(EMPLOYEE_SELECT)
      .maybeSingle();

    if (error) {
      console.error(
        "updateEmployee error:",
        error,
      );

      if (error.code === "23505") {
        return {
          success: false,
          error:
            "An employee with this employee number already exists.",
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
        "Something went wrong while updating the employee.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* DELETE EMPLOYEE                                                            */
/* -------------------------------------------------------------------------- */

export async function deleteEmployee(
  id: string,
): Promise<EmployeeActionResult> {
  try {
    if (!id?.trim()) {
      return {
        success: false,
        error:
          "Employee ID is required.",
      };
    }

    const currentUser =
      await requireEmployeeManagementAccess();

    const supabase =
      await createSupabaseServerClient();

    /*
     * We deliberately check company_id here.
     *
     * This prevents CompanyAdmin A from deleting
     * an employee belonging to Company B.
     */
    const {
      data,
      error,
    } = await supabase
      .from("employees")
      .delete()
      .eq("id", id)
      .eq(
        "company_id",
        currentUser.companyId,
      )
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
        "Something went wrong while deleting the employee.",
    };
  }
}