"use server";

import {
  createSupabaseServerClient,
} from "@/lib/db/server";

import {
  requireCurrentUser,
} from "@/lib/auth";

import {
  companyProfileUpdateSchema,
  type CompanyProfileUpdateInput,
} from "@/lib/validations/company-profile-schema";

import type {
  Company,
  CompanyStatus,
  CompanySubscriptionStatus,
  ProductType,
} from "@/lib/types";

/* -------------------------------------------------------------------------- */
/* Database Types                                                             */
/* -------------------------------------------------------------------------- */

type CompanyDbStatus =
  | "active"
  | "inactive"
  | "suspended";

type ProductDbType =
  | "business"
  | "education"
  | "hospital";

type CompanySubscriptionDbStatus =
  | "trial"
  | "active"
  | "suspended"
  | "expired"
  | "cancelled";

type CompanyRow = {
  id: string;

  company_name: string;
  display_name: string;
  email: string;

  phone: string | null;
  address: string | null;
  tin: string | null;
  registration_number: string | null;

  status: CompanyDbStatus;

  created_at: string;
  updated_at: string;
};

type ProductRow = {
  id: string;
  product_name: string;
  product_type: ProductDbType;
};

type CompanySubscriptionRow = {
  id: string;

  product_id: string;
  subscription_plan_id: string;

  status: CompanySubscriptionDbStatus;

  start_date: string;
  end_date: string | null;

  created_at: string;
  updated_at: string;

  product: ProductRow | null;
};

type CompanyWithSubscriptionsRow =
  CompanyRow & {
    company_subscriptions:
      CompanySubscriptionRow[];
  };

/* -------------------------------------------------------------------------- */
/* Action Result                                                              */
/* -------------------------------------------------------------------------- */

export type CompanyProfileActionResult<
  T = null,
> = {
  success: boolean;
  data?: T;
  error?: string;
};

/* -------------------------------------------------------------------------- */
/* Shared Select                                                              */
/* -------------------------------------------------------------------------- */

const COMPANY_PROFILE_SELECT = `
  id,
  company_name,
  display_name,
  email,
  phone,
  address,
  tin,
  registration_number,
  status,
  created_at,
  updated_at,

  company_subscriptions (
    id,
    product_id,
    subscription_plan_id,
    status,
    start_date,
    end_date,
    created_at,
    updated_at,

    product:products (
      id,
      product_name,
      product_type
    )
  )
`;

/* -------------------------------------------------------------------------- */
/* Authorization                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Requires the currently authenticated user to be a CompanyAdmin.
 *
 * IMPORTANT:
 *
 * The company ID comes from the authenticated user's tenant context.
 *
 * The UI does NOT provide companyId.
 *
 * This prevents a CompanyAdmin from doing something like:
 *
 * getCompanyProfile("another-company-id")
 *
 * and attempting to access another tenant.
 */
async function requireCompanyAdminProfileAccess() {
  const currentUser =
    await requireCurrentUser();

  if (currentUser.role !== "CompanyAdmin") {
    throw new Error(
      "CompanyAdmin access is required.",
    );
  }

  if (!currentUser.companyId) {
    throw new Error(
      "No company is associated with this account.",
    );
  }

  return currentUser;
}

/* -------------------------------------------------------------------------- */
/* Mapping Helpers                                                            */
/* -------------------------------------------------------------------------- */

function mapProductType(
  productType: ProductDbType | null,
): ProductType | null {
  switch (productType) {
    case "business":
      return "Business";

    case "education":
      return "Education";

    case "hospital":
      return "Hospital";

    default:
      return null;
  }
}

function mapCompanySubscriptionStatus(
  status:
    | CompanySubscriptionDbStatus
    | null,
): CompanySubscriptionStatus | null {
  switch (status) {
    case "trial":
      return "Trial";

    case "active":
      return "Active";

    case "suspended":
      return "Suspended";

    case "expired":
      return "Expired";

    case "cancelled":
      return "Cancelled";

    default:
      return null;
  }
}

function mapCompanyStatus(
  status: CompanyDbStatus,
): CompanyStatus {
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
/* Current Subscription                                                       */
/* -------------------------------------------------------------------------- */

function getCurrentSubscription(
  subscriptions: CompanySubscriptionRow[],
): CompanySubscriptionRow | null {
  /*
   * Priority:
   *
   * 1. Active
   * 2. Trial
   *
   * Suspended, expired and cancelled
   * subscriptions are not considered current.
   */

  const activeSubscription =
    subscriptions.find(
      (subscription) =>
        subscription.status === "active",
    );

  if (activeSubscription) {
    return activeSubscription;
  }

  const trialSubscription =
    subscriptions.find(
      (subscription) =>
        subscription.status === "trial",
    );

  return trialSubscription ?? null;
}

/* -------------------------------------------------------------------------- */
/* Map Company                                                                */
/* -------------------------------------------------------------------------- */

function mapCompany(
  row: CompanyWithSubscriptionsRow,
): Company {
  const subscriptions =
    row.company_subscriptions ?? [];

  const currentSubscription =
    getCurrentSubscription(subscriptions);

  const product =
    currentSubscription?.product ?? null;

  return {
    id: row.id,

    companyName:
      row.company_name,

    displayName:
      row.display_name,

    email:
      row.email,

    phone:
      row.phone,

    address:
      row.address,

    tin:
      row.tin,

    registrationNumber:
      row.registration_number,

    status:
      mapCompanyStatus(
        row.status,
      ),

    businessType:
      mapProductType(
        product?.product_type ?? null,
      ),

    subscriptionStatus:
      mapCompanySubscriptionStatus(
        currentSubscription?.status ??
          null,
      ),

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  };
}

/* -------------------------------------------------------------------------- */
/* GET MY COMPANY PROFILE                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Returns the company belonging to the currently
 * authenticated CompanyAdmin.
 *
 * There is intentionally NO companyId parameter.
 *
 * Example:
 *
 * CompanyAdmin A
 *      ↓
 * currentUser.companyId = company-a
 *      ↓
 * companies.id = company-a
 *      ↓
 * Company A profile
 */
export async function getMyCompanyProfile(): Promise<
  CompanyProfileActionResult<Company>
> {
  try {
    /* ---------------------------------------------------------------------- */
    /* Authorization                                                          */
    /* ---------------------------------------------------------------------- */

    const currentUser =
      await requireCompanyAdminProfileAccess();

    /* ---------------------------------------------------------------------- */
    /* Database Client                                                        */
    /* ---------------------------------------------------------------------- */

    const supabase =
      await createSupabaseServerClient();

    /* ---------------------------------------------------------------------- */
    /* Fetch Company                                                          */
    /* ---------------------------------------------------------------------- */

    const {
      data,
      error,
    } = await supabase
      .from("companies")
      .select(
        COMPANY_PROFILE_SELECT,
      )
      .eq(
        "id",
        currentUser.companyId,
      )
      .single();

    /* ---------------------------------------------------------------------- */
    /* Handle Database Error                                                  */
    /* ---------------------------------------------------------------------- */

    if (error) {
      console.error(
        "getMyCompanyProfile error:",
        error,
      );

      if (
        error.code === "PGRST116"
      ) {
        return {
          success: false,
          error:
            "Your company profile could not be found.",
        };
      }

      return {
        success: false,
        error:
          "Failed to fetch company profile.",
      };
    }

    /* ---------------------------------------------------------------------- */
    /* Map Result                                                             */
    /* ---------------------------------------------------------------------- */

    const company =
      mapCompany(
        data as unknown as CompanyWithSubscriptionsRow,
      );

    return {
      success: true,
      data: company,
    };
  } catch (error) {
    console.error(
      "getMyCompanyProfile unexpected error:",
      error,
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong while fetching your company profile.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* UPDATE MY COMPANY PROFILE                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Updates the company profile belonging to
 * the currently authenticated CompanyAdmin.
 *
 * IMPORTANT:
 *
 * The caller cannot specify:
 *
 * - companyId
 * - status
 *
 * Both are protected by the server.
 */
export async function updateMyCompanyProfile(
  input: CompanyProfileUpdateInput,
): Promise<
  CompanyProfileActionResult<Company>
> {
  try {
    /* ---------------------------------------------------------------------- */
    /* Authorization                                                          */
    /* ---------------------------------------------------------------------- */

    const currentUser =
      await requireCompanyAdminProfileAccess();

    /* ---------------------------------------------------------------------- */
    /* Validation                                                             */
    /* ---------------------------------------------------------------------- */

    const validation =
      companyProfileUpdateSchema.safeParse(
        input,
      );

    if (!validation.success) {
      return {
        success: false,
        error:
          validation.error.issues[0]
            ?.message ??
          "Invalid company profile data.",
      };
    }

    const values =
      validation.data;

    /* ---------------------------------------------------------------------- */
    /* Database Client                                                        */
    /* ---------------------------------------------------------------------- */

    const supabase =
      await createSupabaseServerClient();

    /* ---------------------------------------------------------------------- */
    /* Update Company                                                         */
    /* ---------------------------------------------------------------------- */

    const {
      data,
      error,
    } = await supabase
      .from("companies")
      .update({
        company_name:
          values.companyName,

        display_name:
          values.displayName,

        email:
          values.email,

        phone:
          values.phone || null,

        address:
          values.address || null,

        tin:
          values.tin || null,

        registration_number:
          values.registrationNumber ||
          null,
      })
      .eq(
        "id",
        currentUser.companyId,
      )
      .select(
        COMPANY_PROFILE_SELECT,
      )
      .single();

    /* ---------------------------------------------------------------------- */
    /* Handle Database Error                                                  */
    /* ---------------------------------------------------------------------- */

    if (error) {
      console.error(
        "updateMyCompanyProfile error:",
        error,
      );

      if (
        error.code === "PGRST116"
      ) {
        return {
          success: false,
          error:
            "Your company profile could not be found.",
        };
      }

      return {
        success: false,
        error:
          "Failed to update company profile.",
      };
    }

    /* ---------------------------------------------------------------------- */
    /* Map Updated Company                                                    */
    /* ---------------------------------------------------------------------- */

    const company =
      mapCompany(
        data as unknown as CompanyWithSubscriptionsRow,
      );

    return {
      success: true,
      data: company,
    };
  } catch (error) {
    console.error(
      "updateMyCompanyProfile unexpected error:",
      error,
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong while updating your company profile.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* REFRESH MY COMPANY PROFILE                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Alias-style action intended for UI refreshes.
 *
 * Kept separate so the UI has a clear semantic operation:
 *
 *   fetch / refresh current tenant profile.
 */
export async function refreshMyCompanyProfile(): Promise<
  CompanyProfileActionResult<Company>
> {
  return getMyCompanyProfile();
}