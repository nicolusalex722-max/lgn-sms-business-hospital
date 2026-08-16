"use server";

import {
  createSupabaseServerClient,
} from "@/lib/db/server";

import {
  requireCurrentUser,
} from "@/lib/auth";

import {
  branchCreateSchema,
  branchUpdateSchema,
  type BranchCreateInput,
  type BranchUpdateInput,
} from "@/lib/validations/branches-schema";

import type {
  Branch,
  BranchStatus,
} from "@/lib/types";

/* -------------------------------------------------------------------------- */
/* Database Types                                                             */
/* -------------------------------------------------------------------------- */

type BranchDbStatus =
  | "active"
  | "inactive";


type BranchRow = {
  id: string;
  company_id: string;
  branch_name: string;
  branch_code: string;
  location: string | null;
  status: BranchDbStatus;
  created_at: string;
  updated_at: string;
};


/* -------------------------------------------------------------------------- */
/* Action Result                                                              */
/* -------------------------------------------------------------------------- */

export type BranchActionResult<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
};


/* -------------------------------------------------------------------------- */
/* Shared Select                                                              */
/* -------------------------------------------------------------------------- */

const BRANCH_SELECT = `
  id,
  company_id,
  branch_name,
  branch_code,
  location,
  status,
  created_at,
  updated_at
`;


/* -------------------------------------------------------------------------- */
/* Authorization                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Ensures that the authenticated user:
 *
 * 1. Is logged in.
 * 2. Is a CompanyAdmin.
 * 3. Belongs to a company.
 *
 * The company ID is obtained from the authenticated
 * user's authorization context.
 *
 * It is NEVER supplied by the client.
 */
async function requireCompanyAdminAccess(): Promise<{
  userId: string;
  companyId: string;
}> {
  const currentUser =
    await requireCurrentUser();

  if (
    currentUser.role !==
    "CompanyAdmin"
  ) {
    throw new Error(
      "Only CompanyAdmin users can manage branches.",
    );
  }

  if (!currentUser.companyId) {
    throw new Error(
      "Authenticated CompanyAdmin is not associated with a company.",
    );
  }

  return {
    userId: currentUser.id,
    companyId:
      currentUser.companyId,
  };
}


/* -------------------------------------------------------------------------- */
/* Mapping Helpers                                                            */
/* -------------------------------------------------------------------------- */

function mapBranchStatus(
  status: BranchDbStatus,
): BranchStatus {
  switch (status) {
    case "active":
      return "Active";

    case "inactive":
      return "Inactive";
  }
}


/* -------------------------------------------------------------------------- */
/* Map Branch                                                                */
/* -------------------------------------------------------------------------- */

function mapBranch(
  row: BranchRow,
): Branch {
  return {
    id: row.id,

    companyId:
      row.company_id,

    branchName:
      row.branch_name,

    branchCode:
      row.branch_code,

    location:
      row.location,

    status:
      mapBranchStatus(
        row.status,
      ),

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  };
}


/* -------------------------------------------------------------------------- */
/* GET ALL BRANCHES                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Returns ONLY branches belonging to the authenticated
 * CompanyAdmin's company.
 */
export async function getBranches(): Promise<
  BranchActionResult<Branch[]>
> {
  try {
    const {
      companyId,
    } =
      await requireCompanyAdminAccess();

    const supabase =
      await createSupabaseServerClient();

    const {
      data,
      error,
    } =
      await supabase
        .from("branches")
        .select(
          BRANCH_SELECT,
        )
        .eq(
          "company_id",
          companyId,
        )
        .order(
          "created_at",
          {
            ascending: false,
          },
        );

    if (error) {
      console.error(
        "getBranches error:",
        error,
      );

      return {
        success: false,
        error:
          "Failed to fetch branches.",
      };
    }

    const rows =
      (data ??
        []) as unknown as BranchRow[];

    return {
      success: true,
      data: rows.map(
        mapBranch,
      ),
    };
  } catch (error) {
    console.error(
      "getBranches unexpected error:",
      error,
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong while fetching branches.",
    };
  }
}


/* -------------------------------------------------------------------------- */
/* GET BRANCH BY ID                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Fetches one branch.
 *
 * The company filter is mandatory so that a CompanyAdmin
 * cannot access another company's branch by UUID.
 */
export async function getBranchById(
  id: string,
): Promise<
  BranchActionResult<Branch>
> {
  try {
    if (!id?.trim()) {
      return {
        success: false,
        error:
          "Branch ID is required.",
      };
    }

    const {
      companyId,
    } =
      await requireCompanyAdminAccess();

    const supabase =
      await createSupabaseServerClient();

    const {
      data,
      error,
    } =
      await supabase
        .from("branches")
        .select(
          BRANCH_SELECT,
        )
        .eq(
          "id",
          id,
        )
        .eq(
          "company_id",
          companyId,
        )
        .maybeSingle();

    if (error) {
      console.error(
        "getBranchById error:",
        error,
      );

      return {
        success: false,
        error:
          "Failed to fetch branch.",
      };
    }

    if (!data) {
      return {
        success: false,
        error:
          "Branch not found.",
      };
    }

    return {
      success: true,
      data: mapBranch(
        data as unknown as BranchRow,
      ),
    };
  } catch (error) {
    console.error(
      "getBranchById unexpected error:",
      error,
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong while fetching the branch.",
    };
  }
}


/* -------------------------------------------------------------------------- */
/* CREATE BRANCH                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Creates a branch for the authenticated CompanyAdmin's company.
 *
 * company_id comes from the authenticated user's
 * authorization context.
 */
export async function createBranch(
  input: BranchCreateInput,
): Promise<
  BranchActionResult<Branch>
> {
  try {
    const {
      companyId,
    } =
      await requireCompanyAdminAccess();

    /* ---------------------------------------------------------------------- */
    /* Validation                                                             */
    /* ---------------------------------------------------------------------- */

    const validation =
      branchCreateSchema.safeParse(
        input,
      );

    if (!validation.success) {
      return {
        success: false,
        error:
          validation.error.issues[0]
            ?.message ??
          "Invalid branch data.",
      };
    }

    const values =
      validation.data;

    const supabase =
      await createSupabaseServerClient();

    /* ---------------------------------------------------------------------- */
    /* Insert                                                                 */
    /* ---------------------------------------------------------------------- */

    const {
      data,
      error,
    } =
      await supabase
        .from("branches")
        .insert({
          company_id:
            companyId,

          branch_name:
            values.branchName,

          branch_code:
            values.branchCode,

          location:
            values.location ||
            null,

          status:
            "active",
        })
        .select(
          BRANCH_SELECT,
        )
        .single();

    if (error) {
      console.error(
        "createBranch error:",
        error,
      );

      if (
        error.code ===
        "23505"
      ) {
        return {
          success: false,
          error:
            "A branch with this code already exists in your company.",
        };
      }

      return {
        success: false,
        error:
          "Failed to create branch.",
      };
    }

    return {
      success: true,
      data: mapBranch(
        data as unknown as BranchRow,
      ),
    };
  } catch (error) {
    console.error(
      "createBranch unexpected error:",
      error,
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong while creating the branch.",
    };
  }
}


/* -------------------------------------------------------------------------- */
/* UPDATE BRANCH                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Updates a branch belonging ONLY to the authenticated
 * CompanyAdmin's company.
 *
 * company_id cannot be changed through this action.
 */
export async function updateBranch(
  id: string,
  input: BranchUpdateInput,
): Promise<
  BranchActionResult<Branch>
> {
  try {
    if (!id?.trim()) {
      return {
        success: false,
        error:
          "Branch ID is required.",
      };
    }

    const {
      companyId,
    } =
      await requireCompanyAdminAccess();

    /* ---------------------------------------------------------------------- */
    /* Validation                                                             */
    /* ---------------------------------------------------------------------- */

    const validation =
      branchUpdateSchema.safeParse(
        input,
      );

    if (!validation.success) {
      return {
        success: false,
        error:
          validation.error.issues[0]
            ?.message ??
          "Invalid branch data.",
      };
    }

    const values =
      validation.data;

    const supabase =
      await createSupabaseServerClient();

    /* ---------------------------------------------------------------------- */
    /* Update                                                                 */
    /* ---------------------------------------------------------------------- */

    const {
      data,
      error,
    } =
      await supabase
        .from("branches")
        .update({
          branch_name:
            values.branchName,

          branch_code:
            values.branchCode,

          location:
            values.location ||
            null,

          status:
            values.status ===
            "Active"
              ? "active"
              : "inactive",
        })
        .eq(
          "id",
          id,
        )
        .eq(
          "company_id",
          companyId,
        )
        .select(
          BRANCH_SELECT,
        )
        .maybeSingle();

    if (error) {
      console.error(
        "updateBranch error:",
        error,
      );

      if (
        error.code ===
        "23505"
      ) {
        return {
          success: false,
          error:
            "A branch with this code already exists in your company.",
        };
      }

      return {
        success: false,
        error:
          "Failed to update branch.",
      };
    }

    if (!data) {
      return {
        success: false,
        error:
          "Branch not found.",
      };
    }

    return {
      success: true,
      data: mapBranch(
        data as unknown as BranchRow,
      ),
    };
  } catch (error) {
    console.error(
      "updateBranch unexpected error:",
      error,
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong while updating the branch.",
    };
  }
}


/* -------------------------------------------------------------------------- */
/* DELETE BRANCH                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Deletes a branch belonging ONLY to the authenticated
 * CompanyAdmin's company.
 */
export async function deleteBranch(
  id: string,
): Promise<
  BranchActionResult
> {
  try {
    if (!id?.trim()) {
      return {
        success: false,
        error:
          "Branch ID is required.",
      };
    }

    const {
      companyId,
    } =
      await requireCompanyAdminAccess();

    const supabase =
      await createSupabaseServerClient();

    const {
      data,
      error,
    } =
      await supabase
        .from("branches")
        .delete()
        .eq(
          "id",
          id,
        )
        .eq(
          "company_id",
          companyId,
        )
        .select("id")
        .maybeSingle();

    if (error) {
      console.error(
        "deleteBranch error:",
        error,
      );

      return {
        success: false,
        error:
          "Failed to delete branch.",
      };
    }

    if (!data) {
      return {
        success: false,
        error:
          "Branch not found.",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "deleteBranch unexpected error:",
      error,
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong while deleting the branch.",
    };
  }
}


/* -------------------------------------------------------------------------- */
/* TOGGLE BRANCH STATUS                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Toggles a branch between:
 *
 * active
 * inactive
 */
export async function toggleBranchStatus(
  id: string,
): Promise<
  BranchActionResult<Branch>
> {
  try {
    if (!id?.trim()) {
      return {
        success: false,
        error:
          "Branch ID is required.",
      };
    }

    const {
      companyId,
    } =
      await requireCompanyAdminAccess();

    const supabase =
      await createSupabaseServerClient();

    /* ---------------------------------------------------------------------- */
    /* Get current status                                                     */
    /* ---------------------------------------------------------------------- */

    const {
      data: branch,
      error: fetchError,
    } =
      await supabase
        .from("branches")
        .select(
          `
            id,
            company_id,
            status
          `,
        )
        .eq(
          "id",
          id,
        )
        .eq(
          "company_id",
          companyId,
        )
        .maybeSingle();

    if (fetchError) {
      console.error(
        "toggleBranchStatus fetch error:",
        fetchError,
      );

      return {
        success: false,
        error:
          "Failed to fetch branch.",
      };
    }

    if (!branch) {
      return {
        success: false,
        error:
          "Branch not found.",
      };
    }

    const nextStatus =
      branch.status ===
      "active"
        ? "inactive"
        : "active";

    /* ---------------------------------------------------------------------- */
    /* Update status                                                          */
    /* ---------------------------------------------------------------------- */

    const {
      data,
      error,
    } =
      await supabase
        .from("branches")
        .update({
          status:
            nextStatus,
        })
        .eq(
          "id",
          id,
        )
        .eq(
          "company_id",
          companyId,
        )
        .select(
          BRANCH_SELECT,
        )
        .single();

    if (error) {
      console.error(
        "toggleBranchStatus update error:",
        error,
      );

      return {
        success: false,
        error:
          "Failed to update branch status.",
      };
    }

    return {
      success: true,
      data: mapBranch(
        data as unknown as BranchRow,
      ),
    };
  } catch (error) {
    console.error(
      "toggleBranchStatus unexpected error:",
      error,
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong while changing the branch status.",
    };
  }
}