"use server";

import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/db/server";

import {
  companyCreateSchema,
  companyUpdateSchema,
  type CompanyCreateInput,
  type CompanyUpdateInput,
} from "@/lib/validations/company-schema";

import {
  companyWithAdminCreateSchema,
  type CompanyWithAdminCreateInput,
} from "@/lib/validations/company-with-admin-schema";

import {
  requireCurrentUser,
  requireSuperAdmin,
} from "@/lib/auth";

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

export type CompanyActionResult<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
};

/* -------------------------------------------------------------------------- */
/* Shared Select                                                              */
/* -------------------------------------------------------------------------- */

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
/* Authorization                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Company management at the platform level is restricted
 * to SuperAdmin users.
 */
async function requireCompanyManagementAccess() {
  const currentUser = await requireCurrentUser();

  requireSuperAdmin(currentUser);

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
   * Other statuses are not considered current.
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
      product?.product_type ?? null,
    ),

    subscriptionStatus:
      mapCompanySubscriptionStatus(
        currentSubscription?.status ?? null,
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
    await requireCompanyManagementAccess();

    const supabase =
      await createSupabaseServerClient();

    const { data, error } =
      await supabase
        .from("companies")
        .select(COMPANY_SELECT)
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      console.error(
        "getCompanies error:",
        error,
      );

      return {
        success: false,
        error: "Failed to fetch companies.",
      };
    }

    const rows =
      (data ??
        []) as unknown as CompanyWithSubscriptionsRow[];

    return {
      success: true,
      data: rows.map(mapCompany),
    };
  } catch (error) {
    console.error(
      "getCompanies unexpected error:",
      error,
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
  id: string,
): Promise<CompanyActionResult<Company>> {
  try {
    if (!id?.trim()) {
      return {
        success: false,
        error: "Company ID is required.",
      };
    }

    await requireCompanyManagementAccess();

    const supabase =
      await createSupabaseServerClient();

    const { data, error } =
      await supabase
        .from("companies")
        .select(COMPANY_SELECT)
        .eq("id", id)
        .single();

    if (error) {
      console.error(
        "getCompanyById error:",
        error,
      );

      return {
        success: false,
        error:
          error.code === "PGRST116"
            ? "Company not found."
            : "Failed to fetch company.",
      };
    }

    return {
      success: true,
      data: mapCompany(
        data as unknown as CompanyWithSubscriptionsRow,
      ),
    };
  } catch (error) {
    console.error(
      "getCompanyById unexpected error:",
      error,
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

/**
 * Creates a company only.
 *
 * This action does NOT create:
 * - Supabase Auth user
 * - company_admins record
 *
 * Normal onboarding should use createCompanyWithAdmin().
 */
export async function createCompany(
  input: CompanyCreateInput,
): Promise<CompanyActionResult<Company>> {
  try {
    await requireCompanyManagementAccess();

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
      await createSupabaseServerClient();

    const { data, error } =
      await supabase
        .from("companies")
        .insert({
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
            values.registrationNumber || null,
        })
        .select(COMPANY_SELECT)
        .single();

    if (error) {
      console.error(
        "createCompany error:",
        error,
      );

      return {
        success: false,
        error: "Failed to create company.",
      };
    }

    return {
      success: true,
      data: mapCompany(
        data as unknown as CompanyWithSubscriptionsRow,
      ),
    };
  } catch (error) {
    console.error(
      "createCompany unexpected error:",
      error,
    );

    return {
      success: false,
      error:
        "Something went wrong while creating the company.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* CREATE COMPANY + INITIAL ADMIN                                             */
/* -------------------------------------------------------------------------- */

/**
 * Creates:
 *
 * 1. public.companies
 * 2. auth.users
 * 3. public.company_admins
 *
 * The admin password is sent only to Supabase Auth.
 * It is NEVER stored in public.company_admins.
 */
export async function createCompanyWithAdmin(
  input: CompanyWithAdminCreateInput,
): Promise<CompanyActionResult<Company>> {
  let createdCompanyId: string | null = null;
  let createdAuthUserId: string | null = null;

  try {
    /* ---------------------------------------------------------------------- */
    /* Authorization                                                          */
    /* ---------------------------------------------------------------------- */

    await requireCompanyManagementAccess();

    /* ---------------------------------------------------------------------- */
    /* Validation                                                             */
    /* ---------------------------------------------------------------------- */

    const validation =
      companyWithAdminCreateSchema.safeParse(
        input,
      );

    if (!validation.success) {
      return {
        success: false,
        error:
          validation.error.issues[0]?.message ??
          "Invalid company onboarding data.",
      };
    }

    const values = validation.data;

    /* ---------------------------------------------------------------------- */
    /* Clients                                                                */
    /* ---------------------------------------------------------------------- */

    const supabase =
      await createSupabaseServerClient();

    const supabaseAdmin =
      createSupabaseAdminClient();

    /* ---------------------------------------------------------------------- */
    /* 1. CREATE COMPANY                                                      */
    /* ---------------------------------------------------------------------- */

    const {
      data: company,
      error: companyError,
    } = await supabase
      .from("companies")
      .insert({
        company_name:
          values.company.companyName,

        display_name:
          values.company.displayName,

        email:
          values.company.email,

        phone:
          values.company.phone || null,

        address:
          values.company.address || null,

        tin:
          values.company.tin || null,

        registration_number:
          values.company.registrationNumber ||
          null,
      })
      .select("id")
      .single();

    if (companyError || !company) {
      console.error(
        "createCompanyWithAdmin company error:",
        companyError,
      );

      return {
        success: false,
        error: "Failed to create company.",
      };
    }

    createdCompanyId = company.id;

    /* ---------------------------------------------------------------------- */
    /* 2. CREATE SUPABASE AUTH USER                                           */
    /* ---------------------------------------------------------------------- */

    const {
      data: authData,
      error: authError,
    } =
      await supabaseAdmin.auth.admin.createUser({
        email: values.admin.email,
        password: values.admin.password,

        /*
         * Since this account is created by a SuperAdmin,
         * email confirmation is handled here.
         */
        email_confirm: true,

        /*
         * Application-level authorization metadata.
         */
        app_metadata: {
          role: "CompanyAdmin",
          company_id: createdCompanyId,
        },
      });

    if (authError || !authData.user) {
      console.error(
        "createCompanyWithAdmin auth error:",
        authError,
      );

      /*
       * Auth creation failed.
       *
       * Remove the company that was created
       * in step 1.
       */
      await supabase
        .from("companies")
        .delete()
        .eq("id", createdCompanyId);

      createdCompanyId = null;

      return {
        success: false,
        error:
          authError?.message ??
          "Failed to create company admin account.",
      };
    }

    createdAuthUserId =
      authData.user.id;

    /* ---------------------------------------------------------------------- */
    /* 3. CREATE COMPANY ADMIN                                                */
    /* ---------------------------------------------------------------------- */

    const {
      data: companyAdmin,
      error: companyAdminError,
    } =
      await supabase
        .from("company_admins")
        .insert({
          auth_user_id: createdAuthUserId,
          company_id: createdCompanyId,
          status: "active",
        })
        .select("id")
        .single();

    if (
      companyAdminError ||
      !companyAdmin
    ) {
      console.error(
        "createCompanyWithAdmin company_admin error:",
        companyAdminError,
      );

      /*
       * Roll back Auth user.
       */
      await supabaseAdmin.auth.admin.deleteUser(
        createdAuthUserId,
      );

      /*
       * Roll back company.
       */
      await supabase
        .from("companies")
        .delete()
        .eq("id", createdCompanyId);

      createdAuthUserId = null;
      createdCompanyId = null;

      return {
        success: false,
        error:
          "Failed to create company administrator.",
      };
    }

    /* ---------------------------------------------------------------------- */
    /* 4. FETCH FINAL COMPANY                                                */
    /* ---------------------------------------------------------------------- */

    const {
      data: completeCompany,
      error: completeCompanyError,
    } = await supabase
      .from("companies")
      .select(COMPANY_SELECT)
      .eq("id", createdCompanyId)
      .single();

    if (
      completeCompanyError ||
      !completeCompany
    ) {
      console.error(
        "createCompanyWithAdmin fetch error:",
        completeCompanyError,
      );

      return {
        success: false,
        error:
          "Company was created, but failed to load the final company record.",
      };
    }

    return {
      success: true,
      data: mapCompany(
        completeCompany as unknown as CompanyWithSubscriptionsRow,
      ),
    };
  } catch (error) {
    console.error(
      "createCompanyWithAdmin unexpected error:",
      error,
    );

    /* ---------------------------------------------------------------------- */
    /* BEST-EFFORT ROLLBACK                                                   */
    /* ---------------------------------------------------------------------- */

    try {
      const supabase =
        await createSupabaseServerClient();

      const supabaseAdmin =
        createSupabaseAdminClient();

      if (createdAuthUserId) {
        await supabaseAdmin.auth.admin.deleteUser(
          createdAuthUserId,
        );
      }

      if (createdCompanyId) {
        await supabase
          .from("companies")
          .delete()
          .eq("id", createdCompanyId);
      }
    } catch (cleanupError) {
      console.error(
        "createCompanyWithAdmin cleanup error:",
        cleanupError,
      );
    }

    return {
      success: false,
      error:
        "Something went wrong while creating the company and administrator.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/* UPDATE COMPANY                                                             */
/* -------------------------------------------------------------------------- */

export async function updateCompany(
  id: string,
  input: CompanyUpdateInput,
): Promise<CompanyActionResult<Company>> {
  try {
    if (!id?.trim()) {
      return {
        success: false,
        error: "Company ID is required.",
      };
    }

    await requireCompanyManagementAccess();

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
      await createSupabaseServerClient();

    const { data, error } =
      await supabase
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
            values.registrationNumber || null,

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
        error,
      );

      return {
        success: false,
        error:
          error.code === "PGRST116"
            ? "Company not found."
            : "Failed to update company.",
      };
    }

    return {
      success: true,
      data: mapCompany(
        data as unknown as CompanyWithSubscriptionsRow,
      ),
    };
  } catch (error) {
    console.error(
      "updateCompany unexpected error:",
      error,
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
  id: string,
): Promise<CompanyActionResult> {
  try {
    if (!id?.trim()) {
      return {
        success: false,
        error: "Company ID is required.",
      };
    }

    await requireCompanyManagementAccess();

    const supabase =
      await createSupabaseServerClient();

    const { data, error } =
      await supabase
        .from("companies")
        .delete()
        .eq("id", id)
        .select("id")
        .maybeSingle();

    if (error) {
      console.error(
        "deleteCompany error:",
        error,
      );

      return {
        success: false,
        error: "Failed to delete company.",
      };
    }

    if (!data) {
      return {
        success: false,
        error: "Company not found.",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "deleteCompany unexpected error:",
      error,
    );

    return {
      success: false,
      error:
        "Something went wrong while deleting the company.",
    };
  }
}