"use server";

import { createSupabaseServerClient } from "@/lib/db/server";

import {
  companySubscriptionCreateSchema,
  companySubscriptionUpdateSchema,
  type CompanySubscriptionCreateInput,
  type CompanySubscriptionUpdateInput,
} from "../validations/company-subscription-schema";

import type {
  CompanySubscription,
  CompanySubscriptionStatus,
} from "@/lib/types";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type CompanySubscriptionDbStatus =
  | "trial"
  | "active"
  | "suspended"
  | "expired"
  | "cancelled";

type CompanySubscriptionRow = {
  id: string;
  company_id: string;
  product_id: string;
  subscription_plan_id: string;
  status: CompanySubscriptionDbStatus;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
};

export type CompanySubscriptionActionResult<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
};

/* -------------------------------------------------------------------------- */
/* Select                                                                     */
/* -------------------------------------------------------------------------- */

const COMPANY_SUBSCRIPTION_SELECT = `
  id,
  company_id,
  product_id,
  subscription_plan_id,
  status,
  start_date,
  end_date,
  created_at,
  updated_at
`;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function mapCompanySubscription(
  row: CompanySubscriptionRow
): CompanySubscription {
  return {
    id: row.id,
    companyId: row.company_id,
    productId: row.product_id,
    subscriptionPlanId: row.subscription_plan_id,

    status:
      row.status === "trial"
        ? "Trial"
        : row.status === "active"
          ? "Active"
          : row.status === "suspended"
            ? "Suspended"
            : row.status === "expired"
              ? "Expired"
              : "Cancelled",

    startDate: row.start_date,
    endDate: row.end_date,

    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/* -------------------------------------------------------------------------- */
/* Status Mapping                                                             */
/* -------------------------------------------------------------------------- */

function mapSubscriptionStatus(
  status: CompanySubscriptionStatus
): CompanySubscriptionDbStatus {
  switch (status) {
    case "Trial":
      return "trial";

    case "Active":
      return "active";

    case "Suspended":
      return "suspended";

    case "Expired":
      return "expired";

    case "Cancelled":
      return "cancelled";

    default:
      return "active";
  }
}

/* -------------------------------------------------------------------------- */
/* Date Mapping                                                               */
/* -------------------------------------------------------------------------- */

function normalizeEndDate(
  endDate: string | null | undefined
): string | null {
  if (!endDate || endDate.trim() === "") {
    return null;
  }

  return endDate;
}

/* -------------------------------------------------------------------------- */
/* Validation Error                                                           */
/* -------------------------------------------------------------------------- */

function getValidationError(
  error: {
    issues: Array<{ message?: string }>;
  },
  fallback: string
): string {
  return error.issues[0]?.message ?? fallback;
}

/* -------------------------------------------------------------------------- */
/* GET ALL                                                                    */
/* -------------------------------------------------------------------------- */

export async function getCompanySubscriptions(): Promise<
  CompanySubscriptionActionResult<CompanySubscription[]>
> {
  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("company_subscriptions")
      .select(COMPANY_SUBSCRIPTION_SELECT)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "getCompanySubscriptions error:",
        error
      );

      return {
        success: false,
        error:
          "Failed to fetch company subscriptions.",
      };
    }

    return {
      success: true,
      data: (
        data as CompanySubscriptionRow[]
      ).map(mapCompanySubscription),
    };
  } catch (error) {
    console.error(
      "getCompanySubscriptions unexpected error:",
      error
    );

    return {
      success: false,
      error:
        "Something went wrong while fetching company subscriptions.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* GET BY COMPANY ID                                                          */
/* -------------------------------------------------------------------------- */

export async function getCompanySubscriptionsByCompanyId(
  companyId: string
): Promise<
  CompanySubscriptionActionResult<CompanySubscription[]>
> {
  try {
    if (!companyId) {
      return {
        success: false,
        error: "Company ID is required.",
      };
    }

    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("company_subscriptions")
      .select(COMPANY_SUBSCRIPTION_SELECT)
      .eq("company_id", companyId)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "getCompanySubscriptionsByCompanyId error:",
        error
      );

      return {
        success: false,
        error:
          "Failed to fetch company subscriptions.",
      };
    }

    return {
      success: true,
      data: (
        data as CompanySubscriptionRow[]
      ).map(mapCompanySubscription),
    };
  } catch (error) {
    console.error(
      "getCompanySubscriptionsByCompanyId unexpected error:",
      error
    );

    return {
      success: false,
      error:
        "Something went wrong while fetching company subscriptions.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* GET BY ID                                                                  */
/* -------------------------------------------------------------------------- */

export async function getCompanySubscriptionById(
  id: string
): Promise<
  CompanySubscriptionActionResult<CompanySubscription>
> {
  try {
    if (!id) {
      return {
        success: false,
        error:
          "Company subscription ID is required.",
      };
    }

    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("company_subscriptions")
      .select(COMPANY_SUBSCRIPTION_SELECT)
      .eq("id", id)
      .single();

    if (error) {
      console.error(
        "getCompanySubscriptionById error:",
        error
      );

      return {
        success: false,
        error:
          error.code === "PGRST116"
            ? "Company subscription not found."
            : "Failed to fetch company subscription.",
      };
    }

    return {
      success: true,
      data: mapCompanySubscription(
        data as CompanySubscriptionRow
      ),
    };
  } catch (error) {
    console.error(
      "getCompanySubscriptionById unexpected error:",
      error
    );

    return {
      success: false,
      error:
        "Something went wrong while fetching the company subscription.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* CREATE                                                                     */
/* -------------------------------------------------------------------------- */

export async function createCompanySubscription(
  input: CompanySubscriptionCreateInput
): Promise<
  CompanySubscriptionActionResult<CompanySubscription>
> {
  try {
    /* ---------------------------------------------------------------------- */
    /* Validation                                                             */
    /* ---------------------------------------------------------------------- */

    const validation =
      companySubscriptionCreateSchema.safeParse(input);

    if (!validation.success) {
      return {
        success: false,
        error: getValidationError(
          validation.error,
          "Invalid company subscription data."
        ),
      };
    }

    const values = validation.data;

    const supabase =
      createSupabaseServerClient();

    /* ---------------------------------------------------------------------- */
    /* Insert                                                                 */
    /* ---------------------------------------------------------------------- */

    const { data, error } = await supabase
      .from("company_subscriptions")
      .insert({
        company_id: values.companyId,
        product_id: values.productId,
        subscription_plan_id:
          values.subscriptionPlanId,

        status: mapSubscriptionStatus(
          values.status
        ),

        start_date: values.startDate,

        end_date: normalizeEndDate(
          values.endDate
        ),
      })
      .select(COMPANY_SUBSCRIPTION_SELECT)
      .single();

    if (error) {
      console.error(
        "createCompanySubscription error:",
        error
      );

      return {
        success: false,
        error:
          "Failed to create company subscription.",
      };
    }

    return {
      success: true,
      data: mapCompanySubscription(
        data as CompanySubscriptionRow
      ),
    };
  } catch (error) {
    console.error(
      "createCompanySubscription unexpected error:",
      error
    );

    return {
      success: false,
      error:
        "Something went wrong while creating the company subscription.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* UPDATE                                                                     */
/* -------------------------------------------------------------------------- */

export async function updateCompanySubscription(
  id: string,
  input: CompanySubscriptionUpdateInput
): Promise<
  CompanySubscriptionActionResult<CompanySubscription>
> {
  try {
    if (!id) {
      return {
        success: false,
        error:
          "Company subscription ID is required.",
      };
    }

    /* ---------------------------------------------------------------------- */
    /* Validation                                                             */
    /* ---------------------------------------------------------------------- */

    const validation =
      companySubscriptionUpdateSchema.safeParse(
        input
      );

    if (!validation.success) {
      return {
        success: false,
        error: getValidationError(
          validation.error,
          "Invalid company subscription data."
        ),
      };
    }

    const values = validation.data;

    const supabase =
      createSupabaseServerClient();

    /* ---------------------------------------------------------------------- */
    /* Update                                                                 */
    /* ---------------------------------------------------------------------- */

    const { data, error } = await supabase
      .from("company_subscriptions")
      .update({
        company_id: values.companyId,
        product_id: values.productId,
        subscription_plan_id:
          values.subscriptionPlanId,

        status: mapSubscriptionStatus(
          values.status
        ),

        start_date: values.startDate,

        end_date: normalizeEndDate(
          values.endDate
        ),
      })
      .eq("id", id)
      .select(COMPANY_SUBSCRIPTION_SELECT)
      .single();

    if (error) {
      console.error(
        "updateCompanySubscription error:",
        error
      );

      return {
        success: false,
        error:
          error.code === "PGRST116"
            ? "Company subscription not found."
            : "Failed to update company subscription.",
      };
    }

    return {
      success: true,
      data: mapCompanySubscription(
        data as CompanySubscriptionRow
      ),
    };
  } catch (error) {
    console.error(
      "updateCompanySubscription unexpected error:",
      error
    );

    return {
      success: false,
      error:
        "Something went wrong while updating the company subscription.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* DELETE                                                                     */
/* -------------------------------------------------------------------------- */

export async function deleteCompanySubscription(
  id: string
): Promise<CompanySubscriptionActionResult> {
  try {
    if (!id) {
      return {
        success: false,
        error:
          "Company subscription ID is required.",
      };
    }

    const supabase =
      createSupabaseServerClient();

    const { error } = await supabase
      .from("company_subscriptions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(
        "deleteCompanySubscription error:",
        error
      );

      return {
        success: false,
        error:
          "Failed to delete company subscription.",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "deleteCompanySubscription unexpected error:",
      error
    );

    return {
      success: false,
      error:
        "Something went wrong while deleting the company subscription.",
    };
  }
}