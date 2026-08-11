"use server";

import { createSupabaseServerClient } from "@/lib/db/server";
import {
  subscriptionSchema,
  type SubscriptionFormData,
} from "../validations/sub-plan-schema";
import type {
  Subscription,
} from "@/lib/types";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type SubscriptionRow = {
  id: string;
  plan: string;
  status: "active" | "trial" | "expired" | "cancelled";
  amount: number;
  billing_cycle: "monthly" | "quarterly" | "yearly";
  start_date: string;
  created_at?: string;
  updated_at?: string;
};

export type SubscriptionActionResult<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
};

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function mapSubscription(
  row: SubscriptionRow
): Subscription {
  return {
    id: row.id,
    plan: row.plan,

    status:
      row.status === "active"
        ? "Active"
        : row.status === "trial"
        ? "Trial"
        : row.status === "expired"
        ? "Expired"
        : "Cancelled",

    amount: Number(row.amount),

    billingCycle:
      row.billing_cycle === "monthly"
        ? "Monthly"
        : row.billing_cycle === "quarterly"
        ? "Quarterly"
        : "Yearly",

    startDate: row.start_date,
  };
}

function mapSubscriptionStatus(
  status: SubscriptionFormData["status"]
): SubscriptionRow["status"] {
  return status.toLowerCase() as SubscriptionRow["status"];
}

function mapBillingCycle(
  billingCycle: SubscriptionFormData["billingCycle"]
): SubscriptionRow["billing_cycle"] {
  return billingCycle.toLowerCase() as SubscriptionRow["billing_cycle"];
}

// -----------------------------------------------------------------------------
// GET ALL SUBSCRIPTIONS
// -----------------------------------------------------------------------------

export async function getSubscriptions(): Promise<
  SubscriptionActionResult<Subscription[]>
> {
  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("subscription_plans")
      .select(`
        id,
        plan,
        status,
        amount,
        billing_cycle,
        start_date
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(
        "getSubscriptions error:",
        error
      );

      return {
        success: false,
        error: "Failed to fetch subscription plans.",
      };
    }

    const subscriptions = (
      data as SubscriptionRow[]
    ).map(mapSubscription);

    return {
      success: true,
      data: subscriptions,
    };
  } catch (error) {
    console.error(
      "getSubscriptions unexpected error:",
      error
    );

    return {
      success: false,
      error:
        "Something went wrong while fetching subscription plans.",
    };
  }
}

// -----------------------------------------------------------------------------
// GET SUBSCRIPTION BY ID
// -----------------------------------------------------------------------------

export async function getSubscriptionById(
  id: string
): Promise<SubscriptionActionResult<Subscription>> {
  try {
    if (!id) {
      return {
        success: false,
        error: "Subscription ID is required.",
      };
    }

    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("subscription_plans")
      .select(`
        id,
        plan,
        status,
        amount,
        billing_cycle,
        start_date
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error(
        "getSubscriptionById error:",
        error
      );

      return {
        success: false,
        error:
          error.code === "PGRST116"
            ? "Subscription plan not found."
            : "Failed to fetch subscription plan.",
      };
    }

    return {
      success: true,
      data: mapSubscription(
        data as SubscriptionRow
      ),
    };
  } catch (error) {
    console.error(
      "getSubscriptionById unexpected error:",
      error
    );

    return {
      success: false,
      error:
        "Something went wrong while fetching the subscription plan.",
    };
  }
}

// -----------------------------------------------------------------------------
// CREATE SUBSCRIPTION
// -----------------------------------------------------------------------------

export async function createSubscription(
  input: SubscriptionFormData
): Promise<SubscriptionActionResult<Subscription>> {
  try {
    const validation =
      subscriptionSchema.safeParse(input);

    if (!validation.success) {
      return {
        success: false,
        error:
          validation.error.issues[0]?.message ??
          "Invalid subscription data.",
      };
    }

    const values = validation.data;

    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("subscription_plans")
      .insert({
        plan: values.plan,
        status: mapSubscriptionStatus(values.status),
        amount: values.amount,
        billing_cycle: mapBillingCycle(
          values.billingCycle
        ),
        start_date: values.startDate,
      })
      .select(`
        id,
        plan,
        status,
        amount,
        billing_cycle,
        start_date
      `)
      .single();

    if (error) {
      console.error(
        "createSubscription error:",
        error
      );

      return {
        success: false,
        error: "Failed to create subscription plan.",
      };
    }

    return {
      success: true,
      data: mapSubscription(
        data as SubscriptionRow
      ),
    };
  } catch (error) {
    console.error(
      "createSubscription unexpected error:",
      error
    );

    return {
      success: false,
      error:
        "Something went wrong while creating the subscription plan.",
    };
  }
}

// -----------------------------------------------------------------------------
// UPDATE SUBSCRIPTION
// -----------------------------------------------------------------------------

export async function updateSubscription(
  id: string,
  input: SubscriptionFormData
): Promise<SubscriptionActionResult<Subscription>> {
  try {
    if (!id) {
      return {
        success: false,
        error: "Subscription ID is required.",
      };
    }

    const validation =
      subscriptionSchema.safeParse(input);

    if (!validation.success) {
      return {
        success: false,
        error:
          validation.error.issues[0]?.message ??
          "Invalid subscription data.",
      };
    }

    const values = validation.data;

    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("subscription_plans")
      .update({
        plan: values.plan,
        status: mapSubscriptionStatus(values.status),
        amount: values.amount,
        billing_cycle: mapBillingCycle(
          values.billingCycle
        ),
        start_date: values.startDate,
      })
      .eq("id", id)
      .select(`
        id,
        plan,
        status,
        amount,
        billing_cycle,
        start_date
      `)
      .single();

    if (error) {
      console.error(
        "updateSubscription error:",
        error
      );

      return {
        success: false,
        error:
          error.code === "PGRST116"
            ? "Subscription plan not found."
            : "Failed to update subscription plan.",
      };
    }

    return {
      success: true,
      data: mapSubscription(
        data as SubscriptionRow
      ),
    };
  } catch (error) {
    console.error(
      "updateSubscription unexpected error:",
      error
    );

    return {
      success: false,
      error:
        "Something went wrong while updating the subscription plan.",
    };
  }
}

// -----------------------------------------------------------------------------
// DELETE SUBSCRIPTION
// -----------------------------------------------------------------------------

export async function deleteSubscription(
  id: string
): Promise<SubscriptionActionResult> {
  try {
    if (!id) {
      return {
        success: false,
        error: "Subscription ID is required.",
      };
    }

    const supabase = createSupabaseServerClient();

    const { error } = await supabase
      .from("subscription_plans")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(
        "deleteSubscription error:",
        error
      );

      return {
        success: false,
        error: "Failed to delete subscription plan.",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "deleteSubscription unexpected error:",
      error
    );

    return {
      success: false,
      error:
        "Something went wrong while deleting the subscription plan.",
    };
  }
}