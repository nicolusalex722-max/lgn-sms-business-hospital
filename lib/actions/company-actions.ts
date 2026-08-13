"use server";

import { createSupabaseServerClient } from "@/lib/db/server";

import {
  companyCreateSchema,
  companyUpdateSchema,
  type CompanyCreateInput,
  type CompanyUpdateInput,
} from "../validations/company-schema";

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

type CompanyWithSubscriptionsRow = CompanyRow & {
  company_subscriptions: CompanySubscriptionRow[];
};

/* -------------------------------------------------------------------------- */
/* Action Result                                                              */
/* -------------------------------------------------------------------------- */

export type CompanyActionResult<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
};

/* -------------------------------------------------------------------------- */
/* Shared Select                                                              */
/* -------------------------------------------------------------------------- */

/*
 * IMPORTANT:
 *
 * products.product_name is used here, NOT products.name.
 *
 * Your products table uses:
 *   product_name
 *   product_type
 */
const COMPANY_SELECT = `
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
/* Mapping Helpers                                                            */
/* -------------------------------------------------------------------------- */

function mapProductType(
  productType: ProductDbType | null
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
  status: CompanySubscriptionDbStatus | null
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
  status: CompanyDbStatus
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
  subscriptions: CompanySubscriptionRow[]
): CompanySubscriptionRow | null {
  /*
   * Prefer Active subscription.
   */
  const activeSubscription = subscriptions.find(
    (subscription) =>
      subscription.status === "active"
  );

  if (activeSubscription) {
    return activeSubscription;
  }

  /*
   * If there is no Active subscription,
   * use Trial subscription.
   */
  const trialSubscription = subscriptions.find(
    (subscription) =>
      subscription.status === "trial"
  );

  return trialSubscription ?? null;
}

/* -------------------------------------------------------------------------- */
/* Map Company                                                                */
/* -------------------------------------------------------------------------- */

function mapCompany(
  row: CompanyWithSubscriptionsRow
): Company {
  const subscriptions =
    row.company_subscriptions ?? [];

  const currentSubscription =
    getCurrentSubscription(subscriptions);

  const product =
    currentSubscription?.product ?? null;

  return {
    id: row.id,

    companyName: row.company_name,
    displayName: row.display_name,
    email: row.email,

    phone: row.phone,
    address: row.address,
    tin: row.tin,
    registrationNumber:
      row.registration_number,

    status: mapCompanyStatus(row.status),

    businessType: mapProductType(
      product?.product_type ?? null
    ),

    subscriptionStatus:
      mapCompanySubscriptionStatus(
        currentSubscription?.status ?? null
      ),

    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/* -------------------------------------------------------------------------- */
/* GET ALL COMPANIES                                                          */
/* -------------------------------------------------------------------------- */

export async function getCompanies(): Promise<
  CompanyActionResult<Company[]>
> {
  try {
    const supabase =
      createSupabaseServerClient();

    const { data, error } = await supabase
      .from("companies")
      .select(COMPANY_SELECT)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "getCompanies error:",
        error
      );

      return {
        success: false,
        error:
          "Failed to fetch companies.",
      };
    }

    /*
     * Supabase returns the nested relationship
     * as an array.
     */
    const rows =
      (data ?? []) as unknown as CompanyWithSubscriptionsRow[];

    const companies = rows.map(mapCompany);

    return {
      success: true,
      data: companies,
    };
  } catch (error) {
    console.error(
      "getCompanies unexpected error:",
      error
    );

    return {
      success: false,
      error:
        "Something went wrong while fetching companies.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* GET COMPANY BY ID                                                          */
/* -------------------------------------------------------------------------- */

export async function getCompanyById(
  id: string
): Promise<CompanyActionResult<Company>> {
  try {
    if (!id?.trim()) {
      return {
        success: false,
        error:
          "Company ID is required.",
      };
    }

    const supabase =
      createSupabaseServerClient();

    const { data, error } = await supabase
      .from("companies")
      .select(COMPANY_SELECT)
      .eq("id", id)
      .single();

    if (error) {
      console.error(
        "getCompanyById error:",
        error
      );

      return {
        success: false,
        error:
          error.code === "PGRST116"
            ? "Company not found."
            : "Failed to fetch company.",
      };
    }

    const row =
      data as unknown as CompanyWithSubscriptionsRow;

    return {
      success: true,
      data: mapCompany(row),
    };
  } catch (error) {
    console.error(
      "getCompanyById unexpected error:",
      error
    );

    return {
      success: false,
      error:
        "Something went wrong while fetching the company.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* CREATE COMPANY                                                             */
/* -------------------------------------------------------------------------- */

export async function createCompany(
  input: CompanyCreateInput
): Promise<CompanyActionResult<Company>> {
  try {
    const validation =
      companyCreateSchema.safeParse(input);

    if (!validation.success) {
      return {
        success: false,
        error:
          validation.error.issues[0]?.message ??
          "Invalid company data.",
      };
    }

    const values = validation.data;

    const supabase =
      createSupabaseServerClient();

    const { data, error } = await supabase
      .from("companies")
      .insert({
        company_name:
          values.companyName,

        display_name:
          values.displayName,

        email: values.email,

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
      .select(COMPANY_SELECT)
      .single();

    if (error) {
      console.error(
        "createCompany error:",
        error
      );

      return {
        success: false,
        error:
          "Failed to create company.",
      };
    }

    const row =
      data as unknown as CompanyWithSubscriptionsRow;

    return {
      success: true,
      data: mapCompany(row),
    };
  } catch (error) {
    console.error(
      "createCompany unexpected error:",
      error
    );

    return {
      success: false,
      error:
        "Something went wrong while creating the company.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* UPDATE COMPANY                                                             */
/* -------------------------------------------------------------------------- */

export async function updateCompany(
  id: string,
  input: CompanyUpdateInput
): Promise<CompanyActionResult<Company>> {
  try {
    if (!id?.trim()) {
      return {
        success: false,
        error:
          "Company ID is required.",
      };
    }

    const validation =
      companyUpdateSchema.safeParse(input);

    if (!validation.success) {
      return {
        success: false,
        error:
          validation.error.issues[0]?.message ??
          "Invalid company data.",
      };
    }

    const values = validation.data;

    const supabase =
      createSupabaseServerClient();

    const { data, error } = await supabase
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

        status:
          values.status === "Active"
            ? "active"
            : values.status === "Inactive"
              ? "inactive"
              : "suspended",
      })
      .eq("id", id)
      .select(COMPANY_SELECT)
      .single();

    if (error) {
      console.error(
        "updateCompany error:",
        error
      );

      return {
        success: false,
        error:
          error.code === "PGRST116"
            ? "Company not found."
            : "Failed to update company.",
      };
    }

    const row =
      data as unknown as CompanyWithSubscriptionsRow;

    return {
      success: true,
      data: mapCompany(row),
    };
  } catch (error) {
    console.error(
      "updateCompany unexpected error:",
      error
    );

    return {
      success: false,
      error:
        "Something went wrong while updating the company.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* DELETE COMPANY                                                             */
/* -------------------------------------------------------------------------- */

export async function deleteCompany(
  id: string
): Promise<CompanyActionResult> {
  try {
    if (!id?.trim()) {
      return {
        success: false,
        error:
          "Company ID is required.",
      };
    }

    const supabase =
      createSupabaseServerClient();

    const { data, error } = await supabase
      .from("companies")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error(
        "deleteCompany error:",
        error
      );

      return {
        success: false,
        error:
          "Failed to delete company.",
      };
    }

    if (!data) {
      return {
        success: false,
        error:
          "Company not found.",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "deleteCompany unexpected error:",
      error
    );

    return {
      success: false,
      error:
        "Something went wrong while deleting the company.",
    };
  }
}